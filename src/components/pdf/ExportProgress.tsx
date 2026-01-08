
import React from 'react';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button'; // Assuming we have this
import { cn } from '@/lib/utils'; // Assuming cn utility exists

export type ExportStep = 'idle' | 'preparing' | 'layout' | 'rendering' | 'finalizing' | 'done' | 'error';

interface ExportProgressProps {
    isOpen: boolean;
    currentStep: ExportStep;
    error: string | null;
    onCancel: () => void;
    onRetry: () => void;
}

export const ExportProgress = ({ isOpen, currentStep, error, onCancel, onRetry }: ExportProgressProps) => {
    if (!isOpen) return null;

    const steps: { id: ExportStep; label: string }[] = [
        { id: 'preparing', label: 'Preparing content...' },
        { id: 'layout', label: 'Laying out pages...' },
        { id: 'rendering', label: 'Generating PDF...' },
        { id: 'finalizing', label: 'Finalizing download...' },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    const isError = currentStep === 'error';
    const isDone = currentStep === 'done';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md p-6 border dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center mb-6">
                    {isError ? (
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                    ) : isDone ? (
                        <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                            <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
                        </div>
                    )}

                    <h3 className="text-xl font-semibold text-center dark:text-white">
                        {isError ? 'Export Failed' : isDone ? 'Export Complete' : 'Exporting PDF'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                        {isError ? 'Something went wrong during export.' : isDone ? 'Your download should start automatically.' : 'Please wait while we generate your file.'}
                    </p>
                </div>

                {!isError && !isDone && (
                    <div className="space-y-4 mb-6">
                        {steps.map((step, index) => {
                            // Calculate step status
                            const isCompleted = currentStepIndex > index;
                            const isCurrent = step.id === currentStep;
                            // Pending if not completed and not current
                            // const isPending = !isCompleted && !isCurrent;

                            return (
                                <div key={step.id} className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-6 w-6 rounded-full flex items-center justify-center text-xs border transition-colors",
                                        isCompleted ? "bg-blue-600 border-blue-600 text-white" :
                                            isCurrent ? "border-blue-600 text-blue-600 animate-pulse" :
                                                "border-gray-300 dark:border-zinc-700 text-gray-300 dark:text-zinc-600"
                                    )}>
                                        {isCompleted ? "✓" : index + 1}
                                    </div>
                                    <span className={cn(
                                        "text-sm transition-colors",
                                        isCompleted || isCurrent ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-400 dark:text-zinc-600"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {isError && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-md p-4 mb-6">
                        <div className="flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                            <p className="text-sm text-red-800 dark:text-red-300">
                                {error || "unknown error occurred."}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    {isError ? (
                        <>
                            <Button variant="ghost" onClick={onCancel}>Close</Button>
                            <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700 text-white">Try Again</Button>
                        </>
                    ) : isDone ? (
                        <Button onClick={onCancel} className="w-full bg-green-600 hover:bg-green-700 text-white">Done</Button>
                    ) : (
                        <Button variant="outline" onClick={onCancel} className="w-full">Cancel Export</Button>
                    )}
                </div>
            </div>
        </div>
    );
};
