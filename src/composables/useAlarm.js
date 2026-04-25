import { ref, computed, watch } from 'vue'

export function useAlarm(allAlarms, strategies) {
  const alarmTab = ref('device')
  const alarmSearch = ref('')
  const alarmLevelFilter = ref('')
  const alarmStatusFilter = ref('')
  const alarmPage = ref(1)
  const strategyPage = ref(1)
  const PAGE_SIZE = 8
  const STRATEGY_PAGE_SIZE = 8
  const strategyDetailVisible = ref(false)
  const selectedStrategy = ref(null)

  function switchAlarmTab(tab) { alarmTab.value = tab; alarmPage.value = 1; strategyPage.value = 1; alarmSearch.value = ''; alarmLevelFilter.value = ''; alarmStatusFilter.value = '' }
  function resolveAlarm(alarm) { alarm.status = 'done'; alarm.statusText = '已处理' }
  function markAllAlarmsDone() { filteredAlarms.value.forEach(a => { a.status = 'done'; a.statusText = '已处理' }) }
  function clearDoneAlarms() { allAlarms.value = allAlarms.value.filter(a => a.status === 'pending'); alarmPage.value = 1 }
  function openStrategyDetail(s) { selectedStrategy.value = s; strategyDetailVisible.value = true }

  const filteredAlarms = computed(() => {
    let list = allAlarms.value.filter(a => a.type === alarmTab.value)
    if (alarmSearch.value) { const q = alarmSearch.value.toLowerCase(); list = list.filter(a => a.content.toLowerCase().includes(q) || a.source.toLowerCase().includes(q)) }
    if (alarmLevelFilter.value) list = list.filter(a => a.level === alarmLevelFilter.value)
    if (alarmStatusFilter.value) list = list.filter(a => a.status === alarmStatusFilter.value)
    return list
  })

  const paginatedAlarms = computed(() => filteredAlarms.value.slice((alarmPage.value - 1) * PAGE_SIZE, alarmPage.value * PAGE_SIZE))
  const alarmTotalPages = computed(() => Math.max(1, Math.ceil(filteredAlarms.value.length / PAGE_SIZE)))
  const visiblePages = computed(() => {
    const tp = alarmTotalPages.value, cp = alarmPage.value
    if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
    const pages = [1]; if (cp > 3) pages.push('…')
    for (let p = Math.max(2, cp - 1); p <= Math.min(tp - 1, cp + 1); p++) pages.push(p)
    if (cp < tp - 2) pages.push('…'); pages.push(tp); return pages
  })

  const paginatedStrategies = computed(() => strategies.value.slice((strategyPage.value - 1) * STRATEGY_PAGE_SIZE, strategyPage.value * STRATEGY_PAGE_SIZE))
  const strategyTotalPages = computed(() => Math.max(1, Math.ceil(strategies.value.length / STRATEGY_PAGE_SIZE)))
  const visibleStrategyPages = computed(() => {
    const tp = strategyTotalPages.value, cp = strategyPage.value
    if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
    const pages = [1]; if (cp > 3) pages.push('…')
    for (let p = Math.max(2, cp - 1); p <= Math.min(tp - 1, cp + 1); p++) pages.push(p)
    if (cp < tp - 2) pages.push('…'); pages.push(tp); return pages
  })

  watch([alarmSearch, alarmLevelFilter, alarmStatusFilter], () => { alarmPage.value = 1 })

  return {
    alarmTab, alarmSearch, alarmLevelFilter, alarmStatusFilter,
    alarmPage, strategyPage, PAGE_SIZE, STRATEGY_PAGE_SIZE,
    strategyDetailVisible, selectedStrategy,
    switchAlarmTab, resolveAlarm, markAllAlarmsDone, clearDoneAlarms, openStrategyDetail,
    filteredAlarms, paginatedAlarms, alarmTotalPages, visiblePages,
    paginatedStrategies, strategyTotalPages, visibleStrategyPages,
  }
}
