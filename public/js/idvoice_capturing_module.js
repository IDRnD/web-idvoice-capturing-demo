import createVoiceSdkModule from './VoiceSdkWebAssembly'

let speechEndpointDetector;
let speechSummaryEngine;
let speechSummaryStream;
let snrComputer;

export class IDVoiceCapturingModule {
  constructor(minSpeechLengthMs, maxSilenceLengthMs, onRecorderReady, onSpeechLength, onRecordingStopped) {
    this.audioBuffers = [];
    this.numRecordedSamples = 0;
    this.onSpeechLength = onSpeechLength;
    this.onRecordingStopped = onRecordingStopped;
    this.minSpeechLengthMs = minSpeechLengthMs;
    this.isRecorderReady = false;
    this.isRecording = false;

    let self = this;

    let audioConstraints = { 
      noiseSuppression: false,
      echoCancellation: false,
      autoGainControl: false
    }

    navigator.mediaDevices.getUserMedia({ audio: audioConstraints}).then(function(stream) {
      self.context = new AudioContext();
      self.audioInput = self.context.createMediaStreamSource(stream);
      self.context.audioWorklet.addModule('js/audio_worklet.js').then(() => {
        createVoiceSdkModule().then((voicesdk) => {
          try {
            self.handleVoiceSdkError = (error) => {
              if (typeof error === 'number') {
                throw voicesdk.getExceptionMessage(error);
              } else {
                throw error;
              }
            };
            speechEndpointDetector = new voicesdk.SpeechEndpointDetector(minSpeechLengthMs, maxSilenceLengthMs,
                                                                         self.getRecordingSampleRate());
            speechSummaryEngine = new voicesdk.SpeechSummaryEngine("/home/speech_summary");
            speechSummaryStream = speechSummaryEngine.createStream(self.getRecordingSampleRate());
            snrComputer = new voicesdk.SnrComputer("/home/speech_summary");
          } catch (error) {
            self.handleVoiceSdkError(error);
          }
          self.isRecorderReady = true;
          onRecorderReady();
        });
      });
    });
  }

  destroy() {
    this.manuallyStopRecording();
    this.audioRecordingNode = null;
    this.audioInput = null;
    this.context = null;
    this.audioInput = null;
    this.audioBuffers = null;
    speechEndpointDetector.delete();
    speechEndpointDetector = null;
    speechSummaryStream.delete();
    speechSummaryStream = null;
    speechSummaryEngine.delete();
    speechSummaryEngine = null;
    snrComputer.delete();
    snrComputer = null;
  }

  processAudioBuffer(pcm16Samples) {
    this.audioBuffers.push(pcm16Samples);
    this.numRecordedSamples += pcm16Samples.length;
    try {
      speechEndpointDetector.addPcm16Samples(pcm16Samples);
      speechSummaryStream.addPcm16Samples(pcm16Samples);
      var speechLength = speechSummaryStream.getTotalSpeechSummary().speechInfo.speechLengthMs;
    } catch (error) {
      this.handleVoiceSdkError(error);
    }
    this.onSpeechLength(speechLength);
    if (speechLength >= this.minSpeechLengthMs && speechEndpointDetector.isSpeechEnded()) {
      this.manuallyStopRecording();
      this.onRecordingStopped();
    }
  }

  startRecording() {
    if (!this.isRecorderReady) {
      throw "Recorder is not ready yet, use onRecorderReady() callback to check";
    }
    if (this.isRecording) {
      throw "Recorder is already recording";
    }
    speechSummaryStream.reset();
    speechEndpointDetector.reset();
    this.numRecordedSamples = 0;
    this.audioBuffers = [];
    this.isRecording = true;
    this.audioRecordingNode = new AudioWorkletNode(this.context, 'audio-worklet');
    this.audioInput.connect(this.audioRecordingNode);
    this.audioRecordingNode.connect(this.context.destination);
    this.audioRecordingNode.port.onmessage = (e) => {
      if (e.data.eventType === 'samples') {
        this.processAudioBuffer(e.data.samples);
      }
    }
  }

  manuallyStopRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this.audioInput.disconnect(this.audioRecordingNode);
      this.audioRecordingNode.disconnect(this.context.destination);
    }
  }

  // Audio obtained with this method can be used for making requests to
  // IDVoice Server, e.g. /voice_template_factory/create_voice_template_from_samples
  async getRecordedAudioPcm16Samples() {
    let audio = new Int16Array(this.numRecordedSamples);
    let offset = 0;
    for (let i = 0; i < this.audioBuffers.length; i++) {
      audio.set(this.audioBuffers[i], offset);
      offset += this.audioBuffers[i].length;
    }
    return audio;
  }

  getRecordingSampleRate() {
    return this.context.sampleRate;
  }

  async checkRecordedAudioQuality(speechLengthThresholdMs, snrThresholdDb) {
    let samples = await this.getRecordedAudioPcm16Samples();
    let sampleRate = this.getRecordingSampleRate();
    try {
      let result = {};
      result.speechLengthMs = speechSummaryEngine.getSpeechSummaryFromPcm16Samples(samples, sampleRate).speechInfo.speechLengthMs;
      result.snrDb = snrComputer.computeFromPcm16Samples(samples, sampleRate);
      result.message = "OK";
      if (result.speechLengthMs < speechLengthThresholdMs) {
        result.message = "QUALITY_TOO_SMALL_SPEECH_TOTAL_LENGTH";
      } else if (result.snrDb < snrThresholdDb) {
        result.message = "QUALITY_TOO_NOISY";
      }
      return result;
    } catch (error) {
      this.handleVoiceSdkError(error);
    }
  }
}
