
import React from 'react';
import { QuizTemplate, TEMPLATES } from '@/templates/quizTemplates';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LayoutTemplate, FilePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility exists

interface TemplatePickerProps {
    isOpen: boolean;
    onSelectTemplate: (template: QuizTemplate) => void;
    onCancel: () => void;
}

export const TemplatePicker = ({ isOpen, onSelectTemplate, onCancel }: TemplatePickerProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border dark:border-zinc-800 overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-900/50">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
                            <LayoutTemplate className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            Start with a Template
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Choose a starting point or begin from scratch.
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Templates Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-zinc-950">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Blank Canvas Option */}
                        <Card
                            className="group cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg relative overflow-hidden flex flex-col"
                            onClick={onCancel} // Cancel effectively means "start from scratch" if coming from init
                        >
                            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                    <FilePlus className="h-6 w-6 text-gray-400 group-hover:text-blue-600 dark:text-zinc-500 dark:group-hover:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg dark:text-white">Blank Canvas</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        Start fresh with an empty quiz and build it your way.
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-zinc-900 border-t dark:border-zinc-800">
                                <Button variant="outline" className="w-full">Start Blank</Button>
                            </div>
                        </Card>

                        {/* Templates */}
                        {TEMPLATES.map((template) => (
                            <Card
                                key={template.id}
                                className="group cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg relative overflow-hidden flex flex-col"
                                onClick={() => onSelectTemplate(template)}
                            >
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                                                {template.name.charAt(0)}
                                            </span>
                                        </div>
                                        <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-xs text-gray-600 dark:text-gray-300 font-medium">
                                            {template.questionCount} Qs
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {template.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                                        {template.description}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-zinc-900 border-t dark:border-zinc-800">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        Use Template
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
