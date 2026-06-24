import { useEffect, useRef } from "react";
import { useGetSettings } from "@workspace/api-client-react";

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    type Particle = { x: number; y: number; size: number; sx: number; sy: number; color: string; alpha: number; pulse: number };
    const particles: Particle[] = [];
    const colors = [
      "rgba(0,212,255,VAL)", "rgba(139,0,255,VAL)", "rgba(255,215,0,VAL)",
      "rgba(0,255,180,VAL)", "rgba(255,60,120,VAL)"
    ];

    for (let i = 0; i < 80; i++) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 3 + 0.5,
        sx: (Math.random() - 0.5) * 0.6,
        sy: (Math.random() - 0.5) * 0.6 - 0.2,
        color: col.replace("VAL", String(Math.random() * 0.4 + 0.2)),
        alpha: Math.random(),
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const render = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      // subtle grid
      ctx.strokeStyle = "rgba(0,212,255,0.03)";
      ctx.lineWidth = 1;
      const g = 60;
      for (let x = 0; x < w; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      particles.forEach(p => {
        p.pulse += 0.02;
        const alpha = 0.3 + Math.sin(p.pulse) * 0.3;
        p.x += p.sx;
        p.y += p.sy;
        if (p.y < -10) p.y = h + 10;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const colorStr = p.color.replace(/[\d.]+\)$/, `${alpha})`);
        ctx.shadowBlur = 8;
        ctx.shadowColor = colorStr;
        ctx.fillStyle = colorStr;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#050510]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0520] via-transparent to-[#050510]" />
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

export function Background() {
  const { data: settings } = useGetSettings();
  const bgType = settings?.bgType ?? "particles";
  const bgValue = settings?.bgValue ?? "";

  if (bgType === "image" && bgValue) {
    return (
      <div
        className="fixed inset-0 z-[-1] pointer-events-none bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${bgValue})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>
    );
  }

  if (bgType === "gradient" && bgValue) {
    return (
      <div
        className="fixed inset-0 z-[-1] pointer-events-none"
        style={{ background: bgValue }}
      />
    );
  }

  if (bgType === "color" && bgValue) {
    return (
      <div
        className="fixed inset-0 z-[-1] pointer-events-none"
        style={{ backgroundColor: bgValue }}
      />
    );
  }

  return <ParticleBackground />;
}
