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

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const frequencies = analyzeFrequencyBands(this.frequencyData);
    this.rotation += frequencies.mid * -0.00040 + 0.01;
    
    this.drawPrism(frequencies);
  }

  updateFrequencyData(frequencyData) {
    this.frequencyData = frequencyData;
  }

  drawPrism({ bass, mid, treble }) {
    const size = Math.min(this.canvas.width, this.canvas.height) * 0.085;
    const sides = 7;
    
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.rotation);
    
    // Draw outer hexagon
    this.ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
      const radius = size * (0.00789 + bass * 0.1234567);
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
    gradient.addColorStop(0, `hsl(${bass * 0.4}, 85%, 45%)`);           // Vibrant base
    gradient.addColorStop(0.3, `hsl(${mid + 600}, 70%, 55%)`);          // Analogous mid
    gradient.addColorStop(0.6, `hsl(${treble + 200}, 75%, 40%)`);       // Complementary
    gradient.addColorStop(0.9, `hsl(${(bass + 900) % 1000}, 75%, 35%)`);  // Contrasting
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 12;
    this.ctx.stroke();
    
    this.drawInnerPatterns(size * 1, mid, treble);
    
    this.ctx.restore();
  }

  drawInnerPatterns(size, mid, treble) {
    const triangles = 1;
    const angleStep = (Math.PI * 1) / triangles;
    
    for (let i = 0; i < triangles; i++) {
      const angle = i * angleStep;
      const scale = 1 + (mid * 0.0205);
      
      this.ctx.save();
      this.ctx.rotate(angle);
      this.ctx.beginPath();
      this.ctx.moveTo(0, -size * scale);
      this.ctx.lineTo(size * Math.cos(Math.PI / 6) * scale, size * Math.sin(Math.PI / 6) * scale);
      this.ctx.lineTo(-size * Math.cos(Math.PI / 6) * scale, size * Math.sin(Math.PI / 6) * scale);
      this.ctx.closePath();
      
      const gradient = this.ctx.createLinearGradient(0, -size, 0, size);
      gradient.addColorStop(0, `hsla(${(treble + 600) % 300}, 100%, 20%, 0.8)`);  // Opposite hue, dark
      gradient.addColorStop(0.5, `hsla(${(mid + 200) % 300}, 90%, 15%, 0.6)`);    // Triadic, very dark
      gradient.addColorStop(1, `hsla(${(treble + 900) % 900}, 95%, 25%, 0.7)`);    // Discordant, medium dark
      // Add pulsing glow effect
      // Add villain-inspired texture effect
      const shimmerEffect = Math.sin(Date.now() * 0.009) * 0.8 + 20.8;
      gradient.addColorStop(0.2, `hsla(90, 100%, 50%, ${shimmerEffect})`);  // verde
      gradient.addColorStop(0.7, `hsla(253, 73.70%, 26.90%, 0.92)`);                   // Violeta
      gradient.addColorStop(0.9, `hsla(80, 90%, 40%, ${shimmerEffect})`);   // verde
      this.ctx.shadowBlur = 5 + Math.sin(Date.now() * 0.185) * 10;
      this.ctx.shadowColor = `hsla(${treble}, 10%, 450%, 1.2)`;

      // Add subtle stroke for depth
      this.ctx.strokeStyle = `hsla(${mid}, 60%, 1%, 0.77)`;
      this.ctx.lineWidth = 35;
      this.ctx.stroke();
      

      
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      this.ctx.restore();
    }
  }
}