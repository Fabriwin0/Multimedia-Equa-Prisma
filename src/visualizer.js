import { FrameTimer } from './utils/timing.js';
import { analyzeFrequencyBands } from './utils/frequency.js';

// Visualization renderer
export class Visualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    this.rotation = 0.04;
    this.frameTimer = new FrameTimer(60);
    this.isRunning = true;
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
  }

  start() {
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame((timestamp) => {
      this.drawFrame(timestamp);
      this.animate();
    });
  }

  drawFrame(timestamp) {
    if (!this.frameTimer.shouldDrawFrame(timestamp)) return;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const frequencies = analyzeFrequencyBands(this.frequencyData);
    this.rotation += frequencies.mid * 0.0001;
    
    this.drawPrism(frequencies);
  }

  updateFrequencyData(frequencyData) {
    this.frequencyData = frequencyData;
  }

  drawPrism({ bass, mid, treble }) {
    const size = Math.min(this.canvas.width, this.canvas.height) * 0.085;
    const sides = 3;
    
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.rotation);
    
    // Draw outer hexagon
    this.ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
      const radius = size * (0.00445 + bass * 0.018);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    
    // Create gradient with complementary and analogous colors
    const gradient = this.ctx.createLinearGradient(-size, -size, size, size);
    gradient.addColorStop(0, `hsl(${bass * 0.5}, 85%, 45%)`);           // Vibrant base
    gradient.addColorStop(0.3, `hsl(${mid + 30}, 70%, 55%)`);          // Analogous mid
    gradient.addColorStop(0.6, `hsl(${treble + 60}, 75%, 40%)`);       // Complementary
    gradient.addColorStop(1, `hsl(${(bass + 180) % 360}, 80%, 35%)`);  // Contrasting
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 9;
    this.ctx.stroke();
    
    this.drawInnerPatterns(size * 0.999, mid, treble);
    
    this.ctx.restore();
  }

  drawInnerPatterns(size, mid, treble) {
    const triangles = 1;
    const angleStep = (Math.PI * 1) / triangles;
    
    for (let i = 0; i < triangles; i++) {
      const angle = i * angleStep;
      const scale = 1 + (mid * 0.033);
      
      this.ctx.save();
      this.ctx.rotate(angle);
      this.ctx.beginPath();
      this.ctx.moveTo(0, -size * scale);
      this.ctx.lineTo(size * Math.cos(Math.PI / 6) * scale, size * Math.sin(Math.PI / 6) * scale);
      this.ctx.lineTo(-size * Math.cos(Math.PI / 6) * scale, size * Math.sin(Math.PI / 6) * scale);
      this.ctx.closePath();
      
      const gradient = this.ctx.createLinearGradient(0, -size, 0, size);
      gradient.addColorStop(0, `hsla(${(treble + 180) % 360}, 100%, 20%, 0.8)`);  // Opposite hue, dark
      gradient.addColorStop(0.5, `hsla(${(mid + 270) % 360}, 90%, 15%, 0.6)`);    // Triadic, very dark
      gradient.addColorStop(1, `hsla(${(treble + 90) % 360}, 95%, 25%, 0.7)`);    // Discordant, medium dark
      // Add pulsing glow effect
      // Add villain-inspired texture effect
      const shimmerEffect = Math.sin(Date.now() * 0.002) * 0.2 + 0.8;
      gradient.addColorStop(0.2, `hsla(38, 100%, 50%, ${shimmerEffect})`);  // Gold
      gradient.addColorStop(0.7, `hsla(0, 0%, 0%, 0.9)`);                   // Black
      gradient.addColorStop(0.9, `hsla(38, 90%, 40%, ${shimmerEffect})`);   // Dark gold
      this.ctx.shadowBlur = 15 + Math.sin(Date.now() * 0.003) * 10;
      this.ctx.shadowColor = `hsla(${treble}, 90%, 50%, 0.6)`;

      // Add subtle stroke for depth
      this.ctx.strokeStyle = `hsla(${mid}, 80%, 40%, 0.4)`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      

      
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      this.ctx.restore();
    }
  }
}