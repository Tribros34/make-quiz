import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Question } from '@/lib/types';
import { SortableQuestionCard } from './SortableQuestionCard';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface QuestionBuilderProps {
    questions: Question[];
    onChange: (questions: Question[]) => void;
    onClear: () => void;
}

export function QuestionBuilder({ questions, onChange, onClear }: QuestionBuilderProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = questions.findIndex((q) => q.id === active.id);
            const newIndex = questions.findIndex((q) => q.id === over.id);

            const reordered = arrayMove(questions, oldIndex, newIndex);
            // Re-number questions based on new order? 
            // User said "Question number: auto-increment starting from 1 (editable)".
            // If we reorder, number should probably update to reflect position 1, 2, 3...
            // Or should it keep its original number? "displayed responsively... numbered 1, 2, 3...".
            // Usually reordering implies re-numbering.
            // I will update numbers.
            const renumbered = reordered.map((q, idx) => ({ ...q, number: idx + 1 }));
            onChange(renumbered);
        }
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            id: uuidv4(),
            number: questions.length + 1,
            text: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            explanation: '',
        };
        onChange([...questions, newQuestion]);
    };

    const updateQuestion = (updated: Question) => {
        const newQuestions = questions.map((q) => (q.id === updated.id ? updated : q));
        onChange(newQuestions);
    };

    const deleteQuestion = (id: string) => {
        const filtered = questions.filter((q) => q.id !== id);
        // Renumber
        const renumbered = filtered.map((q, idx) => ({ ...q, number: idx + 1 }));
        onChange(renumbered);
    };

    const duplicateQuestion = (question: Question) => {
        const newQuestion = {
            ...question,
            id: uuidv4(),
            number: questions.length + 1, // Will be fixed by renumbering logic if inserted else where, but appending to end is safest simple default
        };
        // Insert after the current one?
        const index = questions.findIndex(q => q.id === question.id);
        const newQuestions = [...questions];
        newQuestions.splice(index + 1, 0, newQuestion);

        // Renumber all
        const renumbered = newQuestions.map((q, idx) => ({ ...q, number: idx + 1 }));
        onChange(renumbered);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">Questions</h2>
                <div className="flex gap-2">
                    {questions.length > 0 && (
                        <Button
                            onClick={onClear}
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-zinc-700"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Clear All
                        </Button>
                    )}
                    <Button onClick={addQuestion} size="sm" className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Add Question
                    </Button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={questions.map(q => q.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4">
                        {questions.map((question) => (
                            <SortableQuestionCard
                                key={question.id}
                                question={question}
                                onUpdate={updateQuestion}
                                onDelete={() => deleteQuestion(question.id)}
                                onDuplicate={() => duplicateQuestion(question)}
                            />
                        ))}
                        {questions.length === 0 && (
                            <div className="text-center p-8 border-2 border-dashed rounded-lg text-gray-500 bg-gray-50">
                                No questions yet. Click "Add Question" to start.
                            </div>
                        )}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
