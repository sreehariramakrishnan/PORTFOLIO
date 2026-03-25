'use client';
import { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import Overlay from './Overlay';

export default function ScrollyCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, 119]);

  useEffect(() => {
    // Preload all 120 frames
    const preloadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 0; i <= 119; i++) {
      const img = new Image();
      const frameNum = i.toString().padStart(3, '0');
      img.src = `/sequence/frame_${frameNum}_delay-0.066s.png`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 120) {
          setImages(preloadedImages);
        }
      };
      preloadedImages.push(img);
    }
  }, []);

  const drawFrame = (index: number) => {
    if (!canvasRef.current || images.length < 120) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const img = images[index];
    if (!img) return;

    const canvas = canvasRef.current;
    
    // Make sure canvas resolution matches its display size
    const { clientWidth, clientHeight } = canvas;
    if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
      canvas.width = clientWidth;
      canvas.height = clientHeight;
    }

    const { width, height } = canvas;
    const r = Math.max(width / img.width, height / img.height);
    const drawWidth = img.width * r;
    const drawHeight = img.height * r;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  };

  useEffect(() => {
    if (images.length === 120) {
      drawFrame(0);
    }
    
    const handleResize = () => drawFrame(Math.floor(frameIndex.get()));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [images]);

  useMotionValueEvent(frameIndex, 'change', (latest) => {
    drawFrame(Math.floor(latest));
  });

  return (
    <div ref={containerRef} className="relative h-[500vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <Overlay scrollYProgress={scrollYProgress} />
      </div>
    </div>
  );
}
