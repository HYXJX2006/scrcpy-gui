import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import naive from 'naive-ui'
import App from './App.vue'
import 'unocss'
import './styles/global.css'

// Views
import HomeView from './views/HomeView.vue'
import MirrorView from './views/MirrorView.vue'
import SettingsView from './views/SettingsView.vue'
import PresetsView from './views/PresetsView.vue'
import AboutView from './views/AboutView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/mirror', name: 'mirror', component: MirrorView },
  { path: '/settings', name: 'settings', component: SettingsView },
  { path: '/presets', name: 'presets', component: PresetsView },
  { path: '/about', name: 'about', component: AboutView }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(naive)
app.mount('#app')
