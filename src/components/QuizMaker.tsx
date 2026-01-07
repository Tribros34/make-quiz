'use client';

import { useState, useEffect, useRef } from 'react';
import { QuizState, Question } from '@/lib/types';
import TextEditor from '@/components/editor/TextEditor';
import { QuestionBuilder } from '@/components/questions/QuestionBuilder';
import { LivePreview } from '@/components/preview/LivePreview';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { pdf } from '@react-pdf/renderer';
import { PDFDocument } from '@/components/pdf/PDFDocument';
import { parseTxtToQuiz } from '@/lib/txtParser';
import { Save, Download, FilePlus, Settings, Printer, FileText, Smartphone, Upload, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
// import { generatePDF } from '@/lib/pdfGenerator'; // To be implemented

const INITIAL_STATE: QuizState = {
    title: '',
    content: '<p>Start typing your content here...</p>',
    questions: [],
    settings: {
        showAnswers: true,
        coverPage: true,
        fontSize: 'medium',
        includeAnswerKey: true,
    },
};

export default function QuizMaker() {
    const [mounted, setMounted] = useState(false);
    const [state, setState] = useState<QuizState>(INITIAL_STATE);
    const [activeTab, setActiveTab] = useState<'editor' | 'questions' | 'preview'>('editor');
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const txtInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('quiz_maker_state');
        if (saved) {
            try {
                setState(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load state', e);
            }
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            setIsSaving(true);
            const timer = setTimeout(() => {
                localStorage.setItem('quiz_maker_state', JSON.stringify(state));
                setIsSaving(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [state, mounted]);

    const updateState = (updates: Partial<QuizState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    const handleClear = () => {
        if (confirm('Are you sure you want to clear everything? This cannot be undone.')) {
            setState(INITIAL_STATE);
        }
    };

    const handleExportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", (state.title || "quiz") + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImportTXT = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (text) {
                try {
                    const parsed = parseTxtToQuiz(text);
                    setState(prev => ({
                        ...prev,
                        // Use title from filename if empty?
                        title: prev.title || file.name.replace('.txt', ''),
                        content: parsed.content || prev.content,
                        questions: [...prev.questions, ...(parsed.questions || [])],
                    }));
                    alert(`Imported successfully! Added ${parsed.questions?.length} questions.`);
                } catch (err) {
                    console.error(err);
                    alert('Failed to parse TXT file.');
                }
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    const handleExportPDF = async () => {
        try {
            setIsGenerating(true);
            const blob = await pdf(<PDFDocument state={state} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${state.title || 'quiz'}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('PDF generation failed', err);
            alert('Failed to generate PDF. check console.');
        } finally {
            setIsGenerating(false);
        }
    };

    // UI Components helpers
    const MobileTabNav = () => (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 md:hidden z-50">
            <Button
                variant={activeTab === 'editor' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('editor')}
                size="sm"
                className="flex flex-col gap-1 h-auto py-1"
            >
                <FileText className="h-4 w-4" />
                <span className="text-[10px]">Editor</span>
            </Button>
            <Button
                variant={activeTab === 'questions' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('questions')}
                size="sm"
                className="flex flex-col gap-1 h-auto py-1"
            >
                <FilePlus className="h-4 w-4" />
                <span className="text-[10px]">Questions</span>
            </Button>
            <Button
                variant={activeTab === 'preview' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('preview')}
                size="sm"
                className="flex flex-col gap-1 h-auto py-1"
            >
                <Smartphone className="h-4 w-4" />
                <span className="text-[10px]">Preview</span>
            </Button>
        </div>
    );

    if (!mounted) return null;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
            {/* Top Bar */}
            <header className="h-16 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 px-4 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-4 flex-1">
                    <Input
                        value={state.title}
                        onChange={(e) => updateState({ title: e.target.value })}
                        placeholder="Document Title"
                        className="text-lg font-bold border-transparent hover:border-gray-300 focus:border-blue-500 max-w-md h-10 dark:bg-zinc-800 dark:text-white dark:hover:border-zinc-700"
                    />
                    <span className="text-xs text-gray-400 hidden sm:inline-block">
                        {isSaving ? 'Saving...' : 'Saved'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Hidden Inputs */}
                    <input
                        type="file"
                        ref={txtInputRef}
                        accept=".txt"
                        className="hidden"
                        onChange={handleImportTXT}
                    />

                    <Button variant="ghost" size="icon" onClick={handleClear} title="New Document" className="dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800">
                        <FilePlus className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => txtInputRef.current?.click()} title="Import TXT" className="gap-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-white">
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">Import TXT</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleExportJSON} title="Export JSON" className="dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800">
                        <Download className="h-5 w-5" />
                    </Button>
                    <Button onClick={handleExportPDF} disabled={isGenerating} className="gap-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
                        {isGenerating ? <span className="animate-spin">⌛</span> : <Printer className="h-4 w-4" />}
                        <span className="hidden sm:inline">Export PDF</span>
                    </Button>
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden relative">
                {/* Desktop Left Column */}
                <div className={cn(
                    "flex-1 flex flex-col md:w-1/2 lg:w-5/12 border-r dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all overflow-y-auto",
                    "md:flex", // Always show on desktop
                    activeTab === 'preview' ? 'hidden' : 'flex' // Hide on mobile if preview active
                )}>
                    {/* Editor Section */}
                    <div className={cn(
                        "p-4 border-b dark:border-zinc-800 transition-all",
                        "md:flex-1", // Take half height on desktop
                        activeTab === 'questions' ? 'hidden md:block' : 'block'
                    )}>
                        <TextEditor
                            content={state.content}
                            onChange={(c) => updateState({ content: c })}
                        />
                    </div>

                    {/* Questions Section */}
                    <div className={cn(
                        "p-4 bg-gray-50/50 dark:bg-zinc-950/50 md:flex-1",
                        activeTab === 'editor' ? 'hidden md:block' : 'block'
                    )}>
                        <QuestionBuilder
                            questions={state.questions}
                            onChange={(q) => updateState({ questions: q })}
                            onClear={() => {
                                if (confirm('Are you sure you want to delete ALL questions?')) {
                                    updateState({ questions: [] });
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Desktop Right Column / Mobile Preview Tab */}
                <div className={cn(
                    "flex-1 bg-gray-100 dark:bg-zinc-950 overflow-hidden md:flex flex-col",
                    activeTab === 'preview' ? 'flex' : 'hidden'
                )}>
                    <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center">
                        <LivePreview state={state} />
                    </div>
                </div>
            </main>

            {/* Mobile Nav */}
            <MobileTabNav />
        </div>
    );
}
