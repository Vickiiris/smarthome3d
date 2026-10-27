#!/usr/bin/env python3
"""
optimize-glb.py —— 压缩 GLB 内的贴图，几何（Draco）保持原样。

背景：model.glb 原始 15.3MB，其中 9.7MB 是贴图；占用最大的六张是
      「用 PNG 存的 1K roughness 贴图」（R=AO/B=metallic 恒为 255，只有 G 通道有信息）。

策略：
  - metallicRoughness(ORM)：降到 256px，保持 R/B 纯白，仅保留 G 的粗糙度信息，JPEG q80
  - normal：512px，JPEG q92，关闭色度二次采样（避免法线失真）
  - baseColor / emissive：512px，JPEG q82；带真实 alpha 时退回 PNG
  - 完全未被材质引用、或内容完全相同的贴图会被去重/丢弃

用法：
  python tools/optimize-glb.py public/models/model.glb public/models/model.glb
  python tools/optimize-glb.py in.glb out.glb --base-color 1024 --normal 512 --orm 256
"""
import argparse
import hashlib
import io
import json
import struct

from PIL import Image

GLB_MAGIC = 0x46546C67
CHUNK_JSON = 0x4E4F534A
CHUNK_BIN = 0x004E4942

SLOT_LABEL = {
    'baseColor': 'color',
    'normalTexture': 'normal',
    'metallicRoughness': 'orm',
    'occlusionTexture': 'orm',
    'emissiveTexture': 'emissive',
}


def read_glb(path):
    data = open(path, 'rb').read()
    magic, version, total = struct.unpack_from('<III', data, 0)
    assert magic == GLB_MAGIC, 'not a GLB file'
    offset = 12
    json_chunk, bin_chunk = None, b''
    while offset < total:
        clen, ctype = struct.unpack_from('<II', data, offset)
        payload = data[offset + 8: offset + 8 + clen]
        if ctype == CHUNK_JSON:
            json_chunk = json.loads(payload.decode('utf-8'))
        elif ctype == CHUNK_BIN:
            bin_chunk = payload
        offset += 8 + clen + ((4 - clen % 4) % 4 if clen % 4 else 0)
    return json_chunk, bin_chunk


def write_glb(path, gltf, bin_chunk):
    js = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    js += b' ' * ((4 - len(js) % 4) % 4)
    bn = bytes(bin_chunk) + b'\0' * ((4 - len(bin_chunk) % 4) % 4)
    total = 12 + 8 + len(js) + 8 + len(bn)
    out = bytearray()
    out += struct.pack('<III', GLB_MAGIC, 2, total)
    out += struct.pack('<II', len(js), CHUNK_JSON) + js
    out += struct.pack('<II', len(bn), CHUNK_BIN) + bn
    open(path, 'wb').write(out)


def image_slots(gltf):
    """image 索引 -> 用途集合"""
    textures = gltf.get('textures', [])
    slots = {}
    for mat in gltf.get('materials', []):
        refs = []
        pbr = mat.get('pbrMetallicRoughness', {})
        if 'baseColorTexture' in pbr:
            refs.append((pbr['baseColorTexture']['index'], 'baseColor'))
        if 'metallicRoughnessTexture' in pbr:
            refs.append((pbr['metallicRoughnessTexture']['index'], 'metallicRoughness'))
        for key in ('normalTexture', 'occlusionTexture', 'emissiveTexture'):
            if key in mat:
                refs.append((mat[key]['index'], key))
        for t_idx, slot in refs:
            src = textures[t_idx].get('source')
            if src is not None:
                slots.setdefault(src, set()).add(SLOT_LABEL.get(slot, slot))
    return slots


def resize_max(im, limit):
    w, h = im.size
    if max(w, h) <= limit:
        return im
    ratio = limit / float(max(w, h))
    return im.resize((max(1, round(w * ratio)), max(1, round(h * ratio))), Image.LANCZOS)


def has_real_alpha(im):
    if im.mode not in ('RGBA', 'LA', 'PA'):
        return False
    alpha = im.getchannel('A')
    lo, _ = alpha.getextrema()
    return lo < 250


def encode(im, fmt, quality, subsampling=None):
    buf = io.BytesIO()
    if fmt == 'jpeg':
        kwargs = {'quality': quality, 'optimize': True, 'progressive': False}
        if subsampling is not None:
            kwargs['subsampling'] = subsampling
        im.convert('RGB').save(buf, 'JPEG', **kwargs)
        return buf.getvalue(), 'image/jpeg'
    im.save(buf, 'PNG', optimize=True)
    return buf.getvalue(), 'image/png'


def optimize(src, dst, base_limit, normal_limit, orm_limit, quality_color, quality_normal, quality_orm):
    gltf, bin_chunk = read_glb(src)
    images = gltf.get('images', [])
    views = gltf.get('bufferViews', [])
    slots = image_slots(gltf)

    print(f'原始：{src}  {len(open(src, "rb").read()) / 1048576:.2f} MB')
    print(f'图片 {len(images)} 张，其中被材质引用 {len(slots)} 张')

    # ---------- 1. 逐张重编码 ----------
    encoded = {}
    dedupe = {}
    stats = []
    for idx, img in enumerate(images):
        if idx not in slots:
            continue
        usage = slots[idx]
        bv = views[img['bufferView']]
        start = bv.get('byteOffset', 0)
        raw = bin_chunk[start:start + bv['byteLength']]
        im = Image.open(io.BytesIO(raw))
        im.load()

        if 'orm' in usage:
            # R=AO、B=metallic 恒为 255，只有 G 是粗糙度 → 归一化后压 JPEG
            g = im.convert('RGB').getchannel('G')
            white = Image.new('L', im.size, 255)
            packed = Image.merge('RGB', (white, g, white))
            out = resize_max(packed, orm_limit)
            data, mime = encode(out, 'jpeg', quality_orm, subsampling=2)
        elif 'normal' in usage:
            out = resize_max(im.convert('RGB'), normal_limit)
            data, mime = encode(out, 'jpeg', quality_normal, subsampling=0)
        else:
            limit = base_limit if 'color' in usage else orm_limit
            out = resize_max(im, limit)
            if has_real_alpha(out):
                data, mime = encode(out, 'png', 100)
            else:
                data, mime = encode(out, 'jpeg', quality_color, subsampling=2)

        digest = hashlib.sha1(data).hexdigest()
        if digest in dedupe:
            encoded[idx] = ('dedupe', dedupe[digest], mime)
        else:
            dedupe[digest] = idx
            encoded[idx] = ('data', data, mime)
        stats.append((bv['byteLength'], len(encoded[idx][1]) if encoded[idx][0] == 'data' else 0,
                      img.get('name', f'image{idx}'), '+'.join(sorted(usage))))

    # ---------- 2. 重建二进制块 ----------
    image_view_ids = {img['bufferView'] for img in images if 'bufferView' in img}
    new_bin = bytearray()

    for i, bv in enumerate(views):
        if i in image_view_ids:
            continue
        start = bv.get('byteOffset', 0)
        chunk = bin_chunk[start:start + bv['byteLength']]
        pad = (4 - len(new_bin) % 4) % 4
        new_bin += b'\0' * pad
        bv['byteOffset'] = len(new_bin)
        bv['byteLength'] = len(chunk)
        new_bin += chunk

    for idx, img in enumerate(images):
        if idx not in slots:
            continue
        kind, payload, mime = encoded[idx]
        if kind == 'dedupe':
            src_view = views[images[payload]['bufferView']]
            views[img['bufferView']]['byteOffset'] = src_view['byteOffset']
            views[img['bufferView']]['byteLength'] = src_view['byteLength']
        else:
            pad = (4 - len(new_bin) % 4) % 4
            new_bin += b'\0' * pad
            views[img['bufferView']]['byteOffset'] = len(new_bin)
            views[img['bufferView']]['byteLength'] = len(payload)
            new_bin += payload
        img['mimeType'] = mime

    gltf['buffers'][0]['byteLength'] = len(new_bin)
    write_glb(dst, gltf, new_bin)

    before = len(open(src, 'rb').read())
    after = len(open(dst, 'rb').read())
    print(f'\n处理后：{dst}  {after / 1048576:.2f} MB  （{before / 1048576:.2f} → {after / 1048576:.2f} MB，'
          f'减少 {(1 - after / before) * 100:.1f}%）')

    stats.sort(key=lambda r: -r[0])
    print('\n体积 Top 8（处理前 → 处理后）')
    for b, a, name, usage in stats[:8]:
        print(f'  {b / 1024:7.0f} KB → {a / 1024:6.1f} KB   {name}  [{usage}]')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('dst')
    ap.add_argument('--base-color', type=int, default=512)
    ap.add_argument('--normal', type=int, default=512)
    ap.add_argument('--orm', type=int, default=256)
    ap.add_argument('--q-color', type=int, default=82)
    ap.add_argument('--q-normal', type=int, default=92)
    ap.add_argument('--q-orm', type=int, default=80)
    a = ap.parse_args()
    optimize(a.src, a.dst, a.base_color, a.normal, a.orm, a.q_color, a.q_normal, a.q_orm)
