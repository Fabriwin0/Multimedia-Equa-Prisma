// Timing utilities for animation
export class FrameTimer {
  constructor(fps = 140) {
    this.fps = fps;
    this.frameInterval = 1000 / fps;
    this.lastTime = 0;
  }

  shouldDrawFrame(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    if (deltaTime > this.frameInterval) {
      this.lastTime = timestamp - (deltaTime % this.frameInterval);
      return true;
    }
    return false;
  }
}