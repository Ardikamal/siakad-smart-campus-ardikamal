"use client";

import { motion } from "framer-motion";

/**
 * Signature login backdrop: a faint architectural blueprint grid (structure,
 * institution) with slow-pulsing accent nodes (a campus/data network) —
 * grounded in the "academic system" subject rather than a generic gradient.
 */
export function LoginBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-primary">
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
        <defs>
          <pattern id="blueprint-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
      </svg>

      <div
        className="absolute -left-1/4 top-0 h-[36rem] w-[36rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-secondary), transparent 70%)" }}
      />
      <div
        className="absolute -right-1/4 bottom-0 h-[36rem] w-[36rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
      />

      {NODES.map((node, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-accent"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.6, 1] }}
          transition={{ duration: node.duration, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
        />
      ))}
    </div>
  );
}

const NODES = [
  { x: 12, y: 20, duration: 4, delay: 0 },
  { x: 82, y: 15, duration: 5, delay: 0.5 },
  { x: 25, y: 75, duration: 4.5, delay: 1 },
  { x: 70, y: 68, duration: 3.5, delay: 1.5 },
  { x: 90, y: 45, duration: 5.5, delay: 0.8 },
  { x: 45, y: 88, duration: 4, delay: 2 },
];
