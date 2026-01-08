import React, { useMemo, useState } from 'react';
import { QuizState, PDFPreset, Question } from '@/lib/types';
import { getPreset } from '@/lib/pdfPresets';
import { paginateQuestions, PDFPage } from '@/components/pdf/utils/pdfHelpers';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import parse, { DOMNode, Element, domToReact } from 'html-react-parser';

interface QuizPreviewProps {
    state: QuizState;
    onExit: () => void;
}

// Helper to render HTML content (matches PDF mostly)
const HtmlContent = ({ html, fontSize }: { html: string, fontSize: number }) => {
    return (
        <div
            className="prose max-w-none mb-4"
            style={{ fontSize: `${fontSize}pt` }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

export function QuizPreview({ state, onExit }: QuizPreviewProps) {
    const { title, content, settings } = state;
    const preset = getPreset(settings.selectedPresetId);
    const [viewMode, setViewMode] = useState<'student' | 'teacher'>('student');

    // styles from preset
    const { styles } = preset;

    // Memoize pagination to avoid re-calc on every render if state doesn't change
    // effectively reuse logic from PDF generation
    const pages = useMemo(() => {
        // We need to normalize or just pass sections?
        // paginateQuestions expects sections.
        return paginateQuestions(state.sections, preset);
    }, [state.sections, preset]);

    const A4_WIDTH_PX = 794; // 210mm @ 96dpi
    const A4_HEIGHT_PX = 1123; // 297mm @ 96dpi

    // Page style object
    const pageStyle = {
        width: A4_WIDTH_PX,
        minHeight: A4_HEIGHT_PX,
        padding: `${styles.contentPadding}pt`,
        fontFamily: 'Roboto, sans-serif', // Fallback
        fontSize: `${styles.fontSize}pt`,
        lineHeight: styles.lineHeight,
        color: '#333',
    };

    return (
        <div className="fixed inset-0 z-50 bg-zinc-100 dark:bg-zinc-950 flex flex-col animate-in fade-in duration-200">
            {/* Toolbar */}
            <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onExit} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Edit
                    </Button>
                    <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
                    <h2 className="font-semibold text-lg">{title || 'Untitled Quiz'} (Preview)</h2>
                    <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                        {preset.name} Preset
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg mr-4">
                        <button
                            onClick={() => setViewMode('student')}
                            className={cn(
                                "px-3 py-1 text-sm font-medium rounded-md transition-all",
                                viewMode === 'student' ? "bg-white shadow text-black" : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            Student
                        </button>
                        <button
                            onClick={() => setViewMode('teacher')}
                            className={cn(
                                "px-3 py-1 text-sm font-medium rounded-md transition-all",
                                viewMode === 'teacher' ? "bg-white shadow text-black" : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            Teacher
                        </button>
                    </div>
                    <Button onClick={() => window.print()} variant="outline" className="gap-2">
                        <Printer className="h-4 w-4" />
                        Print / Save PDF
                    </Button>
                </div>
            </div>

            {/* Scrollable Preview Area */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 flex flex-col items-center gap-8 print:p-0 print:overflow-visible">
                <style>{`
                    @media print {
                        @page { margin: 0; size: auto; }
                        body { background: white; }
                        .no-print { display: none !important; }
                        .print-page { margin: 0 !important; box-shadow: none !important; break-after: page; }
                    }
                `}</style>

                {/* Cover Page */}
                {settings.coverPage && (
                    <div
                        className="bg-white text-black shadow-lg print-page flex flex-col items-center justify-center text-center relative"
                        style={pageStyle}
                    >
                        <h1 style={{ fontSize: '24pt', fontWeight: 'bold', marginBottom: '20pt' }}>
                            {title || 'Untitled Quiz'}
                        </h1>
                        {settings.description && (
                            <p style={{ fontSize: '14pt', color: '#666', marginBottom: '30pt', maxWidth: '80%' }}>
                                {settings.description}
                            </p>
                        )}
                        <p style={{ fontSize: '12pt', color: '#999' }}>
                            {new Date().toLocaleDateString()}
                        </p>
                    </div>
                )}

                {/* Content / Preamble Page */}
                {content && content !== '<p></p>' && content !== '<p>Start typing your content here...</p>' && (
                    <div
                        className="bg-white text-black shadow-lg print-page relative"
                        style={pageStyle}
                    >
                        <div className="border-b border-gray-200 pb-2 mb-8 text-center text-gray-500 text-sm">
                            {title}
                        </div>
                        <HtmlContent html={content} fontSize={styles.fontSize} />

                        <div className="absolute bottom-8 left-0 right-0 text-center text-gray-400 text-xs">
                            Page {settings.coverPage ? 2 : 1}
                        </div>
                    </div>
                )}

                {/* Question Pages */}
                {pages.map((pageItems, pageIdx) => (
                    <div
                        key={`page-${pageIdx}`}
                        className="bg-white text-black shadow-lg print-page relative"
                        style={pageStyle}
                    >
                        {/* Header */}
                        <div className="border-b border-gray-200 pb-2 mb-8 text-center text-gray-500 text-sm">
                            {title}
                        </div>

                        {/* Items */}
                        <div className="flex flex-col">
                            {pageItems.map((item, idx) => {
                                if (item.type === 'section-header') {
                                    if (!settings.showSectionTitles) return null;
                                    return (
                                        <div key={`sec-${item.section.id}`} className="mb-4 mt-4 border-b pb-2">
                                            <h3 style={{ fontSize: `${styles.fontSize * 1.4}pt`, fontWeight: 'bold' }}>
                                                {item.section.title}
                                            </h3>
                                            {item.section.description && (
                                                <p style={{ fontSize: `${styles.fontSize * 0.9}pt`, color: '#666', marginTop: '4pt' }}>
                                                    {item.section.description}
                                                </p>
                                            )}
                                        </div>
                                    );
                                } else {
                                    const q = item.question;
                                    return (
                                        <div key={q.id} style={{ marginBottom: `${styles.questionSpacing}pt` }}>
                                            <div className="flex flex-row items-baseline">
                                                {settings.showQuestionNumbers && (
                                                    <span style={{ width: '25pt', fontWeight: 'bold', flexShrink: 0 }}>
                                                        {q.number}.
                                                    </span>
                                                )}
                                                <div className="flex-1">
                                                    <div style={{ fontWeight: 'bold', marginBottom: '6pt' }}>
                                                        {q.text}
                                                    </div>
                                                    <div className="pl-2 space-y-1">
                                                        {(!q.type || q.type === 'multiple-choice') && (q.options || []).map((opt, optIdx) => (
                                                            <div key={optIdx} className="flex gap-2 items-center">
                                                                <span className={cn(
                                                                    "font-bold width-20pt",
                                                                    viewMode === 'teacher' && q.correctAnswer === optIdx ? "text-green-600 bg-green-50 px-1 rounded" : ""
                                                                )} style={{ width: '20pt' }}>
                                                                    {String.fromCharCode(65 + optIdx)}
                                                                </span>
                                                                <span className={cn(
                                                                    viewMode === 'teacher' && q.correctAnswer === optIdx ? "font-medium text-green-700" : ""
                                                                )}>{opt}</span>
                                                            </div>
                                                        ))}

                                                        {q.type === 'true-false' && (
                                                            <div className="flex gap-6 mt-2">
                                                                <span className={cn(viewMode === 'teacher' && q.correctValue === true ? "text-green-600 font-bold bg-green-50 px-2 rounded" : "")}>○ True</span>
                                                                <span className={cn(viewMode === 'teacher' && q.correctValue === false ? "text-green-600 font-bold bg-green-50 px-2 rounded" : "")}>○ False</span>
                                                            </div>
                                                        )}

                                                        {q.type === 'short-answer' && (
                                                            <div className="mt-4">
                                                                <div className="border-b border-black w-full h-px" />
                                                                {viewMode === 'teacher' && (
                                                                    <div className="text-sm text-green-600 font-medium mt-1">
                                                                        Answer: {q.expectedAnswer || '(No answer provided)'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        </div>

                        <div className="absolute bottom-8 left-0 right-0 text-center text-gray-400 text-xs">
                            Page {pageIdx + (settings.coverPage ? (content ? 3 : 2) : (content ? 2 : 1))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
