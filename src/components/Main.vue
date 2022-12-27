<template>
  <div class="container">
    <div class="logo"></div>
    <modal :requiredSpeechLengthMs="requiredSpeechLengthForSpeechEndDetection"
           :collectedSpeechLengthMs="collectedSpeechLengthMs"
           :isRecordingFinished="isRecordingFinished"
           :isRecordingAborted="isRecordingAborted"
           :recordingResult="recordingResult"
           v-if="isModalVisible"
           @close="closeModal"/>
    <h1>IDVoice Web Audio Capturing Demo</h1>
    <button :disabled="isPreparing" @click="startRecording">Capture audio</button>
    <warning v-if="isWarningVisible" @close="closeWarning" />
    <button class="mask" v-if="isModalVisible" @click="abortRecording"></button>
  </div>
</template>

<script>
  import { IDVoiceCapturingModule } from '../../public/js/idvoice_capturing_module.js';
  import Modal from './Modal'
  import Warning from './Warning'

  export default {
    name: 'Main',
    data () {
      return {
        isRecordingFinished: false,
        isRecordingAborted: false,
        isPreparing: true,
        isRecording: false,
        isWarningVisible: false,
        isModalVisible: false,
        warningTimeout: null,
        // While we need exactly requiredSpeechLengthMs milliseconds of speech, we adjust this requirements
        // for speech endpoint detection, because the online speech length estimation is less accurate than
        // the offline one which is used for quality checking 
        requiredSpeechLengthForSpeechEndDetection: 1500,
        requiredSpeechLengthMs: 1000,
        requiredSnrDb: 8.5,
        collectedSpeechLengthMs: 0,
        recordingResult: {
          isSuccessfull: false,
          messages: []
        },
        capturingModule: null
      }
    },
    mounted() {
      const self = this;
      this.warningTimeout = setTimeout(function() {
        self.isWarningVisible = true;
      }, 8000)
      const passSpeechLength = (speechLength) => {
        this.collectedSpeechLengthMs = speechLength;
      };
      const stopPreparing = () => {
        this.isPreparing = false;
        clearTimeout(this.warningTimeout);
      };
      const recordingStopped = () => {
        this.recordingResult = {
          isSuccessfull: false,
          messages: []
        };
        this.capturingModule.checkRecordedAudioQuality(this.requiredSpeechLengthMs, this.requiredSnrDb).then((qualityCheckResult) => {
        if (qualityCheckResult.message === "QUALITY_TOO_SMALL_SPEECH_TOTAL_LENGTH") {
            this.recordingResult.messages.push("Not enough speech, please try again");
            this.recordingResult.isSuccessfull = false;
          } else if (qualityCheckResult.message === "QUALITY_TOO_NOISY") {
            this.recordingResult.messages.push("The environment is too noisy, please try again in a quiet place");
            this.recordingResult.isSuccessfull = false;
          } else {
            this.recordingResult.messages.push("Quality check passed successfully!");
            this.recordingResult.isSuccessfull = true;
          }
          let snr = qualityCheckResult.snrDb.toFixed(1);
          let speechLength = (qualityCheckResult.speechLengthMs / 1000).toFixed(1);
          this.recordingResult.messages.push(`Singal-to-noise ratio: ${snr} dB`);
          this.recordingResult.messages.push(`Speech length: ${speechLength} s`);
          this.isRecordingFinished = true;
          this.isRecording = false;
        });
      };
      this.isPreparing = true;
      this.capturingModule = new IDVoiceCapturingModule(this.requiredSpeechLengthForSpeechEndDetection, 500,
                                                        stopPreparing, passSpeechLength, recordingStopped);
    },
    unmounted() {
      this.capturingModule.destroy();
    },
    methods: {
      startRecording() {
        this.capturingModule.startRecording();
        this.isRecordingFinished = false;
        this.isRecording = true;
        this.isModalVisible = true;
      },
      abortRecording() {
        if (this.isRecording) {
          this.capturingModule.manuallyStopRecording();
          this.collectedSpeechLengthMs = 0;
          this.isRecordingAborted = true;
          this.isRecording = false;
        }
        this.isModalVisible = false;
      },
      closeWarning() {
        this.isWarningVisible = false;
      },
      closeModal() {
        this.isModalVisible = false;
      }
    },
    components: {
      'modal': Modal,
      'warning': Warning
    }
  }
</script>

<style scoped>
  .container {
    margin: auto;
    width: 100vmin;
    height: 500px;
    max-width: 500px;
    min-height: 100vh;
    position: relative;
    top: 0;
  }
  .logo {
    display: inline-block;
    margin-left: -30px;
    margin-top: 50px;
    width: 539px;
    height: 200px;
    background: url("../assets/logo.png");
  }
  .mask {
    position: fixed;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    border: none;
    background-color: rgba(0, 0, 0, 0.7);
  }
  h1 {
    color: #50C99C;
    width: calc(100% - 33px);
    font-size: 25px;
    text-align: center;
    margin-bottom: 43px;
  }
  button {
    width: calc(50% - 32px);
    height: 50px;
    border: none;
    border-radius: 25px;
    background-color: #50C99C;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    outline: none;
    cursor: pointer;
  }
  button:disabled {
    background-color: rgb(204, 204, 204);
    color: rgb(102, 102, 102);
  }
  @media screen and (orientation: landscape) and (max-height: 450px) {
    .logo {
      width: 120px;
      height: 120px;
      background-size: 120px;
      margin-top: 30px;
    }
  }
  @media screen and (orientation: landscape) and (max-height: 320px) {
    h4, h3, h1 {
      font-size: 16px;
    }
    .logo {
      width: 100px;
      height: 100px;
      background-size: 100px;
    }
  }
</style>
