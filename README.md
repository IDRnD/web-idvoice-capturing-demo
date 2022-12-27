IDVoice Web Audio Capturing Demo
================================

This is a web demo application for ID R&D's IDVoice product showing the process of capturing audio for
voice enrollment or verification. It consists of the following stages:
- Browser request for media device, such as microphone, from the user
- Voice recording with real-time spech length estimation
- Quality checking for the entire record at once, at the end of recording process

## Project setup

First, you need to unpack IDVoice SDK artifacts to the `public/js` folder, so that it
looked like this:
```
public/js
├── VoiceSdkWebAssembly.js
├── VoiceSdkWebAssembly.wasm
├── audio_worklet.js
└── idvoice_capturing_module.js
```

Then you should install the required JavaScript modules:
```bash
$ npm install
```

After that you can either run a development server or compile the application to static HTML.

### Compiles and hot-reloads for development
```bash
$ npx vue-cli-service serve --https
```

Please note that HTTPS connection is required for recording audio.

### Compiles and minifies for production
```bash
$ npm run build
```

## Standalone capturing module usage

You can easily extract the audio capturing module for standalone usage in your own application - just
copy the `public/js` folder as is (including the aforementioned IDVoice SDK artifacts).

In addition to this, you can find the usage example for audio capturing module in the `src/components/Main.vue`.
