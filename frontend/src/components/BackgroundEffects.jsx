import React, { useEffect, useState } from 'react';
import { DotPattern } from './magicui/DotPattern';
import { Particles } from './magicui/Particles';



/**
 * BackgroundEffects provides dynamic, premium floating animated background blobs
 * and an interactive mouse-tracking dot-pattern grid inspired by Magic UI.
 */
export default function BackgroundEffects() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20 print:hidden select-none">
      {/* Soft Sage Blob */}
      <div 
        className="absolute w-[35rem] h-[35rem] rounded-full bg-cozy-sage/10 blur-[100px] animate-blob-pivot"
        style={{
          top: '-10%',
          left: '-5%',
        }}
      />
      
      {/* Cozy Amber/Gold Blob */}
      <div 
        className="absolute w-[40rem] h-[40rem] rounded-full bg-cozy-amber/5 blur-[120px] animate-blob-pivot-delayed"
        style={{
          bottom: '10%',
          right: '-10%',
        }}
      />

      {/* Subtle Sand/Grey Blob */}
      <div 
        className="absolute w-[30rem] h-[30rem] rounded-full bg-cozy-sand/60 blur-[80px] animate-blob-pivot-slow"
        style={{
          top: '40%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      
      {/* Floating Canvas Particles with Constellation Connections */}
      <Particles 
        className="absolute inset-0 z-0" 
        quantity={180} 
        color="#2D6A53" 
      />



    </div>
  );
}
