import React, { useEffect, useRef } from 'react';
import { WeatherType } from '../types';

interface WeatherVisualOverlayProps {
  weather: WeatherType;
  opacity?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  color: string;
  type: 'leaf' | 'petal' | 'drop' | 'flare' | 'sparkle';
  opacity: number;
  life: number;
  maxLife: number;
}

export const WeatherVisualOverlay: React.FC<WeatherVisualOverlayProps> = ({
  weather,
  opacity = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const maxParticles = weather === 'tropical_rain' ? 24 : weather === 'falling_leaves' ? 14 : weather === 'sunset_flares' ? 10 : 6;

    const createParticle = (randomY: boolean = false): Particle => {
      const isLeaf = weather === 'falling_leaves';
      const isRain = weather === 'tropical_rain';

      let type: Particle['type'] = 'sparkle';
      let color = '#fbbf24';
      let size = 6;
      let vx = 0;
      let vy = 0;

      if (isRain) {
        type = 'drop';
        size = 2.5 + Math.random() * 3.5;
        vx = (Math.random() - 0.5) * 0.2;
        vy = 2.5 + Math.random() * 4.5; // Gentle, smooth raindrops
        color = 'rgba(186, 230, 253, 0.45)';
      } else if (isLeaf) {
        type = 'leaf';
        size = 10 + Math.random() * 10;
        vx = 0.8 + Math.random() * 1.6; // Gentle drifting breeze
        vy = 0.6 + Math.random() * 1.2;
        const leafColors = ['#f59e0b', '#d97706', '#84cc16', '#65a30d', '#b45309'];
        color = leafColors[Math.floor(Math.random() * leafColors.length)];
      } else {
        // Sunset Golden Flares & Flower Petals
        type = Math.random() > 0.5 ? 'petal' : 'flare';
        size = type === 'petal' ? 8 + Math.random() * 8 : 18 + Math.random() * 25;
        vx = (Math.random() - 0.3) * 0.8;
        vy = 0.4 + Math.random() * 0.8;
        color = type === 'petal' ? 'rgba(254, 240, 138, 0.6)' : 'rgba(251, 191, 36, 0.25)';
      }

      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -20,
        vx,
        vy,
        size,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.04,
        color,
        type,
        opacity: 0.2 + Math.random() * 0.5,
        life: 0,
        maxLife: 300 + Math.random() * 300,
      };
    };

    // Pre-populate particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // 1. Atmosphere Screen Vignette for Rain & Sunset
      if (weather === 'tropical_rain') {
        const grad = ctx.createRadialGradient(
          width / 2, height / 2, width * 0.35,
          width / 2, height / 2, width * 0.85
        );
        grad.addColorStop(0, 'rgba(14, 116, 144, 0.0)');
        grad.addColorStop(1, 'rgba(8, 47, 73, 0.18)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (weather === 'sunset_flares') {
        const flareGrad = ctx.createRadialGradient(
          width * 0.25, height * 0.2, 20,
          width * 0.25, height * 0.2, width * 0.55
        );
        flareGrad.addColorStop(0, 'rgba(251, 146, 60, 0.14)');
        flareGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.06)');
        flareGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
        ctx.fillStyle = flareGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Render & Update Floating Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        // Flutter oscillation for leaves & petals
        if (p.type === 'leaf' || p.type === 'petal') {
          p.x += Math.sin(frame * 0.04 + i) * 1.2;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'drop') {
          // Glass screen water droplet trail
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.6, p.size * 1.8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Droplet highlight shine
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(-p.size * 0.2, -p.size * 0.6, p.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'leaf') {
          // Myanmar Padauk / Frangipani leaf shape
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.7, 0, 0, p.size);
          ctx.quadraticCurveTo(-p.size * 0.7, 0, 0, -p.size);
          ctx.fill();

          // Leaf center vein
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(0, p.size);
          ctx.stroke();
        } else if (p.type === 'petal') {
          // Yellow Frangipani / Padauk flower petal (သပြေပန်း / စကားပန်းပွင့်ဖတ်)
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.5, p.size, Math.PI / 6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Golden sun flare circle
          const flareRad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
          flareRad.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
          flareRad.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
          flareRad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
          ctx.fillStyle = flareRad;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Recycle if out of bounds or expired
        if (p.y > height + 40 || p.x > width + 40 || p.x < -40 || p.life > p.maxLife) {
          particles[i] = createParticle(false);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [weather]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-15 select-none"
      style={{ opacity }}
    />
  );
};
