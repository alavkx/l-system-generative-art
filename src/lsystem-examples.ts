import type { LSystemRule } from "./lsystem";

export interface LSystemExample {
  name: string;
  axiom: string;
  rules: LSystemRule[];
  angle: number;
  iterations: number;
  stepSize: number;
  description: string;
}

export const lsystemExamples: LSystemExample[] = [
  {
    name: "Koch Curve",
    axiom: "F",
    rules: [{ from: "F", to: "F+F-F-F+F" }],
    angle: 90,
    iterations: 4,
    stepSize: 8,
    description: "Classic fractal curve that creates a snowflake-like pattern",
  },
  {
    name: "Sierpinski Triangle",
    axiom: "F-G-G",
    rules: [
      { from: "F", to: "F-G+F+G-F" },
      { from: "G", to: "GG" },
    ],
    angle: 120,
    iterations: 6,
    stepSize: 4,
    description: "Famous fractal triangle pattern",
  },
  {
    name: "Dragon Curve",
    axiom: "F",
    rules: [
      { from: "F", to: "F+G" },
      { from: "G", to: "F-G" },
    ],
    angle: 90,
    iterations: 12,
    stepSize: 6,
    description: "Beautiful self-similar curve that never crosses itself",
  },
  {
    name: "Plant Branch",
    axiom: "F",
    rules: [{ from: "F", to: "F[+F]F[-F]F" }],
    angle: 25.7,
    iterations: 5,
    stepSize: 6,
    description: "Simple branching pattern resembling plant growth",
  },
  {
    name: "Binary Tree",
    axiom: "F",
    rules: [
      { from: "F", to: "G[+F][-F]" },
      { from: "G", to: "GG" },
    ],
    angle: 45,
    iterations: 6,
    stepSize: 4,
    description: "Creates a binary tree structure with symmetric branching",
  },
  {
    name: "Levy C Curve",
    axiom: "F",
    rules: [{ from: "F", to: "+F--F+" }],
    angle: 45,
    iterations: 12,
    stepSize: 8,
    description: "Fractal curve that tiles the plane",
  },
];
