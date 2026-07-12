# LLM Memory Visualizer

Interactive learning material for LLM memory optimization, built around 3D simulations and first-principles mental models.

The project will teach how KV cache memory behaves during inference and how modern systems reduce memory pressure through paging, prefix caching, scheduling, token eviction, quantization, and related security analysis.

## Planned learning modules

1. KV cache growth and the memory wall
2. PagedAttention and memory fragmentation
3. KV cache quantization
4. Prefill vs. decode scheduling
5. Prefix caching and RadixAttention
6. Token eviction and attention sparsity
7. Security risks in shared caching systems

## Initial implementation direction

- React app scaffolded with Vite or Next.js
- Three.js via React Three Fiber
- MDX-based lessons
- Reusable simulation primitives for tokens, cache pages, memory grids, attention matrices, and GPU pipelines
- Paper-backed explanations with explicit formulas and assumptions
