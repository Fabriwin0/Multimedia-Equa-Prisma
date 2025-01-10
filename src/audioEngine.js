// Audio processing and analysis engine
export class AudioEngine {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.gainNode = this.audioContext.createGain();
    
    // Configure analyser
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;
    
    // Setup frequency data arrays
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
    
    // Audio chain
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    
    // EQ nodes
    this.bassGain = this.createEQBand(100);
    this.midGain = this.createEQBand(1000);
    this.trebleGain = this.createEQBand(4000);
  }

  createEQBand(frequency) {
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = frequency;
    filter.Q.value = 1;
    filter.gain.value = 0;
    return filter;
  }

  async setupAudioSource(source) {
    if (source instanceof File) {
      const arrayBuffer = await source.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      const bufferSource = this.audioContext.createBufferSource();
      bufferSource.buffer = audioBuffer;
      this.connectSource(bufferSource);
      return bufferSource;
    } else if (source instanceof MediaStream) {
      const micSource = this.audioContext.createMediaStreamSource(source);
      this.connectSource(micSource);
      return micSource;
    }
  }

  connectSource(source) {
    source.connect(this.bassGain);
    this.bassGain.connect(this.midGain);
    this.midGain.connect(this.trebleGain);
    this.trebleGain.connect(this.analyser);
  }

  getFrequencyData() {
    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  setVolume(value) {
    this.gainNode.gain.value = value;
  }

  setEQGain(band, value) {
    const gainNode = {
      bass: this.bassGain,
      mid: this.midGain,
      treble: this.trebleGain
    }[band];
    if (gainNode) {
      gainNode.gain.value = value;
    }
  }
}