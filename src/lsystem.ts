export interface LSystemRule {
  from: string;
  to: string;
}

export class LSystem {
  private axiom: string;
  private rules: Map<string, string>;
  private currentGeneration: string;
  private generation: number;

  constructor(axiom: string, rules: LSystemRule[]) {
    this.axiom = axiom;
    this.rules = new Map();
    this.currentGeneration = axiom;
    this.generation = 0;

    for (const rule of rules) {
      this.rules.set(rule.from, rule.to);
    }
  }

  reset(): void {
    this.currentGeneration = this.axiom;
    this.generation = 0;
  }

  iterate(): void {
    let newGeneration = "";
    for (const char of this.currentGeneration) {
      const replacement = this.rules.get(char);
      newGeneration += replacement || char;
    }
    this.currentGeneration = newGeneration;
    this.generation++;
  }

  iterateN(n: number): void {
    for (let i = 0; i < n; i++) {
      this.iterate();
    }
  }

  getCurrentGeneration(): string {
    return this.currentGeneration;
  }

  getGeneration(): number {
    return this.generation;
  }

  // Generator that yields commands one by one without storing entire sequence
  *generateCommands(iterations: number): Generator<string, void, unknown> {
    if (iterations === 0) {
      // Just yield the axiom
      for (const char of this.axiom) {
        yield char;
      }
      return;
    }

    // For higher iterations, we need to be more clever
    // Start with axiom and expand on-demand
    yield* this.expandString(this.axiom, iterations);
  }

  // Recursively expand a string for a given number of iterations
  private *expandString(
    str: string,
    iterations: number
  ): Generator<string, void, unknown> {
    if (iterations === 0) {
      // Base case: yield each character
      for (const char of str) {
        yield char;
      }
      return;
    }

    // Recursive case: expand each character and then recurse
    for (const char of str) {
      const replacement = this.rules.get(char) || char;
      yield* this.expandString(replacement, iterations - 1);
    }
  }

  // Get estimated final length for progress tracking (approximation)
  getEstimatedLength(iterations: number): number {
    if (iterations === 0) return this.axiom.length;

    // Sample growth by doing a few iterations
    let sampleLength = this.axiom.length;
    let testString = this.axiom;

    const samplesToTest = Math.min(3, iterations);
    for (let i = 0; i < samplesToTest; i++) {
      let nextString = "";
      for (const char of testString) {
        const replacement = this.rules.get(char);
        nextString += replacement || char;
      }
      testString = nextString;
      sampleLength = testString.length;
    }

    if (samplesToTest === iterations) return sampleLength;

    // Estimate growth factor and extrapolate
    const growthFactor = sampleLength / this.axiom.length;
    return Math.round(
      this.axiom.length * Math.pow(growthFactor, iterations / samplesToTest)
    );
  }
}
