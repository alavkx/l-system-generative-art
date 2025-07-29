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
    iterationsSlider.max = Math.min(example.iterations + 3, 12).toString();
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

    this.lsystem.reset();
    this.lsystem.iterateN(iterations);

    this.turtle.clear();
    this.turtle.reset();

    const generatedString = this.lsystem.getCurrentGeneration();

    if (generatedString.length > 10000) {
      const proceed = confirm(
        `This will generate ${generatedString.length} commands. This might be slow. Continue?`
      );
      if (!proceed) return;
    }

    this.turtle.draw(generatedString);
    this.updateGenerationInfo();
  }

  private clear(): void {
    this.turtle.clear();
    this.lsystem.reset();
    this.updateGenerationInfo();
  }

  private updateGenerationInfo(): void {
    const info =
      document.querySelector<HTMLParagraphElement>("#generation-info")!;
    const generation = this.lsystem.getGeneration();
    const length = this.lsystem.getCurrentGeneration().length;
    info.textContent = `Generation: ${generation}, Length: ${length}`;
  }
}

new LSystemApp();
