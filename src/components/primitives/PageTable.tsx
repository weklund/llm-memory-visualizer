import { Text } from "@react-three/drei";
import { simColors } from "@/lib/simColors";
import type { PagingLayout } from "@/lib/paging";
import { CachePage } from "./CachePage";

export type PageTableProps = {
  layout: PagingLayout;
  position?: [number, number, number];
  /** Gap between physical pages along X */
  gap?: number;
};

/**
 * Physical page pool + logical→physical map labels (lesson 5–6).
 */
export function PageTable({ layout, position = [0, 0, 0], gap = 1.05 }: PageTableProps) {
  const n = layout.physical.length;
  const width = (n - 1) * gap;

  return (
    <group position={position}>
      <Text
        position={[0, 1.1, 0]}
        fontSize={0.2}
        color={simColors.muted}
        anchorX="center"
      >
        physical pages (HBM pool)
      </Text>
      {layout.physical.map((block, i) => {
        const x = i * gap - width / 2;
        const fill = layout.blockSize > 0 ? block.occupied / layout.blockSize : 0;
        return (
          <CachePage
            key={block.id}
            position={[x, 0, 0]}
            fill={fill}
            shared={block.shared}
            free={block.free}
            label={
              block.free
                ? `hole ${block.id}`
                : block.shared
                  ? `P${block.id} shared`
                  : `P${block.id}`
            }
          />
        );
      })}
      <group position={[0, -0.85, 0]}>
        <Text fontSize={0.16} color={simColors.muted} anchorX="center">
          block table · logical → physical
        </Text>
        {layout.table.map((entry, i) => {
          const x = (i - (layout.table.length - 1) / 2) * Math.min(gap, 0.85);
          return (
            <Text
              key={entry.logicalIndex}
              position={[x, -0.35, 0]}
              fontSize={0.12}
              color={simColors.text}
              anchorX="center"
            >
              {`L${entry.logicalIndex}→${entry.physicalId ?? "—"}`}
            </Text>
          );
        })}
      </group>
    </group>
  );
}
