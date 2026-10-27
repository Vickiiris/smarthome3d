/**
 * 时间显示工具
 *
 * 背景：告警数据里的时间字段有三种写法（'15:20' / '昨日' / '前日'），
 * 直接渲染会出现「5.29、2:15、1.06」这种读不出含义的混排。
 * 这里统一解析成 Date，对外只暴露「相对时间 + 绝对时间」两种展示。
 */

/** 把告警里的时间字段解析成 Date（无法解析时返回 null） */
export function parseAlarmTime(value, now = new Date()) {
  if (value === null || value === undefined) return null
  const s = String(value).trim()

  // 15:20 —— 当作今天；若晚于当前时刻，说明是昨天这个点
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(':').map(Number)
    const d = new Date(now)
    d.setHours(h, m, 0, 0)
    if (d.getTime() > now.getTime()) d.setDate(d.getDate() - 1)
    return d
  }
  if (s === '昨日' || s === '昨天') {
    const d = new Date(now)
    d.setDate(d.getDate() - 1)
    d.setHours(20, 0, 0, 0)
    return d
  }
  if (s === '前日' || s === '前天') {
    const d = new Date(now)
    d.setDate(d.getDate() - 2)
    d.setHours(10, 0, 0, 0)
    return d
  }
  return null
}

const pad = n => String(n).padStart(2, '0')

/** 2026-10-26 15:20 */
export function formatAbsoluteTime(date) {
  if (!date) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** 刚刚 / 12 分钟前 / 3 小时前 / 昨天 21:40 / 10月24日 21:40 */
export function formatRelativeTime(date, now = new Date()) {
  if (!date) return ''
  const diff = now.getTime() - date.getTime()
  if (diff < 0) return formatClock(date)
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`

  const sameDay = date.toDateString() === now.toDateString()
  if (sameDay) return `${Math.floor(min / 60)} 小时前`

  const y = new Date(now)
  y.setDate(y.getDate() - 1)
  if (date.toDateString() === y.toDateString()) return `昨天 ${formatClock(date)}`

  return `${date.getMonth() + 1}月${date.getDate()}日 ${formatClock(date)}`
}

function formatClock(d) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 一步到位：给原始时间字段，返回 { label, title } */
export function alarmTimeLabel(value, now = new Date()) {
  const d = parseAlarmTime(value, now)
  if (!d) return { label: value || '', title: '' }
  return { label: formatRelativeTime(d, now), title: formatAbsoluteTime(d) }
}
