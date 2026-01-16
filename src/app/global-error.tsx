'use client';

import { useEffect } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import './globals.css';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex bg-gray-50 dark:bg-zinc-950 flex-col items-center justify-center min-h-screen text-center px-4">
                    <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-8 rounded-xl shadow-xl max-w-md w-full">
                        <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 dark:text-white">Critical Error</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {error.message || "A critical error occurred in the root layout."}
                        </p>

                        <div className="mb-6 p-3 bg-gray-100 dark:bg-zinc-800 rounded text-left overflow-auto max-h-32 text-xs font-mono text-gray-700 dark:text-gray-300 border dark:border-zinc-700">
                            {error.stack}
                        </div>

                        <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
                            <RotateCcw className="h-4 w-4" />
                            Reload Application
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    );
}
