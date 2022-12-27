<template>
  <div class="modal-container">
    <div v-if="!isRecordingFinished" class="recording">
      <h4 >Please, say something...</h4>
      <div class="mic"></div>
    </div>
    <progress-ring :percent="speechLengthPercentage" :ranges="progressRingRanges"/>
    <p class="scale">{{ Math.ceil(speechLengthPercentage) + '%' }}</p>
    <div v-if="isRecordingFinished">
      <h3 v-for="(line, index) in recordingResult.messages" v-bind:key="index" :class="{ success: recordingResult.isSuccessfull, first: index === 0 }">
        {{ line }}
      </h3>
    </div>
    <button v-if="isRecordingFinished" class="close" @click="close">Close</button>
  </div>
</template>

<script>
  import ProgressRing from './ProgressRing';

  export default {
    name: "Modal",
    props: {
      requiredSpeechLengthMs: Number,
      collectedSpeechLengthMs: Number,
      isRecordingFinished: Boolean,
      isRecordingAborted: Boolean,
      recordingResult: Object
    },
    data() {
      return {
        progressRingRanges: [40, 70]
      }
    },
    computed: {
      speechLengthPercentage: function() {
        return Math.min(this.collectedSpeechLengthMs / this.requiredSpeechLengthMs * 100, 100);
      }
    },
    watch: {
      isRecordingAborted: function(val) {
        if (val) {
          this.close();
        }
      }
    },
    methods: {
      close() {
        this.$emit('close');
      }
    },
    components: {
      "progress-ring": ProgressRing
    }
  }
</script>

<style scoped>
  .modal-container {
    background-color: #fff;
    position: absolute;
    top: 256px;
    z-index: 3;
    margin: auto;
    width: 100%;
    padding: 5vh;
    border-radius: 5px;
  }
  .recording {
    display: flex;
    justify-content: space-around;
  }
  h4 {
    margin-bottom: 0;
  }
  .mic {
    float: left;
    width: 22px;
    height: 40px;
    background: url('../assets/mic.png') no-repeat;
    background-size: 100%;
    animation: blink 2s ease-in-out infinite;
  }
  @keyframes blink {
    50% { opacity: 0 }
    100% { opacity: 1 }
  }
  .scale {
    margin-top: -77px;
    color: rgb(102, 122, 135);
    font-weight: 600;
  }
  .success {
    color: #32cd32;
  }
  button {
    height: 44px;
    width: 100px;
    border: none;
    border-radius: 22px;
    background-color: #50C99C;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    outline: none;
    cursor: pointer;
  }
  .close {
    background-color: rgb(102, 122, 135);
  }
  .first {
    margin-top: 44px;
  }
  @media screen and (orientation: portrait) and (max-height: 850px) {
    .modal-container {
      display: block;
      margin: auto;
      top: 35vh;
      width: 100vw;
      height: 70vh;
      border-radius: 20px;
    }
  }
  @media screen and (orientation: landscape) and (max-height: 450px) {
    .modal-container {
      display: block;
      margin: auto;
      top: 7vh;
      width: 100vmin;
      height: 86vh;
      border-radius: 20px;
    }
  }
  @media screen and (orientation: landscape) and (max-height: 320px) {
    .modal-container {
      top: 5vh;
      height: 90vh;
    }
    h4 {
      font-size: 14px;
      margin: 10px 0 0 0;
    }
  }
</style>
