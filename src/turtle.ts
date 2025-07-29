export interface TurtleState {
  x: number;
  y: number;
  angle: number;
}

export interface Transform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export class TurtleRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private x!: number;
  private y!: number;
  private angle!: number;
  private stepSize: number;
  private angleStep: number;
  private stack: TurtleState[];
  private transform: Transform;
  private isDragging: boolean;
  private lastMousePos: { x: number; y: number };

  // Animation properties
  private commandGenerator: Generator<string, void, unknown> | null = null;
  private commandsProcessed: number = 0;
  private estimatedTotalCommands: number = 0;
  private animationSpeed: number = 50; // milliseconds per command
  private isAnimating: boolean = false;
  private isPaused: boolean = false;
  private animationTimeoutId: number | null = null;

  constructor(canvas: HTMLCanvasElement, stepSize = 10, angleStep = 90) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.stepSize = stepSize;
    this.angleStep = angleStep * (Math.PI / 180);
    this.stack = [];
    this.transform = { scale: 1, offsetX: 0, offsetY: 0 };
    this.isDragging = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.setupEventListeners();
    this.reset();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener("wheel", this.handleWheel.bind(this));
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("mouseleave", this.handleMouseUp.bind(this));
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(
      0.1,
      Math.min(10, this.transform.scale * zoomFactor)
    );

    const worldX = (mouseX - this.transform.offsetX) / this.transform.scale;
    const worldY = (mouseY - this.transform.offsetY) / this.transform.scale;

    this.transform.offsetX = mouseX - worldX * newScale;
    this.transform.offsetY = mouseY - worldY * newScale;
    this.transform.scale = newScale;

    this.redraw();
  }

  private handleMouseDown(e: MouseEvent): void {
    this.isDragging = true;
    this.lastMousePos = { x: e.clientX, y: e.clientY };
    this.canvas.style.cursor = "grabbing";
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.lastMousePos.x;
    const deltaY = e.clientY - this.lastMousePos.y;

    this.transform.offsetX += deltaX;
    this.transform.offsetY += deltaY;

    this.lastMousePos = { x: e.clientX, y: e.clientY };
    this.redraw();
  }

  private handleMouseUp(): void {
    this.isDragging = false;
    this.canvas.style.cursor = "grab";
  }

  private applyTransform(): void {
    this.ctx.setTransform(
      this.transform.scale,
      0,
      0,
      this.transform.scale,
      this.transform.offsetX,
      this.transform.offsetY
    );
  }

  private resetTransform(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  reset(): void {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 50;
    this.angle = -Math.PI / 2;
    this.stack = [];
  }

  resetView(): void {
    this.transform = { scale: 1, offsetX: 0, offsetY: 0 };
    this.redraw();
  }

  clear(): void {
    console.log("Clearing canvas and stopping animation");
    // Stop animation without clearing canvas to avoid recursion
    this.isAnimating = false;
    this.isPaused = false;
    if (this.animationTimeoutId) {
      clearTimeout(this.animationTimeoutId);
      this.animationTimeoutId = null;
    }

    this.resetTransform();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.commandGenerator = null;
    this.commandsProcessed = 0;
    this.estimatedTotalCommands = 0;
    this.canvas.style.cursor = "grab";
  }

  private redraw(): void {
    // Redrawing with generator is complex since generators can't be reset
    // For now, just clear and log - we'd need to regenerate from source
    console.log("Redraw requested - generator cannot be reset");
    this.resetTransform();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.applyTransform();
    this.reset();
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
  }

  setStepSize(size: number): void {
    this.stepSize = size;
  }

  setAngleStep(angle: number): void {
    this.angleStep = angle * (Math.PI / 180);
  }

  setStrokeStyle(style: string): void {
    this.ctx.strokeStyle = style;
  }

  setLineWidth(width: number): void {
    this.ctx.lineWidth = width;
  }

  draw(
    commandGenerator: Generator<string, void, unknown>,
    estimatedLength: number
  ): void {
    this.commandGenerator = commandGenerator;
    this.commandsProcessed = 0;
    this.estimatedTotalCommands = estimatedLength;
    this.applyTransform();
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
    this.canvas.style.cursor = "grab";
  }

  startAnimation(): void {
    if (!this.commandGenerator) return;
    if (this.isAnimating && !this.isPaused) return;

    console.log(
      `Starting animation with ${this.estimatedTotalCommands} commands`
    );
    this.isAnimating = true;
    this.isPaused = false;
    this.processNextCommand();
  }

  pauseAnimation(): void {
    console.log("Pausing animation");
    this.isPaused = true;
    if (this.animationTimeoutId) {
      clearTimeout(this.animationTimeoutId);
      this.animationTimeoutId = null;
    }
  }

  stopAnimation(): void {
    console.log("Stopping animation");
    this.isAnimating = false;
    this.isPaused = false;
    if (this.animationTimeoutId) {
      clearTimeout(this.animationTimeoutId);
      this.animationTimeoutId = null;
    }
    this.commandsProcessed = 0;

    // Clear canvas without calling this.clear() to avoid recursion
    this.resetTransform();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.reset();
    this.applyTransform();
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
  }

  setAnimationSpeed(speed: number): void {
    this.animationSpeed = Math.max(1, Math.min(100, speed));
  }

  getAnimationState(): {
    isAnimating: boolean;
    isPaused: boolean;
    progress: number;
  } {
    const progress =
      this.estimatedTotalCommands > 0
        ? this.commandsProcessed / this.estimatedTotalCommands
        : 0;
    return {
      isAnimating: this.isAnimating,
      isPaused: this.isPaused,
      progress,
    };
  }

  private processNextCommand(): void {
    if (!this.isAnimating || this.isPaused) return;

    if (!this.commandGenerator) {
      console.log("No command generator available.");
      this.isAnimating = false;
      return;
    }

    const nextCommand = this.commandGenerator.next();

    if (nextCommand.done) {
      console.log("Animation completed");
      this.isAnimating = false;
      return;
    }

    // Log progress every 50 commands to avoid spam
    if (this.commandsProcessed % 50 === 0) {
      console.log(
        `Animation progress: ${this.commandsProcessed}/${
          this.estimatedTotalCommands
        } (${Math.round(
          (this.commandsProcessed / this.estimatedTotalCommands) * 100
        )}%)`
      );
    }

    this.executeCommand(nextCommand.value);
    this.commandsProcessed++;

    // Use setTimeout for the next command to allow animation control
    this.animationTimeoutId = window.setTimeout(() => {
      this.processNextCommand();
    }, this.animationSpeed);
  }

  private executeCommand(command: string): void {
    switch (command) {
      case "F":
      case "G":
        this.drawForward();
        break;
      case "f":
        this.moveForward();
        break;
      case "+":
        this.turnRight();
        break;
      case "-":
        this.turnLeft();
        break;
      case "[":
        this.pushState();
        break;
      case "]":
        this.popState();
        break;
    }
  }

  private drawForward(): void {
    const newX = this.x + this.stepSize * Math.cos(this.angle);
    const newY = this.y + this.stepSize * Math.sin(this.angle);

    this.ctx.lineTo(newX, newY);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(newX, newY);

    this.x = newX;
    this.y = newY;
  }

  private moveForward(): void {
    this.x += this.stepSize * Math.cos(this.angle);
    this.y += this.stepSize * Math.sin(this.angle);
    this.ctx.moveTo(this.x, this.y);
  }

  private turnRight(): void {
    this.angle += this.angleStep;
  }

  private turnLeft(): void {
    this.angle -= this.angleStep;
  }

  private pushState(): void {
    this.stack.push({
      x: this.x,
      y: this.y,
      angle: this.angle,
    });
  }

  private popState(): void {
    const state = this.stack.pop();
    if (state) {
      this.x = state.x;
      this.y = state.y;
      this.angle = state.angle;
      this.ctx.moveTo(this.x, this.y);
    }
  }
}
