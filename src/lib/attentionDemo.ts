/**
 * Deterministic demo attention weights for visualization (not model output).
 * Pure TS — downsampled matrices for browser-friendly surfaces.
 */

export type AttentionMatrix = {
  /** Query positions (rows) */
  rows: number;
  /** Key positions (cols) */
  cols: number;
  /** Row-major weights in [0, 1], each row sums ~1 */
  weights: Float32Array;
  sinkIndices: number[];
  heavyHitterIndices: number[];
};

export type AttentionDemoOptions = {
  rows: number;
  cols: number;
  /** How many leading columns act as attention sinks */
  sinkCount?: number;
  /** Extra mass on a few mid-sequence “heavy hitters” */
  heavyHitterCount?: number;
  /** Causal mask: query i only sees keys j <= i (when rows==cols timeline) */
  causal?: boolean;
  seed?: number;
};

/**
 * Build a small interpretable attention matrix with sinks + recency bias.
 */
export function buildDemoAttentionMatrix(options: AttentionDemoOptions): AttentionMatrix {
  const {
    rows,
    cols,
    sinkCount = 2,
    heavyHitterCount = 2,
    causal = true,
    seed = 42,
  } = options;

  if (rows <= 0 || cols <= 0) {
    throw new Error("rows and cols must be positive");
  }

  const weights = new Float32Array(rows * cols);
  const sinkIndices = Array.from({ length: Math.min(sinkCount, cols) }, (_, i) => i);
  const heavyHitterIndices: number[] = [];
  if (cols > sinkCount + 2) {
    const start = Math.floor(cols * 0.35);
    for (let h = 0; h < heavyHitterCount; h++) {
      const idx = Math.min(cols - 2, start + h * Math.max(1, Math.floor(cols / 8)));
      if (!sinkIndices.includes(idx)) heavyHitterIndices.push(idx);
    }
  }

  for (let i = 0; i < rows; i++) {
    const raw = new Float32Array(cols);
    let sum = 0;
    for (let j = 0; j < cols; j++) {
      if (causal && rows === cols && j > i) {
        raw[j] = 0;
        continue;
      }
      // Recency: newer keys (near i) get more mass
      const dist = Math.abs(i - j);
      let score = Math.exp(-dist / Math.max(2, cols * 0.15));
      if (sinkIndices.includes(j)) score += 1.8;
      if (heavyHitterIndices.includes(j)) score += 1.2;
      // Tiny deterministic jitter
      score += 0.05 * pseudoRandom(seed + i * 131 + j);
      raw[j] = score;
      sum += score;
    }
    const inv = sum > 0 ? 1 / sum : 0;
    for (let j = 0; j < cols; j++) {
      weights[i * cols + j] = (raw[j] ?? 0) * inv;
    }
  }

  return { rows, cols, weights, sinkIndices, heavyHitterIndices };
}

/** Downsample a matrix by block-average for small-screen / perf caps. */
export function downsampleAttention(
  matrix: AttentionMatrix,
  maxDim: number,
): AttentionMatrix {
  if (matrix.rows <= maxDim && matrix.cols <= maxDim) return matrix;
  const rows = Math.min(matrix.rows, maxDim);
  const cols = Math.min(matrix.cols, maxDim);
  const weights = new Float32Array(rows * cols);
  const rowScale = matrix.rows / rows;
  const colScale = matrix.cols / cols;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const r0 = Math.floor(i * rowScale);
      const r1 = Math.floor((i + 1) * rowScale);
      const c0 = Math.floor(j * colScale);
      const c1 = Math.floor((j + 1) * colScale);
      let acc = 0;
      let n = 0;
      for (let r = r0; r < r1; r++) {
        for (let c = c0; c < c1; c++) {
          acc += matrix.weights[r * matrix.cols + c] ?? 0;
          n++;
        }
      }
      weights[i * cols + j] = n ? acc / n : 0;
    }
  }

  return {
    rows,
    cols,
    weights,
    sinkIndices: matrix.sinkIndices
      .map((s) => Math.min(cols - 1, Math.floor(s / colScale)))
      .filter((v, i, a) => a.indexOf(v) === i),
    heavyHitterIndices: matrix.heavyHitterIndices
      .map((s) => Math.min(cols - 1, Math.floor(s / colScale)))
      .filter((v, i, a) => a.indexOf(v) === i),
  };
}

function pseudoRandom(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
