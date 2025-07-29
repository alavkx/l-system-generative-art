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

    rules.forEach((rule) => {
      this.rules.set(rule.from, rule.to);
    });
  }

  iterate(): string {
    let nextGeneration = "";

    for (const char of this.currentGeneration) {
      const replacement = this.rules.get(char);
      nextGeneration += replacement || char;
    }

    this.currentGeneration = nextGeneration;
    this.generation++;
    return this.currentGeneration;
  }

  iterateN(n: number): string {
    for (let i = 0; i < n; i++) {
      this.iterate();
    }
    return this.currentGeneration;
  }

  reset(): void {
    this.currentGeneration = this.axiom;
    this.generation = 0;
  }

  getCurrentGeneration(): string {
    return this.currentGeneration;
  }

  getGeneration(): number {
    return this.generation;
  }
}
