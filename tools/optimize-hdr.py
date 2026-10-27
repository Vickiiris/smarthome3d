#!/usr/bin/env python3
"""
optimize-hdr.py —— 把 Radiance .hdr 环境贴图降采样并重新 RLE 压缩。

用途：skybox_box.hdr 原始 4.6MB（3840x1920），只用来给 PMREM 生成柔和的环境反射，
      PMREM 本身会做模糊，512 级别完全够用，体积可降到几百 KB 而观感几乎不变。

实现要点（相比逐像素版本）：
  1. 解码用 bytearray 切片拷贝，不再为每个 RLE 包创建 numpy 数组，快两个数量级
  2. 降采样用 reshape + sum 做真正的盒式平均（先按整数倍下采样，再线性插值到目标尺寸）
  3. 先写临时文件再 os.replace，任何一步失败都不会破坏目标文件
  4. 写完回读校验尺寸与像素，避免出现「0 字节 / 半截文件」

用法：
  python tools/optimize-hdr.py public/texture/skybox_box.hdr public/texture/skybox_box.hdr --size 512

依赖：numpy
"""
import argparse
import os
import sys
import tempfile

import numpy as np


def parse_header(data):
    """返回 (width, height, 像素数据起始偏移)"""
    pos = 0
    lines = 0
    while lines < 32:                      # 头里以空行结束，加个上限防脏数据死循环
        end = data.index(b'\n', pos)
        line = data[pos:end].strip()
        pos = end + 1
        lines += 1
        if line == b'':
            break
    end = data.index(b'\n', pos)
    dims = data[pos:end].split()           # b'-Y 1920 +X 3840'
    pos = end + 1
    height, width = int(dims[1]), int(dims[3])
    return width, height, pos


def decode_row(data, pos, width):
    """解码一行 RGBE，返回 (uint8[width,4], 新偏移)。支持标准 new-RLE 与扁平扫描线。"""
    # new-RLE 扫描线：0x02 0x02 then width(2 bytes, big endian)
    if data[pos] == 2 and data[pos + 1] == 2 and ((data[pos + 2] << 8) | data[pos + 3]) == width:
        pos += 4
        planes = []
        for _ in range(4):
            plane = bytearray(width)
            x = 0
            while x < width:
                count = data[pos]
                pos += 1
                if count > 128:            # 游程
                    run = count - 128
                    plane[x:x + run] = data[pos:pos + 1] * run
                    pos += 1
                else:                      # 字面量
                    plane[x:x + count] = data[pos:pos + count]
                    pos += count
                x += count if count <= 128 else count - 128
            planes.append(plane)
        # 四个通道是分开存的，必须按列组装回 RGBE 像素，直接拼接会串色
        row = np.stack([np.frombuffer(bytes(p), dtype=np.uint8, count=width) for p in planes], axis=1)
        return row, pos

    # 旧式扁平扫描线：直接 width*4 字节
    total = width * 4
    row = np.frombuffer(data, dtype=np.uint8, count=total, offset=pos).reshape(width, 4).copy()
    return row, pos + total


def rgbe_to_float(row):
    """uint8[w,4] -> float32[w,3]"""
    e = row[:, 3].astype(np.float32)
    scale = np.where(e > 0, np.exp2(e - 128) / 256.0, 0.0).astype(np.float32)
    return row[:, :3].astype(np.float32) * scale[:, None]


def float_to_rgbe(rgb):
    """float32[h,w,3] -> uint8[h,w,4]，对 inf/nan 做安全处理"""
    rgb = np.nan_to_num(rgb, nan=0.0, posinf=0.0, neginf=0.0)
    rgb = np.maximum(rgb, 0.0)
    m = rgb.max(axis=-1)
    out = np.zeros(rgb.shape[:2] + (4,), dtype=np.uint8)
    nz = m > 1e-8
    safe = np.where(nz, m, 1.0)
    mant, expo = np.frexp(safe)
    scale = np.where(nz, mant * 256.0 / safe, 0.0)
    out[..., :3] = np.clip(rgb * scale[..., None], 0, 255).astype(np.uint8)
    out[..., 3] = np.where(nz, np.clip(expo + 128, 0, 255), 0).astype(np.uint8)
    return out


def rle_encode_channel(channel):
    """Radiance 标准 RLE。

    约定：连续 >=4 个相同字节用「游程」编码，否则按字面量打包（单包最多 128 字节）。
    每个分支都保证至少前进 1 字节，因此不会出现游程 <4 时反复输出 0 长度包的死循环。
    """
    ch = bytes(channel)
    n = len(ch)
    out = bytearray()
    i = 0
    while i < n:
        # 统计 i 处相同字节的连续个数（上限 127，游程包最多表示 127）
        run = 1
        while i + run < n and run < 127 and ch[i + run] == ch[i]:
            run += 1

        if run >= 4:
            out.append(128 + run)
            out.append(ch[i])
            i += run
            continue

        # 字面量：一直取到「下一个 >=4 游程」开始处，或满 128 字节
        j = i
        while j < n and (j - i) < 128:
            if (j + 3 < n and ch[j] == ch[j + 1] == ch[j + 2] == ch[j + 3]):
                break
            j += 1
        if j == i:          # 理论上不会发生，兜底保证前进
            j = i + 1
        out.append(j - i)
        out += ch[i:j]
        i = j
    return out



def write_hdr(path, rgbe):
    """写标准 new-RLE HDR（宽 < 32768）"""
    height, width = rgbe.shape[:2]
    buf = bytearray()
    buf += b'#?RADIANCE\n'
    buf += b'FORMAT=32-bit_rle_rgbe\n\n'
    buf += b'-Y %d +X %d\n' % (height, width)
    for y in range(height):
        buf += bytes((2, 2, width >> 8, width & 0xFF))
        row = rgbe[y]
        for c in range(4):
            buf += rle_encode_channel(row[:, c])
    with open(path, 'wb') as f:
        f.write(buf)
        f.flush()
        os.fsync(f.fileno())


def decode_all(data, width, height, pos, rows=None):
    """解码整幅（或前 rows 行）到 float32[h,w,3]"""
    h = height if rows is None else min(rows, height)
    out = np.zeros((h, width, 3), dtype=np.float32)
    for y in range(h):
        row, pos = decode_row(data, pos, width)
        out[y] = rgbe_to_float(row)
    return out, pos


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('dst')
    ap.add_argument('--size', type=int, default=512, help='目标宽度（像素）')
    ap.add_argument('--keep-ratio', action='store_true', help='保持原始宽高比（默认按宽度算，高度取整）')
    a = ap.parse_args()

    data = open(a.src, 'rb').read()
    before = len(data)
    w, h, pos = parse_header(data)
    print(f'原始：{w}x{h}  {before / 1024:.0f} KB', flush=True)

    # 整数倍盒式平均（先缩到目标附近），再线性插值到精确目标尺寸
    scale = max(1, int(round(w / a.size)))
    dw, dh = w // scale, h // scale
    print(f'解码中…（{scale}x 下采样 → {dw}x{dh}）', flush=True)

    out_rgb = np.zeros((dh, dw, 3), dtype=np.float64)
    acc = np.zeros((dw, 3), dtype=np.float64)
    for y in range(dh * scale):
        row, pos = decode_row(data, pos, w)
        rgb = rgbe_to_float(row).astype(np.float64)   # HDR 动态范围大，float32 求和会溢出
        acc += rgb.reshape(dw, scale, 3).sum(axis=1)
        if y % scale == scale - 1:
            out_rgb[y // scale] = acc / (scale * scale)
            acc[:] = 0
        if y % (scale * 64) == 0:
            print(f'  {y / h * 100:5.1f}%', flush=True)

    # 目标尺寸（宽度=a.size，高度按比例）
    tw = a.size
    th = max(1, int(round(h * (tw / w))))
    if (tw, th) != (dw, dh):
        ys = np.linspace(0, dh - 1, th)
        xs = np.linspace(0, dw - 1, tw)
        y0 = np.floor(ys).astype(int); y1 = np.minimum(y0 + 1, dh - 1); wy = (ys - y0)[:, None, None]
        x0 = np.floor(xs).astype(int); x1 = np.minimum(x0 + 1, dw - 1); wx = (xs - x0)[None, :, None]
        top = out_rgb[y0][:, x0] * (1 - wx) + out_rgb[y0][:, x1] * wx
        bot = out_rgb[y1][:, x0] * (1 - wx) + out_rgb[y1][:, x1] * wx
        out_rgb = top * (1 - wy) + bot * wy

    rgbe = float_to_rgbe(out_rgb)
    print(f'已缩放到 {out_rgb.shape[1]}x{out_rgb.shape[0]}，编码中…', flush=True)

    # 原子写：先写同目录临时文件，成功后替换
    dst_dir = os.path.dirname(os.path.abspath(a.dst)) or '.'
    fd, tmp = tempfile.mkstemp(suffix='.hdr', dir=dst_dir)
    os.close(fd)
    try:
        write_hdr(tmp, rgbe)
        after = os.path.getsize(tmp)

        # 回读校验：尺寸 + 抽几个像素比对（RLE 编码/解码自洽性）
        chk = open(tmp, 'rb').read()
        cw, chh, cpos = parse_header(chk)
        if (cw, chh) != (out_rgb.shape[1], out_rgb.shape[0]):
            raise SystemExit(f'校验失败：尺寸不符 {cw}x{chh}')
        sample, _ = decode_row(chk, cpos, cw)
        if not np.array_equal(sample, rgbe[0]):
            raise SystemExit('校验失败：首行像素回读不一致')

        os.replace(tmp, a.dst)
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)

    print(f'处理后：{a.dst}  {after / 1024:.0f} KB  '
          f'（{before / 1024:.0f} KB → {after / 1024:.0f} KB，减少 {(1 - after / before) * 100:.0f}%）')
    print('回读校验通过 ✓')


if __name__ == '__main__':
    sys.exit(main())
