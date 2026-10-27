import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import AppIcon from './components/common/AppIcon.vue'
import './assets/styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('AppIcon', AppIcon)

app.mount('#app')

// Vue 挂载完成后通知加载器 Vue 已就绪
if (typeof window.__vueReady === 'function') {
  window.__vueReady()
}
