import { useMemo, useRef } from "react";
import { Html, OrbitControls, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera, Vector3, type Group, type Mesh } from "three";
import { brickEmphasis, type CacheMode, type DecodeBrick } from "@/lib/decodeStage";
import { SceneRig } from "@/components/primitives/SceneRig";
import { simColors } from "@/lib/simColors";

export type DecodePhase = "idle" | "sweeping" | "emitting";

type DecodeStageSceneProps = {
  bricks: DecodeBrick[];
  sweepProgress: number;
  emitProgress: number;
  phase: DecodePhase;
  cacheMode: CacheMode;
  nextToken: string | null;
  reducedMotion: boolean;
};

const roleColor: Record<DecodeBrick["role"], string> = {
  prior: simColors.page,
  prompt: simColors.key,
  reply: simColors.token,
};

const GAP = 0.12;
const BASE_W = 0.42;
const H = 0.48;
const D = 0.36;

/** Extra world units so the emit mote + edge labels stay inside the frame. */
const FIT_PAD_X = 1.35;
const FIT_PAD_Y = 0.35;
/** Vertical span of ribbon + labels + caption (approx). */
const CONTENT_HEIGHT = 2.7;
const LOOK_AT_Y = 0.1;
const MIN_DIST = 3.4;
const MAX_DIST = 18;

function brickWidth(tokenCount: number): number {
  return BASE_W + Math.min(0.55, (tokenCount - 1) * 0.06);
}

/**
 * Dolly the perspective camera so the full ribbon (+ padding) stays in view.
 * Zoom is owned by this fitter (OrbitControls zoom disabled) so growth doesn't
 * clip and doesn't fight the user mid-orbit.
 */
function FitRibbonCamera({
  contentWidth,
  reducedMotion,
}: {
  contentWidth: number;
  reducedMotion: boolean;
}) {
  const { camera, size } = useThree();
  const lookAt = useMemo(() => new Vector3(0, LOOK_AT_Y, 0), []);
  const offset = useMemo(() => new Vector3(), []);

  const goalDist = useMemo(() => {
    const cam = camera as PerspectiveCamera;
    const vFov = MathUtils.degToRad(cam.fov);
    const aspect = size.width / Math.max(1, size.height);
    const halfW = (contentWidth + FIT_PAD_X) / 2;
    const halfH = (CONTENT_HEIGHT + FIT_PAD_Y) / 2;
    // Visible height at distance d: 2 d tan(vFov/2); width = height * aspect
    const distForHeight = halfH / Math.tan(vFov / 2);
    const distForWidth = halfW / (Math.tan(vFov / 2) * aspect);
    return MathUtils.clamp(Math.max(distForWidth, distForHeight), MIN_DIST, MAX_DIST);
  }, [camera, size.width, size.height, contentWidth]);

  useFrame((state, delta) => {
    const cam = state.camera as PerspectiveCamera;
    if (!(cam instanceof PerspectiveCamera)) return;

    offset.copy(cam.position).sub(lookAt);
    if (offset.lengthSq() < 1e-8) {
      offset.set(0, 2.2, 5.5);
    }

    const current = offset.length();
    // Smooth follow; snap when reduced motion
    const alpha = reducedMotion ? 1 : 1 - Math.exp(-delta * 5);
    const next = MathUtils.lerp(current, goalDist, alpha);
    offset.multiplyScalar(next / current);
    cam.position.copy(lookAt).add(offset);
    cam.lookAt(lookAt);
    cam.updateProjectionMatrix();

    const controls = state.controls as {
      target: Vector3;
      update: () => void;
      minDistance: number;
      maxDistance: number;
    } | null;

    if (controls?.target) {
      controls.target.copy(lookAt);
      // Keep orbit radius band around the auto-fit so a stray scroll doesn't break framing
      controls.minDistance = goalDist * 0.92;
      controls.maxDistance = goalDist * 1.08;
      controls.update();
    }
  });

  return null;
}

export function DecodeStageScene({
  bricks,
  sweepProgress,
  emitProgress,
  phase,
  cacheMode,
  nextToken,
  reducedMotion,
}: DecodeStageSceneProps) {
  const layout = useMemo(() => {
    const widths = bricks.map((b) => brickWidth(b.tokenCount));
    const totalW =
      widths.reduce((s, w) => s + w, 0) + Math.max(0, bricks.length - 1) * GAP;
    let x = -totalW / 2;
    const centers: number[] = [];
    for (let i = 0; i < bricks.length; i++) {
      const w = widths[i]!;
      centers.push(x + w / 2);
      x += w + GAP;
    }
    // Emit mote travels ~0.55 past the last brick — include in fit width
    const fitW = Math.max(totalW + 0.7, 2.4);
    return { widths, centers, totalW, fitW };
  }, [bricks]);

  const sweepX =
    bricks.length === 0
      ? 0
      : layout.centers[0]! +
        (layout.centers[layout.centers.length - 1]! - layout.centers[0]!) *
          Math.min(1, Math.max(0, sweepProgress));

  const lastCenter = bricks.length > 0 ? layout.centers[layout.centers.length - 1]! : 0;

  return (
    <SceneRig gridY={-1.35} controls={false}>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI * 0.48}
      />
      <FitRibbonCamera contentWidth={layout.fitW} reducedMotion={reducedMotion} />

      <group position={[0, 0.15, 0]}>
        {bricks.map((brick, i) => (
          <BrickMesh
            key={brick.id}
            brick={brick}
            width={layout.widths[i]!}
            position={[layout.centers[i]!, 0, 0]}
            emphasis={brickEmphasis(i, bricks.length, sweepProgress, cacheMode, phase)}
            showLabel={brick.role === "reply" || brick.tokenCount > 1}
          />
        ))}

        {(phase === "sweeping" || (phase === "emitting" && sweepProgress >= 1)) &&
        bricks.length > 0 ? (
          <SweepPlane x={phase === "emitting" ? lastCenter : sweepX} mode={cacheMode} />
        ) : null}

        {phase === "emitting" && nextToken ? (
          <NextTokenMote
            fromX={lastCenter}
            progress={emitProgress}
            label={nextToken}
            reducedMotion={reducedMotion}
          />
        ) : null}

        <Text
          position={[0, -0.95, 0]}
          fontSize={0.16}
          color={simColors.muted}
          anchorX="center"
          anchorY="middle"
          maxWidth={Math.max(layout.fitW * 0.95, 4)}
        >
          {cacheMode === "naive"
            ? "naive · full recompute each step"
            : "KV cache · write new · read past"}
        </Text>
      </group>
    </SceneRig>
  );
}

function BrickMesh({
  brick,
  width,
  position,
  emphasis,
  showLabel,
}: {
  brick: DecodeBrick;
  width: number;
  position: [number, number, number];
  emphasis: number;
  showLabel: boolean;
}) {
  const color = roleColor[brick.role];
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width, H, D]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.12 + emphasis * 0.65}
          metalness={0.12}
          roughness={0.45}
          transparent
          opacity={0.55 + emphasis * 0.4}
        />
      </mesh>
      <mesh position={[0, H / 2 + 0.02, 0]}>
        <boxGeometry args={[width * 0.92, 0.04, D * 0.7]} />
        <meshStandardMaterial
          color={brick.role === "reply" ? simColors.token : simColors.bandwidth}
          emissive={simColors.bandwidth}
          emissiveIntensity={emphasis * 0.35}
          roughness={0.5}
        />
      </mesh>
      {showLabel ? (
        <Html
          center
          position={[0, H / 2 + 0.28, 0]}
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "10px",
            color: "#e8eef6",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
            textShadow: "0 1px 2px #000",
          }}
          distanceFactor={6}
        >
          {brick.label}
        </Html>
      ) : null}
    </group>
  );
}

function SweepPlane({ x, mode }: { x: number; mode: CacheMode }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 0.85 + Math.sin(clock.elapsedTime * 10) * 0.15;
    const mat = ref.current.material as { opacity?: number };
    if (mat && "opacity" in mat) mat.opacity = pulse;
  });
  return (
    <mesh ref={ref} position={[x, 0.1, 0.35]}>
      <boxGeometry args={[0.06, 1.1, 0.9]} />
      <meshStandardMaterial
        color={mode === "naive" ? simColors.compute : simColors.bandwidth}
        emissive={mode === "naive" ? simColors.compute : simColors.bandwidth}
        emissiveIntensity={0.9}
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </mesh>
  );
}

function NextTokenMote({
  fromX,
  progress,
  label,
  reducedMotion,
}: {
  fromX: number;
  progress: number;
  label: string;
  reducedMotion: boolean;
}) {
  const ref = useRef<Group>(null);
  const t = reducedMotion ? 1 : Math.min(1, Math.max(0, progress));
  const ease = t * t * (3 - 2 * t);
  const x = fromX + 0.55 * ease;
  const y = 0.85 * Math.sin(Math.PI * ease);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 0.9 + Math.sin(clock.elapsedTime * 8) * 0.08;
    ref.current.scale.setScalar(s);
  });

  return (
    <group ref={ref} position={[x, y, 0.2]}>
      <mesh>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial
          color={simColors.token}
          emissive={simColors.token}
          emissiveIntensity={1.1}
          roughness={0.25}
        />
      </mesh>
      <Html
        center
        position={[0, 0.32, 0]}
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: "11px",
          fontWeight: 600,
          color: "#e8eef6",
          pointerEvents: "none",
          textShadow: "0 1px 3px #000",
        }}
        distanceFactor={6}
      >
        {label}
      </Html>
    </group>
  );
}
