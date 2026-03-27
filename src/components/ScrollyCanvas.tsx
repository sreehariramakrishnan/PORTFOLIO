'use client';
import { useRef, useEffect, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import dynamic from 'next/dynamic';
import Overlay from './Overlay';

function ScrollyCanvasContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    // Preload all 120 frames
    const preloadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 0; i <= 119; i++) {
      const img = new Image();
      const frameNum = i.toString().padStart(3, '0');
      
      // STEP 3: Assign onload BEFORE src to ensure cached images fire properly
      img.onload = () => {
        loadedCount++;
        // Log image loading to confirm readiness
        console.log(`[Image Loader] Loaded frame ${loadedCount}/120`);
        if (loadedCount === 120) {
          console.log('[Image Loader] All 120 frames loaded! Setting state.');
          setImages(preloadedImages);
        }
      };
      // Set src after the handler is bound
      img.src = `/sequence/frame_${frameNum}_delay-0.066s.png`;
      preloadedImages.push(img);
    }
  }, []);

  const drawFrame = (index: number) => {
    // STEP 1: VERIFY CLIENT EXECUTION
    if (typeof window === "undefined") return;
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
    
    // STEP 4/5 debug trace proving canvas draws
    console.log(`[Canvas] Redrew canvas with frame index: ${index}`);
  };

  useEffect(() => {
    if (images.length === 120) {
      drawFrame(0);
    }
    
    const handleResize = () => drawFrame(Math.floor(scrollYProgress.get() * 119));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [images]);

  // STEP 6: FORCE UPDATE LOGIC (direct scroll calculation instead of useTransform)
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const frameIndex = Math.floor(latest * 119); // 120 frames total (0 to 119)
    // STEP 2: VERIFY SCROLL SIGNAL logging
    console.log(`[Scroll Event] Progress: ${latest.toFixed(4)} | Calculated Frame: ${frameIndex}`);
    drawFrame(frameIndex);
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

// STEP 5: HYDRATION / SSR FIX
export default dynamic(() => Promise.resolve(ScrollyCanvasContent), { ssr: false });
