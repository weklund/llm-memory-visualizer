import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  TIMELINE_SCENARIOS,
  pastLengthAt,
  type TimelineScenarioId,
} from "@/lib/lesson1Demo";
import {
  bricksAt,
  workForPass,
  type CacheMode,
} from "@/lib/decodeStage";
import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import { budgetFor, detectDeviceClass } from "@/lib/geometryBudget";
import { DecodeStageScene, type DecodePhase } from "./DecodeStageScene";
import styles from "./DecodeStage.module.css";

const SWEEP_MS = 900;
const EMIT_MS = 420;
const GAP_MS = 380;

/**
 * Spike: 3D token ribbon + full-pass sweep + append.
 * Same scenarios as GenerationTimeline; toggle naive recompute vs KV cache.
 */
export function DecodeStage() {
  const [scenarioId, setScenarioId] = useState<TimelineScenarioId>("growing-reply");
  const scenario = useMemo(
    () => TIMELINE_SCENARIOS.find((s) => s.id === scenarioId) ?? TIMELINE_SCENARIOS[1]!,
    [scenarioId],
  );

  const total = scenario.replyTokens.length;
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<DecodePhase>("idle");
  const [sweepProgress, setSweepProgress] = useState(0);
  const [emitProgress, setEmitProgress] = useState(0);
  const [cacheMode, setCacheMode] = useState<CacheMode>("naive");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const reduceMotion = usePrefersReducedMotion();

  const rafRef = useRef<number | null>(null);
  const playTimer = useRef<number | null>(null);
  const animGen = useRef(0);

  const bricks = useMemo(() => bricksAt(scenario, step), [scenario, step]);
  const pastLength = pastLengthAt(scenario, step);
  const done = step >= total;
  const nextToken = done ? null : scenario.replyTokens[step]!;
  const work = workForPass(pastLength, cacheMode);
  const workMax = Math.max(1, pastLength);

  const replySoFar = scenario.replyTokens.slice(0, step).join(" ");
  const glConfig = useMemo(() => {
    const budget = budgetFor(detectDeviceClass());
    return {
      dpr: [1, budget.dprMax] as [number, number],
      antialias: budget.antialias,
    };
  }, []);

  const clearRaf = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const clearPlay = () => {
    if (playTimer.current != null) {
      window.clearTimeout(playTimer.current);
      playTimer.current = null;
    }
  };

  const clearAll = () => {
    clearRaf();
    clearPlay();
    animGen.current += 1;
  };

  const selectScenario = (id: TimelineScenarioId) => {
    clearAll();
    setPlaying(false);
    setPhase("idle");
    setSweepProgress(0);
    setEmitProgress(0);
    setStep(0);
    setScenarioId(id);
  };

  const setMode = (mode: CacheMode) => {
    clearAll();
    setPlaying(false);
    setPhase("idle");
    setSweepProgress(0);
    setEmitProgress(0);
    setCacheMode(mode);
  };

  const runOnePass = useCallback(() => {
    if (step >= total || phase !== "idle") return;

    if (reduceMotion) {
      setStep((s) => Math.min(total, s + 1));
      setPhase("idle");
      setSweepProgress(0);
      setEmitProgress(0);
      return;
    }

    const gen = ++animGen.current;
    const sweepDur = SWEEP_MS / speed;
    const emitDur = EMIT_MS / speed;
    setPhase("sweeping");
    setSweepProgress(0);
    setEmitProgress(0);

    const t0 = performance.now();

    const tick = (now: number) => {
      if (gen !== animGen.current) return;
      const elapsed = now - t0;

      if (elapsed < sweepDur) {
        setPhase("sweeping");
        setSweepProgress(elapsed / sweepDur);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (elapsed < sweepDur + emitDur) {
        setPhase("emitting");
        setSweepProgress(1);
        setEmitProgress((elapsed - sweepDur) / emitDur);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      setPhase("idle");
      setSweepProgress(0);
      setEmitProgress(0);
      setStep((s) => Math.min(total, s + 1));
      rafRef.current = null;
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [step, total, phase, reduceMotion, speed]);

  const reset = () => {
    clearAll();
    setPlaying(false);
    setPhase("idle");
    setSweepProgress(0);
    setEmitProgress(0);
    setStep(0);
  };

  useEffect(() => {
    if (!playing || reduceMotion) return;
    if (step >= total) {
      setPlaying(false);
      return;
    }
    if (phase !== "idle") return;

    clearPlay();
    playTimer.current = window.setTimeout(() => {
      runOnePass();
    }, GAP_MS / speed);

    return () => clearPlay();
  }, [playing, step, phase, total, reduceMotion, speed, runOnePass]);

  useEffect(() => () => clearAll(), []);

  const liveStatus = (() => {
    if (done) {
      return `Done. Reply is ${total} tokens. Past length ${pastLength}.`;
    }
    if (phase === "sweeping") {
      return cacheMode === "naive"
        ? `Full pass sweeping the past (${pastLength} tokens)…`
        : `Pass with cache: write new K/V, read the rest (${pastLength} past)…`;
    }
    if (phase === "emitting") {
      return `Next token ready: “${nextToken}” — appending to the past.`;
    }
    return `Ready for step ${step + 1} of ${total}. Next token will be “${nextToken}”.`;
  })();

  return (
    <figure className={styles.figure} aria-label="Decode stage: full pass then next token">
      <figcaption className={styles.caption}>
        <strong>Spike · Decode stage.</strong> Each step: a light sweeps the past (one full
        model pass), a token appears, then that token becomes a new brick on the ribbon.
        Toggle <em>naive</em> vs <em>KV cache</em> to see how much work the sweep implies.
      </figcaption>

      <div className={styles.scenarios} role="radiogroup" aria-label="Context scenario">
        {TIMELINE_SCENARIOS.map((s) => (
          <label
            key={s.id}
            className={s.id === scenarioId ? styles.scenarioActive : styles.scenario}
          >
            <input
              type="radio"
              name="decode-scenario"
              checked={s.id === scenarioId}
              onChange={() => selectScenario(s.id)}
            />
            {s.label}
          </label>
        ))}
      </div>
      <p className={styles.scenarioBlurb}>{scenario.blurb}</p>

      <div className={styles.modeRow}>
        <span className={styles.modeLabel}>Work model</span>
        <button
          type="button"
          className={cacheMode === "naive" ? styles.modeActive : styles.mode}
          onClick={() => setMode("naive")}
          aria-pressed={cacheMode === "naive"}
        >
          Naive recompute
        </button>
        <button
          type="button"
          className={cacheMode === "kv" ? styles.modeActiveKv : styles.mode}
          onClick={() => setMode("kv")}
          aria-pressed={cacheMode === "kv"}
        >
          KV cache
        </button>
      </div>

      <div className={styles.status} aria-live="polite">
        {liveStatus}
        <span className={styles.statusMeta}>
          Past length {pastLength} · full runs so far {step}
          {done ? "" : ` · next “${nextToken}”`}
        </span>
        <span className={styles.statusMeta}>{work.label}</span>
        <div
          className={styles.workBar}
          title={work.label}
          role="img"
          aria-label={work.label}
        >
          <span
            className={styles.workRecompute}
            style={{ width: `${(work.recompute / workMax) * 100}%` }}
          />
          <span
            className={styles.workRead}
            style={{ width: `${(work.cacheRead / workMax) * 100}%` }}
          />
        </div>
      </div>

      <div className={styles.canvasWrap}>
        <span className={styles.canvasLabel}>3D · drag to orbit · auto-frames as the past grows</span>
        <Canvas
          className={styles.canvas}
          camera={{ position: [0, 2.4, 6.2], fov: 40 }}
          dpr={glConfig.dpr}
          gl={{
            antialias: glConfig.antialias,
            alpha: false,
            powerPreference: "high-performance",
            stencil: false,
          }}
          frameloop="always"
          role="img"
          aria-label={liveStatus}
        >
          <Suspense fallback={null}>
            <DecodeStageScene
              bricks={bricks}
              sweepProgress={sweepProgress}
              emitProgress={emitProgress}
              phase={phase}
              cacheMode={cacheMode}
              nextToken={nextToken}
              reducedMotion={reduceMotion}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className={styles.strip}>
        <span className={styles.stripLabel}>Text so far (a11y twin)</span>
        <div className={styles.stripText}>
          <span>{scenario.promptDisplay}</span>
          {replySoFar ? (
            <>
              {" "}
              <strong>{replySoFar}</strong>
            </>
          ) : null}
          {!done && phase !== "idle" && nextToken ? (
            <>
              {" "}
              <span className={styles.stripNext}>→ {nextToken}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={() => runOnePass()}
          disabled={done || phase !== "idle"}
        >
          Step
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={() => {
            if (done) return;
            if (playing) {
              setPlaying(false);
              return;
            }
            setPlaying(true);
            if (phase === "idle") runOnePass();
          }}
          disabled={done && !playing}
          aria-pressed={playing}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" className={styles.btn} onClick={reset}>
          Reset
        </button>
        <div className={styles.speed} role="group" aria-label="Playback speed">
          {([1, 2] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={speed === s ? styles.speedBtnActive : styles.speedBtn}
              onClick={() => setSpeed(s)}
              aria-pressed={speed === s}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      <div className={styles.legend}>
        <span className={`${styles.legendItem} ${styles.legendPrior}`}>prior turns</span>
        <span className={`${styles.legendItem} ${styles.legendPrompt}`}>prompt</span>
        <span className={`${styles.legendItem} ${styles.legendReply}`}>reply</span>
        <span className={`${styles.legendItem} ${styles.legendSweep}`}>pass sweep</span>
      </div>
    </figure>
  );
}
