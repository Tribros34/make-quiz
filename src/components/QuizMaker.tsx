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
import { ExportProgress, ExportStep } from '@/components/pdf/ExportProgress';
import { normalizeQuizContent, paginateQuestions } from '@/components/pdf/utils/pdfHelpers';
import { TemplatePicker } from '@/components/templates/TemplatePicker';
import { QuizTemplate } from '@/templates/quizTemplates';
import { Save, Download, FilePlus, Settings, Printer, FileText, Smartphone, Upload, Plus, LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { v4 as uuidv4 } from 'uuid';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { DEFAULT_PRESET_ID, getPreset } from '@/lib/pdfPresets'; // Added getPreset
import { QuizPreview } from '@/components/preview/QuizPreview';
// import { generatePDF } from '@/lib/pdfGenerator'; // To be implemented

const INITIAL_STATE: QuizState = {
    title: '',
    content: '<p>Start typing your content here...</p>',
    sections: [],
    settings: {
        selectedPresetId: DEFAULT_PRESET_ID,
        showAnswers: true,
        coverPage: true,
        includeAnswerKey: true,
        numberingStyle: 'continuous',
        showQuestionNumbers: true,
        showSectionTitles: true,
        answerDisplayMode: 'end_of_pdf',
        description: '',
    },
};

export default function QuizMaker() {
    const [mounted, setMounted] = useState(false);
    const [state, setState] = useState<QuizState>(INITIAL_STATE);
    const [activeTab, setActiveTab] = useState<'editor' | 'questions' | 'preview'>('editor');
    const [isSaving, setIsSaving] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    // Export State
    const [exportState, setExportState] = useState<{
        step: ExportStep;
        error: string | null;
        isOpen: boolean;
    }>({ step: 'idle', error: null, isOpen: false });

    // Template State
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);

    const txtInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('quiz_maker_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);

                // MIGRATION: Ensure settings object has all new fields
                // This handles migration from old PDFSettings to new QuizSettings
                if (!parsed.settings || !parsed.settings.selectedPresetId) {
                    const oldSettings = parsed.settings || {};
                    parsed.settings = {
                        ...INITIAL_STATE.settings,
                        // Map old fields if they exist
                        showAnswers: oldSettings.showAnswers ?? true,
                        // Map old fontSize to preset if possible
                        selectedPresetId: oldSettings.fontSize === 'small' ? 'compact' :
                            oldSettings.fontSize === 'large' ? 'readable' : DEFAULT_PRESET_ID,
                    };
                }

                // Ensure sections exists
                if (!parsed.sections) {
                    parsed.sections = [];
                }

                setState({ ...INITIAL_STATE, ...parsed });
            } catch (e) {
                console.error('Failed to load state', e);
            }
        } else {
            // No saved state, show template picker
            setShowTemplatePicker(true);
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

    // Trigger export when step is preparing
    useEffect(() => {
        if (exportState.step === 'preparing') {
            handleExportPDF();
        }
    }, [exportState.step]);

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
                    const importedSections = parsed.sections || [];
                    // Ensure the imported sections have an ID if potentially missing, though parser adds them.
                    // Also useful to ensure uniqueness if importing multiple times.
                    const newSections = importedSections.map(s => ({
                        ...s,
                        id: uuidv4(), // Regenerate ID to avoid collisions
                        title: importedSections.length === 1 ? file.name.replace('.txt', '') : s.title
                    }));

                    setState(prev => ({
                        ...prev,
                        title: prev.title || parsed.title || file.name.replace('.txt', ''),
                        content: parsed.content || prev.content,
                        sections: [...prev.sections, ...newSections],
                    }));
                    const totalQuestions = newSections.reduce((acc, s) => acc + s.questions.length, 0);
                    alert(`Imported successfully! Added ${totalQuestions} questions in ${newSections.length} new section(s).`);
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
        setExportState({ step: 'preparing', error: null, isOpen: true });

        try {
            // Step 1: Normalize content (Preparing)
            await new Promise(r => setTimeout(r, 500)); // Min wait for UI feel
            const normalizedState = normalizeQuizContent(state);

            // Step 2: Layout (Paginate)
            setExportState(prev => ({ ...prev, step: 'layout' }));
            await new Promise(r => setTimeout(r, 100)); // Yield to UI

            const normalizationPreset = getPreset(normalizedState.settings.selectedPresetId);
            const paginatedPages = paginateQuestions(normalizedState.sections, normalizationPreset);

            // Check if pagination worked
            // Check if any pages generated (if we have sections/questions)
            const hasQuestions = normalizedState.sections.some(s => s.questions.length > 0);
            if (paginatedPages.length === 0 && hasQuestions) {
                throw new Error('Pagination failed to generate any pages.');
            }

            // Step 3: Render (Generating PDF)
            setExportState(prev => ({ ...prev, step: 'rendering' }));
            await new Promise(r => setTimeout(r, 100)); // Yield to UI

            const blob = await pdf(
                <PDFDocument
                    state={normalizedState}
                    pages={paginatedPages}
                />
            ).toBlob();

            // Step 4: Finalizing
            setExportState(prev => ({ ...prev, step: 'finalizing' }));
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${state.title || 'quiz'}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Done
            setExportState(prev => ({ ...prev, step: 'done' }));

            // Auto close after success
            setTimeout(() => {
                setExportState(prev => ({ ...prev, isOpen: false, step: 'idle' }));
            }, 1500);

        } catch (err) {
            console.error('PDF generation failed', err);
            setExportState(prev => ({
                ...prev,
                step: 'error',
                error: err instanceof Error ? err.message : 'Unknown error during PDF generation'
            }));
        }
    };

    const handleCancelExport = () => {
        setExportState({ step: 'idle', error: null, isOpen: false });
    };

    const handleSelectTemplate = (template: QuizTemplate) => {
        if (state.sections.length > 0) {
            // Check if any section has questions
            const hasQ = state.sections.some(s => s.questions.length > 0);
            if (hasQ && !confirm('Using a template will replace your current quiz. Are you sure?')) {
                return;
            }
        }
        setState(template.defaultQuizData);
        setShowTemplatePicker(false);
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
                    {/* Main Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden md:flex gap-2"
                            onClick={() => setIsPreviewMode(true)}
                        >
                            <FileText className="h-4 w-4" />
                            Preview
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden md:flex gap-2"
                            onClick={() => setSettingsOpen(true)}
                        >
                            <Settings className="h-4 w-4" />
                            Settings
                        </Button>
                    </div>
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
                    <Button variant="ghost" size="icon" onClick={() => setShowTemplatePicker(true)} title="Templates" className="dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800">
                        <LayoutTemplate className="h-5 w-5" />
                    </Button>
                    <Button onClick={handleExportPDF} disabled={isSaving} className="gap-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
                        <Printer className="h-4 w-4" />
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
                            sections={state.sections}
                            onChange={(s) => updateState({ sections: s })}
                            onClear={() => {
                                if (confirm('Are you sure you want to delete ALL sections and questions?')) {
                                    updateState({ sections: [] });
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

            <MobileTabNav />

            {/* Full Screen Preview Overlay */}
            {
                isPreviewMode && (
                    <QuizPreview
                        state={state}
                        onExit={() => setIsPreviewMode(false)}
                    />
                )
            }

            <SettingsPanel
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                settings={state.settings}
                onUpdate={(settings) => updateState({ settings })}
            />

            <ExportProgress
                isOpen={exportState.isOpen}
                currentStep={exportState.step}
                error={exportState.error}
                onCancel={() => setExportState(prev => ({ ...prev, isOpen: false, error: null }))}
                onRetry={() => setExportState(prev => ({ ...prev, step: 'preparing', error: null }))}
            />

            <TemplatePicker
                isOpen={showTemplatePicker}
                onCancel={() => setShowTemplatePicker(false)}
                onSelectTemplate={handleSelectTemplate}
            />
        </div >
    );
}
