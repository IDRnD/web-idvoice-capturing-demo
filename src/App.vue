<template>
  <div id="app">
    <main-component />
  </div>
</template>

<script>
import Main from './components/Main'

export default {
  name: 'App',
  components: {
    'main-component': Main
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #f7f8fa;
}
html {
  box-sizing: border-box;
}
*, *:before, *:after {
  box-sizing: inherit;
}
body {
  margin: 0;
  width: 100vw;
}
</style>
