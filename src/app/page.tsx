import dynamic from 'next/dynamic';

const QuizMaker = dynamic(() => import('@/components/QuizMaker'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading Quiz Maker...</div>
});

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <QuizMaker />
    </main>
  );
}
