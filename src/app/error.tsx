'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="flex bg-gray-50 dark:bg-zinc-950 flex-col items-center justify-center min-h-screen text-center px-4">
            <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-8 rounded-xl shadow-xl max-w-md w-full">
                <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2 dark:text-white">Something went wrong!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {error.message || "An unexpected client-side error occurred."}
                </p>

                {/* Development Helper: Show stack/digest if relevant */}
                <div className="mb-6 p-3 bg-gray-100 dark:bg-zinc-800 rounded text-left overflow-auto max-h-32 text-xs font-mono text-gray-700 dark:text-gray-300 border dark:border-zinc-700">
                    {error.stack}
                </div>

                <div className="flex gap-4 justify-center">
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Reload Page
                    </Button>
                    <Button onClick={() => reset()} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Try Again
                    </Button>
                </div>
            </div>
        </div>
    );
}
