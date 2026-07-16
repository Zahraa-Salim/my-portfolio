import { useEffect, useRef, useState } from "react";

/* Interactive background mini-game: "catch the dots".
   Coral/teal dots drift around; sweep your cursor over one to pop it and
   score. Reacts to mouse/touch movement only — never blocks clicks
   (pointer-events: none), so links/buttons keep working.
   Can be toggled on/off (choice is remembered). */

const CORAL = "255,94,58";
const TEAL = "17,155,142";
const ORB_COUNT = 7;
const ORB_R = 11;      // dot radius
const CATCH_R = 60;    // how close the cursor must get to catch

export default function BackgroundFX() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);

  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = window.localStorage.getItem("game-enabled");
    if (saved !== null) return saved === "1";
    // default OFF if the visitor prefers reduced motion
    return !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("game-enabled", enabled ? "1" : "0");
    } catch {
      /* ignore storage errors */
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = window.innerWidth;
    let H = window.innerHeight;
    let mx = W / 2;
    let my = H / 2;
    let raf = 0;
    let running = true;

    const rand = (a, b) => a + Math.random() * (b - a);

    const makeOrb = () => {
      const teal = Math.random() < 0.5;
      return {
        x: rand(40, W - 40),
        y: rand(40, H - 40),
        vx: rand(-0.5, 0.5) || 0.3,
        vy: rand(-0.5, 0.5) || 0.3,
        r: ORB_R,
        color: teal ? TEAL : CORAL,
        phase: Math.random() * Math.PI * 2,
      };
    };

    let orbs = Array.from({ length: ORB_COUNT }, () => makeOrb());
    let bursts = []; // {x,y,vx,vy,life,color}

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawnBurst = (x, y, color) => {
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
        const sp = rand(1.5, 3.5);
        bursts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, color });
      }
    };

    const onMove = (x, y) => {
      mx = x;
      my = y;
    };
    const mouseHandler = (e) => onMove(e.clientX, e.clientY);
    const touchHandler = (e) => {
      if (e.touches && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const tick = (t) => {
      if (!running) return;

      ctx.clearRect(0, 0, W, H);

      for (let i = orbs.length - 1; i >= 0; i--) {
        const o = orbs[i];
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < o.r || o.x > W - o.r) o.vx *= -1;
        if (o.y < o.r || o.y > H - o.r) o.vy *= -1;
        o.x = Math.max(o.r, Math.min(W - o.r, o.x));
        o.y = Math.max(o.r, Math.min(H - o.r, o.y));

        const dx = o.x - mx;
        const dy = o.y - my;
        if (dx * dx + dy * dy < CATCH_R * CATCH_R) {
          spawnBurst(o.x, o.y, o.color);
          orbs.splice(i, 1);
          orbs.push(makeOrb());
          setScore((s) => s + 1);
          continue;
        }

        const pulse = 1 + Math.sin(t / 500 + o.phase) * 0.12;
        const r = o.r * pulse;
        ctx.beginPath();
        ctx.arc(o.x, o.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${o.color},0.28)`;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(${o.color},0.85)`;
        ctx.stroke();
      }

      for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.life -= 0.04;
        if (p.life <= 0) {
          bursts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = `rgb(${p.color})`;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", mouseHandler, { passive: true });
    window.addEventListener("touchmove", touchHandler, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", mouseHandler);
      window.removeEventListener("touchmove", touchHandler);
    };
  }, [enabled]);

  return (
    <>
      {enabled && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {/* Game canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </div>
      )}

      {/* Toggle + score */}
      <button
        type="button"
        onClick={() => setEnabled((v) => !v)}
        aria-pressed={enabled}
        title="Toggle the background game"
        className="fixed bottom-5 left-5 z-[9998] brut-label text-[10px] font-bold px-3 py-2 bg-bg/80 backdrop-blur-sm border-b-2 transition-colors
          border-ink/20 text-muted hover:text-primary hover:border-primary"
      >
        {enabled
          ? score === 0
            ? "▓ game: on · sweep the dots"
            : `▓ game: on · caught ${score}`
          : "░ game: off"}
      </button>
    </>
  );
}
