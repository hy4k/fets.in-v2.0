import { useEffect, useRef } from 'react';

// --- Particle class ---
function createParticle(w, h) {
  const colors = [
    [255, 215, 0],   // gold
    [3, 174, 210],   // cyan
    [255, 255, 255], // white
    [255, 190, 50],  // warm gold
    [100, 220, 255], // light cyan
  ];
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() * 2 + 0.5,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: (Math.random() - 0.5) * 0.2 - 0.1,
    opacity: Math.random() * 0.5 + 0.1,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.02 + 0.005,
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

function updateParticle(p, w, h) {
  p.x += p.speedX;
  p.y += p.speedY;
  p.pulse += p.pulseSpeed;
  if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
    Object.assign(p, createParticle(w, h));
    p.y = p.speedY < 0 ? h + 5 : -5;
    p.x = Math.random() * w;
  }
}

function drawParticle(ctx, p) {
  const alpha = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha})`;
  ctx.fill();
  if (p.size > 1) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha * 0.15})`;
    ctx.fill();
  }
}

// --- Aurora drawing ---
function drawAurora(ctx, w, h, t, index, total) {
  const baseY = 0.3 + (index / total) * 0.4;
  const isGold = index % 2 === 0;
  const segments = 80;

  ctx.beginPath();
  for (let j = 0; j <= segments; j++) {
    const x = (j / segments) * w;
    const wave1 = Math.sin((j / segments) * Math.PI * 2 + t * 0.3 + index) * (h * 0.08);
    const wave2 = Math.sin((j / segments) * Math.PI * 3.5 + t * 0.2 + index * 2) * (h * 0.04);
    const wave3 = Math.sin((j / segments) * Math.PI * 1.2 + t * 0.15) * (h * 0.06);
    const y = baseY * h + wave1 + wave2 + wave3;
    if (j === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  const grad = ctx.createLinearGradient(0, 0, w, 0);
  if (isGold) {
    grad.addColorStop(0, 'rgba(255, 215, 0, 0)');
    grad.addColorStop(0.2, 'rgba(255, 215, 0, 0.04)');
    grad.addColorStop(0.5, 'rgba(255, 190, 50, 0.07)');
    grad.addColorStop(0.8, 'rgba(255, 215, 0, 0.04)');
    grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
  } else {
    grad.addColorStop(0, 'rgba(3, 174, 210, 0)');
    grad.addColorStop(0.3, 'rgba(3, 174, 210, 0.03)');
    grad.addColorStop(0.5, 'rgba(100, 220, 255, 0.06)');
    grad.addColorStop(0.7, 'rgba(3, 174, 210, 0.03)');
    grad.addColorStop(1, 'rgba(3, 174, 210, 0)');
  }

  ctx.strokeStyle = grad;
  ctx.lineWidth = h * 0.12;
  ctx.stroke();
}

// --- Light streaks ---
function drawLightStreaks(ctx, w, h, t) {
  for (let i = 0; i < 3; i++) {
    const progress = ((t * 0.1 + i * 3.3) % 10) / 10;
    const x = progress * w * 1.4 - w * 0.2;
    const alpha = Math.sin(progress * Math.PI) * 0.06;

    const grad = ctx.createLinearGradient(x - 100, 0, x + 100, h);
    grad.addColorStop(0, `rgba(255, 215, 0, 0)`);
    grad.addColorStop(0.4, `rgba(255, 215, 0, ${alpha})`);
    grad.addColorStop(0.6, `rgba(255, 255, 255, ${alpha * 0.8})`);
    grad.addColorStop(1, `rgba(3, 174, 210, 0)`);

    ctx.beginPath();
    ctx.moveTo(x - 60, 0);
    ctx.lineTo(x + 30, 0);
    ctx.lineTo(x - 30, h);
    ctx.lineTo(x - 120, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

// --- Spotlight ---
function drawSpotlight(ctx, w, h, t) {
  const cx = w * 0.5 + Math.sin(t * 0.15) * w * 0.1;
  const cy = h * 0.35 + Math.cos(t * 0.1) * h * 0.05;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.7);
  grad.addColorStop(0, 'rgba(255, 215, 0, 0.06)');
  grad.addColorStop(0.3, 'rgba(3, 174, 210, 0.03)');
  grad.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Cinematic animated canvas background for the hero section.
 */
export default function HeroBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let w, h;
    let particles = [];
    let time = 0;
    const auroraCount = 4;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      resize();
      particles = Array.from({ length: 80 }, () => createParticle(w, h));
    };

    const render = () => {
      time += 0.016;

      // Dark base
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, w, h);

      // Dark gradient overlay
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, 'rgba(5, 12, 30, 0.8)');
      bgGrad.addColorStop(0.5, 'rgba(8, 15, 25, 0.5)');
      bgGrad.addColorStop(1, 'rgba(3, 8, 18, 0.9)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      drawSpotlight(ctx, w, h, time);

      for (let i = 0; i < auroraCount; i++) {
        drawAurora(ctx, w, h, time, i, auroraCount);
      }

      drawLightStreaks(ctx, w, h, time);

      particles.forEach((p) => {
        updateParticle(p, w, h);
        drawParticle(ctx, p);
      });

      // Vignette
      const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.75);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(render);
    };

    init();
    render();

    const onResize = () => {
      cancelAnimationFrame(animId);
      init();
      render();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
