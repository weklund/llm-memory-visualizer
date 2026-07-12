/**
 * Pure paging helpers for PagedAttention-style visuals (lesson 5+).
 * No Three.js dependency.
 */

export type PhysicalBlock = {
  id: number;
  /** Tokens currently stored (0..blockSize) */
  occupied: number;
  /** True when referenced by more than one logical sequence (prefix share) */
  shared: boolean;
  /** Soft flag for “hole” demos */
  free: boolean;
};

export type BlockTableEntry = {
  logicalIndex: number;
  physicalId: number | null;
};

export type PagingLayout = {
  blockSize: number;
  sequenceLength: number;
  logicalBlocks: number;
  internalWasteTokens: number;
  /** Physical pool (may include free holes for external fragmentation demos) */
  physical: PhysicalBlock[];
  /** Map logical block → physical id */
  table: BlockTableEntry[];
};

export function buildContiguousLayout(
  sequenceLength: number,
  blockSize: number,
): PagingLayout {
  assertPositive(blockSize, "blockSize");
  const logicalBlocks = sequenceLength === 0 ? 0 : Math.ceil(sequenceLength / blockSize);
  const physical: PhysicalBlock[] = [];
  const table: BlockTableEntry[] = [];

  let remaining = sequenceLength;
  for (let i = 0; i < logicalBlocks; i++) {
    const occupied = Math.min(blockSize, remaining);
    remaining -= occupied;
    physical.push({ id: i, occupied, shared: false, free: false });
    table.push({ logicalIndex: i, physicalId: i });
  }

  const capacity = logicalBlocks * blockSize;
  return {
    blockSize,
    sequenceLength,
    logicalBlocks,
    internalWasteTokens: capacity - sequenceLength,
    physical,
    table,
  };
}

/**
 * Non-contiguous physical placement with optional free holes (external fragmentation story).
 * Deterministic scramble for stable lesson visuals.
 */
export function buildPagedLayout(
  sequenceLength: number,
  blockSize: number,
  options?: { holeEvery?: number; sharedPrefixBlocks?: number },
): PagingLayout {
  assertPositive(blockSize, "blockSize");
  const holeEvery = options?.holeEvery ?? 3;
  const sharedPrefixBlocks = options?.sharedPrefixBlocks ?? 0;

  const base = buildContiguousLayout(sequenceLength, blockSize);
  const physical: PhysicalBlock[] = [];
  const table: BlockTableEntry[] = [];

  let nextId = 0;
  for (let i = 0; i < base.logicalBlocks; i++) {
    if (i > 0 && i % holeEvery === 0) {
      physical.push({ id: nextId++, occupied: 0, shared: false, free: true });
    }
    const occupied = base.physical[i]?.occupied ?? 0;
    const id = nextId++;
    physical.push({
      id,
      occupied,
      shared: i < sharedPrefixBlocks,
      free: false,
    });
    table.push({ logicalIndex: i, physicalId: id });
  }

  return {
    ...base,
    physical,
    table,
  };
}

export function physicalBytes(
  layout: PagingLayout,
  bytesPerTokenBlock: number,
): { used: number; reserved: number; waste: number } {
  let usedSlots = 0;
  let reservedSlots = 0;
  for (const block of layout.physical) {
    if (block.free) continue;
    reservedSlots += layout.blockSize;
    usedSlots += block.occupied;
  }
  const used = usedSlots * bytesPerTokenBlock;
  const reserved = reservedSlots * bytesPerTokenBlock;
  return { used, reserved, waste: reserved - used };
}

function assertPositive(n: number, name: string): void {
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`${name} must be a positive finite number`);
  }
}
