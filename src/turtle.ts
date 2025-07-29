export interface TurtleState {
  x: number;
  y: number;
  angle: number;
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

  constructor(canvas: HTMLCanvasElement, stepSize = 10, angleStep = 90) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.stepSize = stepSize;
    this.angleStep = angleStep * (Math.PI / 180);
    this.stack = [];
    this.reset();
  }

  reset(): void {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 50;
    this.angle = -Math.PI / 2;
    this.stack = [];
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
