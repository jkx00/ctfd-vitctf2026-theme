// Lightweight animated "network" background — a hand-rolled equivalent of the
// Vanta.NET look (dark canvas, drifting nodes, connecting lines, mouse
// interaction) implemented on a plain <canvas>. We intentionally avoid the
// vanta/three.js packages here: vanta's last release targets an old
// three.js API surface and this theme already pins a very recent three.js
// for the 3D scoreboard, so pulling vanta in risks a broken/incompatible
// runtime for very little visual benefit over a small canvas routine we can
// fully control (perf budget, reduced-motion, mobile).
export default function initNetworkBackground() {
  const canvas = document.getElementById("cyber-net-canvas");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    canvas.remove();
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const isCoarsePointer = window.matchMedia("(hover: none)").matches;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let mouse = { x: -9999, y: -9999, active: false };
  let rafId = null;
  let visible = true;

  const density = isMobile ? 22000 : 14000; // px^2 per particle
  const maxParticles = isMobile ? 40 : 90;
  const linkDistance = isMobile ? 110 : 150;
  const mouseLinkDistance = 170;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(maxParticles, Math.floor((width * height) / density));
    particles = new Array(count).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));
  }

  function step() {
    if (!visible) {
      rafId = requestAnimationFrame(step);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));
    }

    // Links between nearby particles
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDistance) {
          const alpha = (1 - dist / linkDistance) * 0.16;
          ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Link to mouse
      if (mouse.active) {
        const dx = a.x - mouse.x;
        const dy = a.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseLinkDistance) {
          const alpha = (1 - dist / mouseLinkDistance) * 0.35;
          ctx.strokeStyle = `rgba(0, 217, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    // Nodes
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 255, 136, 0.55)";
      ctx.fill();
    }

    rafId = requestAnimationFrame(step);
  }

  let resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }

  let lastMouseUpdate = 0;
  function onPointerMove(event) {
    const now = performance.now();
    if (now - lastMouseUpdate < 32) return; // ~30fps throttle
    lastMouseUpdate = now;
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  }

  function onPointerLeave() {
    mouse.active = false;
  }

  function onVisibilityChange() {
    visible = document.visibilityState === "visible";
  }

  resize();
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibilityChange);

  if (!isCoarsePointer) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
  }

  rafId = requestAnimationFrame(step);

  window.addEventListener(
    "pagehide",
    () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    },
    { once: true },
  );
}
