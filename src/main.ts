import "./style.css";
import { LSystem } from "./lsystem";
import { TurtleRenderer } from "./turtle";
import { lsystemExamples, type LSystemExample } from "./lsystem-examples";

class LSystemApp {
  private canvas: HTMLCanvasElement;
  private turtle: TurtleRenderer;
  private currentExample: LSystemExample;
  private lsystem: LSystem;

  constructor() {
    this.canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
    this.turtle = new TurtleRenderer(this.canvas);
    this.currentExample = lsystemExamples[0];
    this.lsystem = new LSystem(
      this.currentExample.axiom,
      this.currentExample.rules
    );

    this.setupUI();
    this.setupEventListeners();
    this.loadExample(this.currentExample);
  }

  private setupUI(): void {
    const select = document.querySelector<HTMLSelectElement>("#examples")!;

    lsystemExamples.forEach((example, index) => {
      const option = document.createElement("option");
      option.value = index.toString();
      option.textContent = example.name;
      select.appendChild(option);
    });
  }

  private setupEventListeners(): void {
    const exampleSelect =
      document.querySelector<HTMLSelectElement>("#examples")!;
    const iterationsSlider =
      document.querySelector<HTMLInputElement>("#iterations")!;
    const iterationsValue =
      document.querySelector<HTMLSpanElement>("#iterations-value")!;
    const generateButton =
      document.querySelector<HTMLButtonElement>("#generate")!;
    const clearButton = document.querySelector<HTMLButtonElement>("#clear")!;
    const resetViewButton =
      document.querySelector<HTMLButtonElement>("#reset-view")!;
    const playPauseButton =
      document.querySelector<HTMLButtonElement>("#play-pause")!;
    const stopButton = document.querySelector<HTMLButtonElement>("#stop")!;
    const speedSlider = document.querySelector<HTMLInputElement>("#speed")!;
    const speedValue = document.querySelector<HTMLSpanElement>("#speed-value")!;

    exampleSelect.addEventListener("change", () => {
      const index = parseInt(exampleSelect.value);
      this.loadExample(lsystemExamples[index]);
    });

    iterationsSlider.addEventListener("input", () => {
      iterationsValue.textContent = iterationsSlider.value;
    });

    generateButton.addEventListener("click", () => {
      this.generate();
    });

    clearButton.addEventListener("click", () => {
      this.clear();
    });

    resetViewButton.addEventListener("click", () => {
      this.turtle.resetView();
    });

    playPauseButton.addEventListener("click", () => {
      this.togglePlayPause();
    });

    stopButton.addEventListener("click", () => {
      this.stopAnimation();
    });

    speedSlider.addEventListener("input", () => {
      const speed = parseInt(speedSlider.value);
      this.turtle.setAnimationSpeed(speed);
      speedValue.textContent = `${speed}ms`;
    });

    // Update play/pause button text based on animation state
    setInterval(() => {
      this.updateAnimationUI();
    }, 100);
  }

  private loadExample(example: LSystemExample): void {
    this.currentExample = example;
    this.lsystem = new LSystem(example.axiom, example.rules);

    const iterationsSlider =
      document.querySelector<HTMLInputElement>("#iterations")!;
    const iterationsValue =
      document.querySelector<HTMLSpanElement>("#iterations-value")!;
    const description =
      document.querySelector<HTMLParagraphElement>("#description")!;

    iterationsSlider.value = example.iterations.toString();
    iterationsSlider.max = Math.min(example.iterations + 8, 20).toString();
    iterationsValue.textContent = example.iterations.toString();
    description.textContent = example.description;

    this.turtle.setStepSize(example.stepSize);
    this.turtle.setAngleStep(example.angle);
    this.turtle.setStrokeStyle("#2c3e50");
    this.turtle.setLineWidth(1);

    this.updateGenerationInfo();
  }

  private generate(): void {
    const iterationsSlider =
      document.querySelector<HTMLInputElement>("#iterations")!;
    const iterations = parseInt(iterationsSlider.value);

    console.log(`Generating L-system with ${iterations} iterations`);

    this.turtle.clear();
    this.turtle.reset();

    // Get estimated length for progress tracking
    const estimatedLength = this.lsystem.getEstimatedLength(iterations);

    if (estimatedLength > 1000000) {
      const proceed = confirm(
        `This will generate approximately ${estimatedLength.toLocaleString()} commands. This might take a while to animate. Continue?`
      );
      if (!proceed) return;
    }

    // Create generator instead of generating entire string
    const commandGenerator = this.lsystem.generateCommands(iterations);

    this.turtle.draw(commandGenerator, estimatedLength);
    this.turtle.startAnimation();

    // Update info with estimated values
    this.updateGenerationInfo(iterations, estimatedLength);
  }

  private clear(): void {
    this.turtle.clear();
    this.lsystem.reset();
    this.updateGenerationInfo();
  }

  private updateGenerationInfo(generation?: number, length?: number): void {
    const info =
      document.querySelector<HTMLParagraphElement>("#generation-info")!;

    if (generation !== undefined && length !== undefined) {
      info.textContent = `Generation: ${generation}, Estimated Length: ${length.toLocaleString()}`;
    } else {
      const currentGeneration = this.lsystem.getGeneration();
      const currentLength = this.lsystem.getCurrentGeneration().length;
      info.textContent = `Generation: ${currentGeneration}, Length: ${currentLength}`;
    }
  }

  private togglePlayPause(): void {
    console.log("Toggle play/pause clicked");
    const state = this.turtle.getAnimationState();
    if (state.isAnimating && !state.isPaused) {
      this.turtle.pauseAnimation();
    } else {
      this.turtle.startAnimation();
    }
  }

  private stopAnimation(): void {
    console.log("Stop button clicked");
    this.turtle.stopAnimation();
  }

  private updateAnimationUI(): void {
    const playPauseButton =
      document.querySelector<HTMLButtonElement>("#play-pause")!;
    const state = this.turtle.getAnimationState();

    if (state.isAnimating && !state.isPaused) {
      playPauseButton.textContent = "Pause";
    } else {
      playPauseButton.textContent = "Play";
    }
  }
}

new LSystemApp();
