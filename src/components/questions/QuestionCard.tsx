import { Question, QuestionType } from '@/lib/types';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Copy, Trash2, GripVertical, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
    question: Question;
    onUpdate: (q: Question) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    dragHandleProps?: any; // For dnd-kit
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

export const QuestionCard = ({
    question,
    onUpdate,
    onDelete,
    onDuplicate,
    dragHandleProps,
}: QuestionCardProps) => {
    const updateOption = (index: number, value: string) => {
        const newOptions = [...question.options];
        newOptions[index] = value;
        onUpdate({ ...question, options: newOptions });
    };

    const addOption = () => {
        if (question.options.length < 5) {
            onUpdate({ ...question, options: [...question.options, ''] });
        }
    };

    const removeOption = (index: number) => {
        if (question.options.length > 2) {
            const newOptions = question.options.filter((_, i) => i !== index);
            // Adjust correct answer index if needed
            let newCorrect = question.correctAnswer;
            if (index === question.correctAnswer) newCorrect = 0; // Reset to A if removed
            else if (index < question.correctAnswer) newCorrect--;

            onUpdate({ ...question, options: newOptions, correctAnswer: newCorrect });
        }
    };

    const setCorrectAnswer = (index: number) => {
        onUpdate({ ...question, correctAnswer: index });
    };

    return (
        <Card className="mb-4 relative group hover:border-blue-400 dark:border-zinc-700 dark:bg-zinc-900 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between pb-2 bg-gray-50/50 dark:bg-zinc-800/50 rounded-t-lg border-b dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <div {...dragHandleProps} className="cursor-grab p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300">
                        <GripVertical className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg dark:text-zinc-200">Question {question.number}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        className="text-xs bg-transparent border border-gray-200 dark:border-zinc-700 rounded px-2 py-1 outline-none focus:border-blue-500 font-medium"
                        value={question.type || 'multiple-choice'}
                        onChange={(e) => onUpdate({ ...question, type: e.target.value as QuestionType })}
                    >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="true-false">True / False</option>
                        <option value="short-answer">Short Answer</option>
                    </select>
                    <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700 mx-1" />
                    <Button variant="ghost" size="icon" onClick={onDuplicate} title="Duplicate" className="dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800">
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div>
                    <label className="text-sm font-medium mb-1 block dark:text-zinc-400">Question Text</label>
                    <Textarea
                        value={question.text}
                        onChange={(e) => onUpdate({ ...question, text: e.target.value })}
                        placeholder="Type your question here..."
                        className="dark:bg-zinc-950 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-600"
                    />
                </div>

                <div className="space-y-4">
                    {/* Render inputs based on type */}
                    {(!question.type || question.type === 'multiple-choice') && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium block dark:text-zinc-400">Answer Options</label>
                            {question.options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-full border cursor-pointer transition-colors shrink-0",
                                            question.correctAnswer === index
                                                ? "bg-green-500 text-white border-green-500 font-bold"
                                                : "bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-300 dark:border-zinc-600 hover:border-green-300 dark:hover:border-green-700"
                                        )}
                                        onClick={() => setCorrectAnswer(index)}
                                        title="Mark as correct"
                                    >
                                        {OPTION_LABELS[index]}
                                    </div>
                                    <Input
                                        value={option}
                                        onChange={(e) => updateOption(index, e.target.value)}
                                        placeholder={`Option ${OPTION_LABELS[index]}`}
                                        className={cn(
                                            "dark:bg-zinc-950 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-600",
                                            question.correctAnswer === index ? "border-green-500 ring-green-100 dark:ring-green-900/20 dark:border-green-600" : ""
                                        )}
                                    />
                                    {question.options.length > 2 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                            onClick={() => removeOption(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {question.options.length < 5 && (
                                <Button variant="outline" size="sm" onClick={addOption} className="mt-2 text-xs dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                                    <Plus className="h-3 w-3 mr-1" /> Add Option
                                </Button>
                            )}
                        </div>
                    )}

                    {question.type === 'true-false' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium block dark:text-zinc-400">Correct Answer</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => onUpdate({ ...question, correctValue: true })}
                                    className={cn(
                                        "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                                        question.correctValue === true
                                            ? "bg-green-500 text-white border-green-500"
                                            : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 hover:border-green-500"
                                    )}
                                >
                                    True
                                </button>
                                <button
                                    onClick={() => onUpdate({ ...question, correctValue: false })}
                                    className={cn(
                                        "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                                        question.correctValue === false
                                            ? "bg-red-500 text-white border-red-500"
                                            : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 hover:border-red-500"
                                    )}
                                >
                                    False
                                </button>
                            </div>
                        </div>
                    )}

                    {question.type === 'short-answer' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium block dark:text-zinc-400">Expected Answer (for Key)</label>
                            <Input
                                value={question.expectedAnswer || ''}
                                onChange={(e) => onUpdate({ ...question, expectedAnswer: e.target.value })}
                                placeholder="e.g. 42, Paris, Photosynthesis"
                                className="dark:bg-zinc-950 dark:border-zinc-700"
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium mb-1 block text-gray-600 dark:text-zinc-500">Explanation (Optional)</label>
                    <Textarea
                        value={question.explanation || ''}
                        onChange={(e) => onUpdate({ ...question, explanation: e.target.value })}
                        placeholder="Explain the correct answer..."
                        className="h-20 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-600"
                    />
                </div>
            </CardContent>
        </Card>
    );
};
