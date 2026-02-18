import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CHARS = 'ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]$#@01';

function getRandomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

export default function MatrixRain({ isActive, onComplete, isClosing }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const columnsRef = useRef([]);
  const phaseRef = useRef('rain'); // 'rain' | 'wipe' | 'done'
  const startTimeRef = useRef(0);
  const prefersReduced = useRef(false);

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const initColumns = useCallback((canvas) => {
    const fontSize = 16;
    const colCount = Math.floor(canvas.width / 20);
    const isMobile = window.innerWidth < 768;
    const density = isMobile ? 0.5 : 0.7;
    const cols = [];

    for (let i = 0; i < colCount; i++) {
      if (Math.random() > density) continue;
      cols.push({
        x: i * 20,
        y: Math.random() * -canvas.height,
        speed: 80 + Math.random() * 160,
        trailLength: 12 + Math.floor(Math.random() * 14),
        chars: Array.from({ length: 30 }, () => getRandomChar()),
        flickerTimer: 0,
      });
    }
    columnsRef.current = cols;
  }, []);

  const drawRain = useCallback((ctx, canvas, dt, elapsed) => {
    // Darken previous frame
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const fontSize = 16;
    ctx.font = `${fontSize}px "Courier New", monospace`;

    columnsRef.current.forEach(col => {
      col.y += col.speed * dt;
      col.flickerTimer += dt;

      // Flicker random chars
      if (col.flickerTimer > 0.05) {
        col.flickerTimer = 0;
        const idx = Math.floor(Math.random() * col.chars.length);
        col.chars[idx] = getRandomChar();
      }

      for (let j = 0; j < col.trailLength; j++) {
        const charY = col.y - j * fontSize;
        if (charY < -fontSize || charY > canvas.height + fontSize) continue;

        const brightness = 1 - j / col.trailLength;

        if (j === 0) {
          // Leading character — bright white-green
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#00FF41';
          ctx.shadowBlur = 12;
        } else if (j < 3) {
          ctx.fillStyle = `rgba(0, 255, 65, ${brightness})`;
          ctx.shadowColor = '#00FF41';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = `rgba(0, 143, 17, ${brightness * 0.8})`;
          ctx.shadowBlur = 0;
        }

        ctx.fillText(col.chars[j % col.chars.length], col.x, charY);
      }

      ctx.shadowBlur = 0;

      // Reset column when fully off screen
      if (col.y - col.trailLength * fontSize > canvas.height) {
        col.y = Math.random() * -200;
        col.speed = 80 + Math.random() * 160;
      }
    });
  }, []);

  const drawWipe = useCallback((ctx, canvas, progress) => {
    // Wipe from top to bottom — clear code revealing black
    const wipeY = progress * (canvas.height + 60);

    // Fade out code above wipe line
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, wipeY);

    // Green glow at wipe edge
    if (progress < 0.95) {
      const gradient = ctx.createLinearGradient(0, wipeY - 20, 0, wipeY + 5);
      gradient.addColorStop(0, 'rgba(0, 255, 65, 0)');
      gradient.addColorStop(0.5, 'rgba(0, 255, 65, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 255, 65, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, wipeY - 20, canvas.width, 25);
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    // Skip animation if reduced motion
    if (prefersReduced.current) {
      setTimeout(() => onComplete(), 300);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth * (window.devicePixelRatio > 1 ? 1.5 : 1);
    canvas.height = window.innerHeight * (window.devicePixelRatio > 1 ? 1.5 : 1);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    initColumns(canvas);
    phaseRef.current = 'rain';
    startTimeRef.current = performance.now();

    const RAIN_DURATION = isClosing ? 800 : 1800;
    const WIPE_DURATION = 700;
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const elapsed = now - startTimeRef.current;

      if (phaseRef.current === 'rain') {
        drawRain(ctx, canvas, dt, elapsed);

        if (elapsed > RAIN_DURATION) {
          phaseRef.current = 'wipe';
          startTimeRef.current = now;
        }
      } else if (phaseRef.current === 'wipe') {
        const wipeElapsed = now - startTimeRef.current;
        const progress = Math.min(wipeElapsed / WIPE_DURATION, 1);

        drawRain(ctx, canvas, dt * (1 - progress * 0.9), elapsed);
        drawWipe(ctx, canvas, progress);

        if (progress >= 1) {
          phaseRef.current = 'done';
          onComplete();
          return;
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isActive, isClosing, initColumns, drawRain, drawWipe, onComplete]);

  // Escape to skip
  useEffect(() => {
    if (!isActive) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[250]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            aria-hidden="true"
          />
          {/* Skip hint */}
          <motion.div
            className="absolute bottom-6 left-0 right-0 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-green-400/50 text-[10px] font-mono">
              Press ESC to skip
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}