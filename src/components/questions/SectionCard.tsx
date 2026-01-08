
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section, Question } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Trash2, GripVertical, Plus } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableQuestionCard } from './SortableQuestionCard';

interface SectionCardProps {
    section: Section;
    onUpdate: (section: Section) => void;
    onDelete: () => void;
    onAddQuestion: (sectionId: string) => void;
    onUpdateQuestion: (sectionId: string, question: Question) => void;
    onDeleteQuestion: (sectionId: string, questionId: string) => void;
    onDuplicateQuestion: (sectionId: string, question: Question) => void;
}

export function SectionCard({
    section,
    onUpdate,
    onDelete,
    onAddQuestion,
    onUpdateQuestion,
    onDeleteQuestion,
    onDuplicateQuestion,
}: SectionCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id, data: { type: 'section', section } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card ref={setNodeRef} style={style} className="p-4 bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800">
            {/* Section Header */}
            <div className="flex items-start gap-4 mb-4">
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-2 cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <GripVertical className="h-5 w-5" />
                </div>

                <div className="flex-1 space-y-2">
                    <Input
                        value={section.title}
                        onChange={(e) => onUpdate({ ...section, title: e.target.value })}
                        placeholder="Section Title (e.g., Part A)"
                        className="font-bold text-lg bg-transparent border-transparent hover:border-gray-300 focus:border-blue-500 px-0"
                    />
                    <Input
                        value={section.description || ''}
                        onChange={(e) => onUpdate({ ...section, description: e.target.value })}
                        placeholder="Optional description (e.g., Multiple Choice)"
                        className="text-sm text-gray-500 bg-transparent border-transparent hover:border-gray-300 focus:border-blue-500 px-0 h-8"
                    />
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete Section"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Questions List */}
            <SortableContext
                items={section.questions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-zinc-800 ml-2">
                    {section.questions.map((question) => (
                        <SortableQuestionCard
                            key={question.id}
                            question={question}
                            onUpdate={(updatedQ) => onUpdateQuestion(section.id, updatedQ)}
                            onDelete={() => onDeleteQuestion(section.id, question.id)}
                            onDuplicate={() => onDuplicateQuestion(section.id, question)}
                        />
                    ))}

                    <Button
                        onClick={() => onAddQuestion(section.id)}
                        variant="ghost"
                        className="w-full border-2 border-dashed border-gray-200 dark:border-zinc-800 text-gray-400 hover:border-blue-500 hover:text-blue-500"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Question to {section.title}
                    </Button>
                </div>
            </SortableContext>
        </Card>
    );
}
