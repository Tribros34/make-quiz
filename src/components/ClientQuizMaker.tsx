'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const QuizMaker = dynamic(() => import('./QuizMaker'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center min-h-screen">Loading Quiz Maker...</div>
});

export default function ClientQuizMaker() {
    return <QuizMaker />;
}
