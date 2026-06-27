import React, { useEffect, useRef } from "react";

export function Particles({
  className,
  quantity = 180,
  staticity = 50,
  ease = 50,
  color = "#7D8C77",
}) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const canvasSizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext("2d");
    }
    initCanvas();
    animate();
    window.addEventListener("resize", initCanvas);

    return () => {
      window.removeEventListener("resize", initCanvas);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const initCanvas = () => {
    if (canvasRef.current && contextRef.current) {
      canvasSizeRef.current.w = window.innerWidth;
      canvasSizeRef.current.h = window.innerHeight;
      canvasRef.current.width = canvasSizeRef.current.w;
      canvasRef.current.height = canvasSizeRef.current.h;
      particlesRef.current = [];
      for (let i = 0; i < quantity; i++) {
        particlesRef.current.push(createParticle());
      }
    }
  };

  const createParticle = () => {
    const x = Math.random() * canvasSizeRef.current.w;
    const y = Math.random() * canvasSizeRef.current.h;
    const vx = (Math.random() - 0.5) * 0.4;
    const vy = (Math.random() - 0.5) * 0.4;
    const size = Math.random() * 2 + 1;
    const alpha = Math.random() * 0.5 + 0.1;
    return { x, y, vx, vy, size, alpha, targetAlpha: alpha };
  };

  const drawParticle = (p) => {
    if (contextRef.current) {
      contextRef.current.beginPath();
      contextRef.current.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
      contextRef.current.fillStyle = color;
      contextRef.current.globalAlpha = p.alpha;
      contextRef.current.fill();
    }
  };

  const animate = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasSizeRef.current.w, canvasSizeRef.current.h);
      
      const particles = particlesRef.current;
      const len = particles.length;

      // Draw connection lines
      for (let i = 0; i < len; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < len; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            const alpha = (1 - (dist / 90)) * 0.18; // alpha based on proximity
            contextRef.current.beginPath();
            contextRef.current.moveTo(p1.x, p1.y);
            contextRef.current.lineTo(p2.x, p2.y);
            contextRef.current.strokeStyle = color;
            contextRef.current.globalAlpha = alpha;
            contextRef.current.lineWidth = 0.6;
            contextRef.current.stroke();
          }
        }
      }

      particles.forEach((p, idx) => {
        // Move particles toward/away from mouse slightly
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          // Push away slightly
          const force = (150 - dist) / 150;
          p.vx -= (dx / dist) * force * 0.03;
          p.vy -= (dy / dist) * force * 0.03;
        }

        // Apply friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Move
        p.x += p.vx + (Math.random() - 0.5) * 0.05;
        p.y += p.vy + (Math.random() - 0.5) * 0.05;

        // Wrap boundaries
        if (p.x < 0) p.x = canvasSizeRef.current.w;
        if (p.x > canvasSizeRef.current.w) p.x = 0;
        if (p.y < 0) p.y = canvasSizeRef.current.h;
        if (p.y > canvasSizeRef.current.h) p.y = 0;

        drawParticle(p);
      });
      requestAnimationFrame(animate);
    }
  };


  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
