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

  private storedDrawing: string = "";

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
    this.resetTransform();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.storedDrawing = "";
    this.canvas.style.cursor = "grab";
  }

  private redraw(): void {
    if (this.storedDrawing) {
      this.resetTransform();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.applyTransform();
      this.reset();
      this.drawInternal(this.storedDrawing);
    }
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

  draw(lsystemString: string): void {
    this.storedDrawing = lsystemString;
    this.applyTransform();
    this.drawInternal(lsystemString);
    this.canvas.style.cursor = "grab";
  }

  private drawInternal(lsystemString: string): void {
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);

    for (const command of lsystemString) {
      this.executeCommand(command);
    }
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
