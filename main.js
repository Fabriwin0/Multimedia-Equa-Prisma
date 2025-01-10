import './style.css';
import { AudioEngine } from './src/audioEngine.js';
import { Visualizer } from './src/visualizer.js';

// Initialize audio engine and visualizer
const audioEngine = new AudioEngine();
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const visualizer = new Visualizer(canvas);

// Create UI controls
const controls = document.createElement('div');
controls.className = 'audio-controls';
controls.innerHTML = `
  <input type="file" accept=".mp3,.wav,.ogg" id="audioFile">
  <button id="micButton">Use Microphone</button>
  <button id="playPause" disabled>Play</button>
  <div class="slider-container">
    <label>Volume: <input type="range" id="volume" min="0" max="100" value="100"></label>
  </div>
  <div class="eq-controls">
    <label>Bass: <input type="range" id="bassGain" min="-12" max="12" value="0"></label>
    <label>Mid: <input type="range" id="midGain" min="-12" max="12" value="0"></label>
    <label>Treble: <input type="range" id="trebleGain" min="-12" max="12" value="0"></label>
  </div>
  <div id="timeDisplay">0:00 / 0:00</div>
  <div id="progressBar"></div>
`;
document.body.appendChild(controls);

// Audio source handling
let currentSource = null;
let isPlaying = false;

document.getElementById('audioFile').addEventListener('change', async (e) => {
  if (e.target.files[0]) {
    if (currentSource) {
      currentSource.stop?.();
    }
    currentSource = await audioEngine.setupAudioSource(e.target.files[0]);
    document.getElementById('playPause').disabled = false;
  }
});

document.getElementById('micButton').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (currentSource) {
      currentSource.disconnect();
    }
    currentSource = await audioEngine.setupAudioSource(stream);
    isPlaying = true;
    document.getElementById('playPause').textContent = 'Stop';
    document.getElementById('playPause').disabled = false;
  } catch (err) {
    console.error('Microphone access denied:', err);
  }
});

// Playback controls
document.getElementById('playPause').addEventListener('click', () => {
  if (!currentSource) return;
  
  if (isPlaying) {
    currentSource.stop?.();
    isPlaying = false;
    document.getElementById('playPause').textContent = 'Play';
  } else {
    if (currentSource.start) {
      currentSource.start(0);
    }
    isPlaying = true;
    document.getElementById('playPause').textContent = 'Pause';
  }
});

// Volume and EQ controls
document.getElementById('volume').addEventListener('input', (e) => {
  audioEngine.setVolume(e.target.value / 100);
});

['bass', 'mid', 'treble'].forEach(band => {
  document.getElementById(`${band}Gain`).addEventListener('input', (e) => {
    audioEngine.setEQGain(band, parseInt(e.target.value));
  });
});

// Start visualization loop
function updateVisualization() {
  visualizer.updateFrequencyData(audioEngine.getFrequencyData());
  requestAnimationFrame(updateVisualization);
}

visualizer.start();
updateVisualization();