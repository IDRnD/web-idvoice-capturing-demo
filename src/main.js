import { createApp } from 'vue/dist/vue.esm-bundler'
import App from './App'

const RootComponent = {
  el: '#app',
  components: { App },
  template: '<App/>'
}
const app = createApp(RootComponent)
app.mount('#app')
