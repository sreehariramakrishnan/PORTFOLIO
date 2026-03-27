'use client';

import { useRef, useEffect, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import dynamic from 'next/dynamic';
import Overlay from './Overlay';

const TOTAL_FRAMES = 120;

function ScrollyCanvasContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const ticking = useRef(false);

  const [loaded, setLoaded] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // 🔥 PRELOAD IMAGES (NON-BLOCKING)
  useEffect(() => {
    const imgs: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = i.toString().padStart(3, '0');

      img.src = `/sequence/frame_${frameNum}_delay-0.066s.png`;

      img.onload = () => {
        setLoaded((prev) => prev + 1);
      };

      imgs.push(img);
    }

    imagesRef.current = imgs;
  }, []);

  // 🎯 DRAW FRAME (OPTIMIZED + DPR SUPPORT)
  const drawFrame = (index: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img) return;

    const { clientWidth, clientHeight } = canvas;

    const dpr = window.devicePixelRatio || 1;

    if (
      canvas.width !== clientWidth * dpr ||
      canvas.height !== clientHeight * dpr
    ) {
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const scale = Math.max(
      clientWidth / img.width,
      clientHeight / img.height
    );

    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    const x = (clientWidth - drawWidth) / 2;
    const y = (clientHeight - drawHeight) / 2;

    ctx.clearRect(0, 0, clientWidth, clientHeight);
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  };

  // 🎬 INITIAL FRAME
  useEffect(() => {
    if (loaded > 0) {
      drawFrame(0);
    }
  }, [loaded]);

  // 🚀 THROTTLED SCROLL RENDERING
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    frameRef.current = Math.floor(latest * (TOTAL_FRAMES - 1));

    if (!ticking.current) {
      ticking.current = true;

      requestAnimationFrame(() => {
        drawFrame(frameRef.current);
        ticking.current = false;
      });
    }
  });

  // 📱 HANDLE RESIZE
  useEffect(() => {
    const handleResize = () => {
      drawFrame(frameRef.current);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="relative h-[500vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
        />

        {/* Optional loading indicator */}
        {loaded < TOTAL_FRAMES && (
          <div className="absolute inset-0 flex items-center justify-center text-white z-20">
            Loading {loaded}/{TOTAL_FRAMES}
          </div>
        )}

        <Overlay scrollYProgress={scrollYProgress} />
      </div>
    </div>
  );
}

// 🚨 FORCE CLIENT-ONLY (CRITICAL FOR NEXT.JS)
export default dynamic(() => Promise.resolve(ScrollyCanvasContent), {
  ssr: false,
});