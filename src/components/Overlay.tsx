'use client';
import { motion, MotionValue, useTransform } from 'framer-motion';

interface Props {
  scrollYProgress: MotionValue<number>;
}

export default function Overlay({ scrollYProgress }: Props) {
  // Section 1: 0% -> "My Name. Web Developer." (center)
  const opacity1 = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.25], [0, -50]);

  // Section 2: 30% -> "I build digital experiences." (left)
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.35, 0.45, 0.55], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.2, 0.55], [50, -50]);

  // Section 3: 60% -> "Bridging design and engineering." (right)
  const opacity3 = useTransform(scrollYProgress, [0.5, 0.65, 0.85, 0.95], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.5, 0.95], [50, -50]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <motion.div
        style={{ opacity: opacity1, y: y1 }}
        className="absolute inset-0 flex items-center justify-center p-8"
      >
        <h1 className="text-white text-5xl md:text-7xl font-bold tracking-tighter text-center drop-shadow-lg">
          Sreehari.<br />Web Developer.
        </h1>
      </motion.div>

      <motion.div
        style={{ opacity: opacity2, y: y2 }}
        className="absolute inset-0 flex items-center justify-start p-8 md:p-24"
      >
        <h2 className="text-white text-4xl md:text-6xl font-medium tracking-tight max-w-2xl drop-shadow-lg">
          I build digital experiences.
        </h2>
      </motion.div>

      <motion.div
        style={{ opacity: opacity3, y: y3 }}
        className="absolute inset-0 flex items-center justify-end p-8 md:p-24 text-right"
      >
        <h2 className="text-white text-4xl md:text-6xl font-medium tracking-tight max-w-2xl drop-shadow-lg">
          Bridging design and engineering.
        </h2>
      </motion.div>
    </div>
  );
}
