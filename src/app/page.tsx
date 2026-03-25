import ScrollyCanvas from '@/components/ScrollyCanvas';
import Projects from '@/components/Projects';

export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen">
      <ScrollyCanvas />
      <Projects />
    </main>
  );
}
