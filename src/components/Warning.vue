<template>
  <div class="warning-msg">
  <i class="fa fa-warning"></i>
    It seems you have some issues with the microphone
  </div>
</template>

<script>
export default {
  name: "Warning",
  mounted() {
    const self = this;
    setTimeout(function() {
      self.$emit('close');
    }, 6000)
  }
}
</script>

<style scoped>
.warning-msg {
  top: 10px;
  padding: 10px;
  position: absolute;
  z-index: 10;
  border-radius: 5px;
  width: 100%;
  animation: warning-in 1s ease, warning-out 1s ease 5s;
}
.warning-msg {
  color: #9F6000;
  background-color: #FEEFB3;
}
@keyframes warning-in {
  from { top: -50px; }
  to { top: 10px; }
}
@keyframes warning-out {
  from { top: 10px; }
  to { top: -50px; }
}
</style>
