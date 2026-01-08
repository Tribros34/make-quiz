import React from 'react';
import { QuizSettings, NumberingStyle, AnswerDisplayMode } from '@/lib/types';
import { PDF_PRESETS } from '@/lib/pdfPresets';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    settings: QuizSettings;
    onUpdate: (settings: QuizSettings) => void;
}

export function SettingsPanel({ isOpen, onClose, settings, onUpdate }: SettingsPanelProps) {
    if (!isOpen) return null;

    const handlePresetChange = (presetId: string) => {
        onUpdate({ ...settings, selectedPresetId: presetId });
    };

    const toggleSetting = (key: keyof QuizSettings) => {
        onUpdate({
            ...settings,
            [key]: !settings[key as keyof QuizSettings],
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-y-auto pointer-events-auto flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold tracking-tight">Quiz Settings</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6 space-y-8 flex-1">
                    {/* General Section */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">General</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={settings.description || ''}
                                onChange={(e) => onUpdate({ ...settings, description: e.target.value })}
                                placeholder="Add a subtitle or instructions (appears on cover)"
                                className="h-24 resize-none"
                            />
                        </div>
                    </section>

                    {/* PDF Style Section */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">PDF Style</h3>
                        <div className="grid gap-3">
                            {Object.values(PDF_PRESETS).map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => handlePresetChange(preset.id)}
                                    className={cn(
                                        "relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                                        settings.selectedPresetId === preset.id
                                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-500"
                                            : "border-zinc-200 dark:border-zinc-800"
                                    )}
                                >
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm">{preset.name}</div>
                                        <div className="text-xs text-zinc-500 mt-1">{preset.description}</div>
                                    </div>
                                    {settings.selectedPresetId === preset.id && (
                                        <div className="h-4 w-4 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="h-2.5 w-2.5" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Layout & Numbering */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Layout & Numbering</h3>

                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <span className="text-sm font-medium">Numbering Style</span>
                                <select
                                    className="bg-transparent text-sm font-medium focus:outline-none text-right"
                                    value={settings.numberingStyle}
                                    onChange={(e) => onUpdate({ ...settings, numberingStyle: e.target.value as NumberingStyle })}
                                >
                                    <option value="continuous">Continuous (1, 2, 3...)</option>
                                    <option value="per_section">Per Section (1.1, 1.2...)</option>
                                </select>
                            </label>

                            <SettingToggle
                                label="Show Question Numbers"
                                checked={settings.showQuestionNumbers}
                                onChange={() => toggleSetting('showQuestionNumbers')}
                            />

                            <SettingToggle
                                label="Show Section Titles"
                                checked={settings.showSectionTitles}
                                onChange={() => toggleSetting('showSectionTitles')}
                            />
                        </div>
                    </section>

                    {/* Export Content */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Export Content</h3>
                        <div className="space-y-3">
                            <SettingToggle
                                label="Include Cover Page"
                                checked={settings.coverPage}
                                onChange={() => toggleSetting('coverPage')}
                            />

                            <label className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <span className="text-sm font-medium">Answer Key</span>
                                <select
                                    className="bg-transparent text-sm font-medium focus:outline-none text-right"
                                    value={settings.answerDisplayMode || 'end_of_pdf'}
                                    onChange={(e) => onUpdate({ ...settings, answerDisplayMode: e.target.value as AnswerDisplayMode, includeAnswerKey: e.target.value !== 'hidden' })}
                                >
                                    <option value="hidden">Hidden</option>
                                    <option value="end_of_pdf">End of PDF</option>
                                    <option value="separate_pdf">Separate PDF</option>
                                </select>
                            </label>
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <Button className="w-full" onClick={onClose}>Done</Button>
                </div>
            </div>
        </div>
    );
}

function SettingToggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) {
    return (
        <label className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer hover:border-zinc-300 transition-colors">
            <span className="text-sm font-medium select-none">{label}</span>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
        </label>
    );
}
