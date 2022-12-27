class AudioWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.audioBufferSize = 4096;
    this.audioBuffer = new Int16Array(this.audioBufferSize);
    this.shift = 0;
  }

  process(inputs) {
    // We always take first audio channel
    let inputArray = inputs[0][0];
    if (inputArray) {
      for (let i = 0; i < inputArray.length; i++) {
        // inputArray[i] is in range of [-1 .. 1], so we only need to multiply the value by Int16 min or max value
        this.audioBuffer[this.shift + i] = inputArray[i] < 0 ? inputArray[i] * 0x8000 : inputArray[i] * 0x7FFF;
      }
      this.shift += inputArray.length;

      // As for now, the input frame size is 128, check if shift is greater just in case
      // of future changes in AudioWorkletProcessor behaviour
      if (this.shift >= this.audioBufferSize) {
        this.shift = 0;
        this.port.postMessage({
          eventType: 'samples',
          samples: this.audioBuffer
        });
      }
    }
    return true;
  }
}

registerProcessor('audio-worklet', AudioWorklet);
