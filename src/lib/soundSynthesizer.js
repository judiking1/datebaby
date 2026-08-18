// soundSynthesizer.js - Web Audio API 기반 오프라인 사운드 합성기
// 네트워크 다운로드 없이 브라우저 자체 오디오 컨텍스트로 실시간 생성

class SoundSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.gainNode = null;
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentType = null;
    this.timerId = null;
    this.volume = 0.5;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentType = null;
  }

  play(type, volume = 0.5) {
    this.stop();
    this.initContext();
    this.volume = volume;
    this.currentType = type;
    this.isPlaying = true;

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    this.gainNode.connect(this.audioCtx.destination);

    switch (type) {
      case "shush":
        this.playShush();
        break;
      case "heartbeat":
        this.playHeartbeat();
        break;
      case "pink_noise":
        this.playPinkNoise();
        break;
      case "rain":
        this.playRain();
        break;
      case "lullaby":
        this.playLullaby();
        break;
      default:
        this.playPinkNoise();
    }
  }

  // 1. 엄마 쉬~ 소리 (Shushing rhythm: 1.5초 주기)
  playShush() {
    const bufferSize = this.audioCtx.sampleRate * 3;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const bandpass = this.audioCtx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 1200;
    bandpass.Q.value = 1.2;

    const shushGain = this.audioCtx.createGain();
    shushGain.gain.value = 0.05;

    const lfo = this.audioCtx.createOscillator();
    lfo.frequency.value = 0.45;
    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.value = 0.6;

    lfo.connect(lfoGain);
    lfoGain.connect(shushGain.gain);

    noise.connect(bandpass);
    bandpass.connect(shushGain);
    shushGain.connect(this.gainNode);

    noise.start();
    lfo.start();
    this.activeNodes.push(noise, lfo, bandpass, shushGain, lfoGain);
  }

  // 2. 자궁 심장 박동음 (Womb Heartbeat)
  playHeartbeat() {
    const bpm = 72;
    const intervalMs = (60 / bpm) * 1000;

    const triggerBeat = () => {
      if (!this.isPlaying || this.currentType !== "heartbeat") return;
      const now = this.audioCtx.currentTime;

      // First beat (Lub)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(35, now + 0.12);

      gain1.gain.setValueAtTime(0.9, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc1.connect(gain1);
      gain1.connect(this.gainNode);
      osc1.start(now);
      osc1.stop(now + 0.13);

      // Second beat (Dub)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(65, now + 0.2);
      osc2.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      gain2.gain.setValueAtTime(0.7, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc2.connect(gain2);
      gain2.connect(this.gainNode);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.36);
    };

    triggerBeat();
    this.timerId = setInterval(triggerBeat, intervalMs);
  }

  // 3. 핑크/화이트 노이즈 (Pink Noise)
  playPinkNoise() {
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const lowpass = this.audioCtx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 1000;

    whiteNoise.connect(lowpass);
    lowpass.connect(this.gainNode);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, lowpass);
  }

  // 4. 잔잔한 빗소리 (Rain)
  playRain() {
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const rainSource = this.audioCtx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;

    const highpass = this.audioCtx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 150;

    rainSource.connect(filter);
    filter.connect(highpass);
    highpass.connect(this.gainNode);
    rainSource.start();

    this.activeNodes.push(rainSource, filter, highpass);
  }

  // 5. 오르골 자장가 (Twinkle Lullaby)
  playLullaby() {
    const notes = [
      261.63, 261.63, 392.00, 392.00, 440.00, 440.00, 392.00,
      349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63,
      392.00, 392.00, 349.23, 349.23, 329.63, 329.63, 293.66,
      392.00, 392.00, 349.23, 349.23, 329.63, 329.63, 293.66,
      261.63, 261.63, 392.00, 392.00, 440.00, 440.00, 392.00,
      349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63
    ];

    let noteIndex = 0;
    const playNote = () => {
      if (!this.isPlaying || this.currentType !== "lullaby") return;
      const freq = notes[noteIndex];
      noteIndex = (noteIndex + 1) % notes.length;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const oscGain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * 2, now);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.linearRampToValueAtTime(0.35, now + 0.02);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(oscGain);
      oscGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 1.25);
    };

    playNote();
    this.timerId = setInterval(playNote, 600);
  }
}

export const getSoundSynthesizer = () => {
  if (typeof window === "undefined") return null;
  if (!window._datebabySoundSynth) {
    window._datebabySoundSynth = new SoundSynthesizer();
  }
  return window._datebabySoundSynth;
};
