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
import { Question, Section } from '@/lib/types';
import { SectionCard } from './SectionCard';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface QuestionBuilderProps {
    sections: Section[];
    onChange: (sections: Section[]) => void;
    onClear: () => void;
}

export function QuestionBuilder({ sections = [], onChange, onClear }: QuestionBuilderProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Check if we are dragging a section or a question
            const activeType = active.data.current?.type;
            const overType = over.data.current?.type;

            if (activeType === 'section' && overType === 'section') {
                const oldIndex = sections.findIndex((s) => s.id === active.id);
                const newIndex = sections.findIndex((s) => s.id === over.id);
                onChange(arrayMove(sections, oldIndex, newIndex));
            } else if (activeType === 'question') {
                // Find source section and question
                // For simplicity, we only strictly support reordering within the SAME section for now as per requirements-ish
                // But DndKit might allow dragging across if we are not careful.
                // To keep scope safe, let's assume we are reordering within the same section context.
                // Actually, since we have multiple SortableContexts, we need to find which section handles this.
                // If we restrict reordering to be handled by the SectionCard internal SortableContext,
                // the event usually bubbles up here if we wrap everything in one DndContext.

                // However, a simpler approach for nested lists in DndKit often involves ensuring unique IDs.
                // Let's implement question reordering logic here if possible, OR delegate it?
                // Actually, if we use one main DndContext, we need to handle all drops here.

                // Let's try to find which section contains these questions.
                const findSection = (id: string) => sections.find(s => s.questions.some(q => q.id === id));

                const activeSection = findSection(active.id as string);
                const overSection = findSection(over.id as string);

                if (activeSection && overSection && activeSection.id === overSection.id) {
                    const sectionIndex = sections.indexOf(activeSection);
                    const oldQIndex = activeSection.questions.findIndex(q => q.id === active.id);
                    const newQIndex = activeSection.questions.findIndex(q => q.id === over.id);

                    const newQuestions = arrayMove(activeSection.questions, oldQIndex, newQIndex);
                    // Renumber questions within section 
                    // (Or globally? Requirement said "Question number: auto-increment". Usually per quiz, not per section)
                    // Let's renumber globally later, or locally here. 
                    // To keep it simple, let's just update the array for now and run a global renumbering pass.

                    const updatedSection = { ...activeSection, questions: newQuestions };
                    const newSections = [...sections];
                    newSections[sectionIndex] = updatedSection;

                    // Renumber all questions across all sections to be safe and consistent
                    const finalSections = renumberAllQuestions(newSections);
                    onChange(finalSections);
                }
            }
        }
    };

    const renumberAllQuestions = (secs: Section[]) => {
        let count = 1;
        return secs.map(sec => ({
            ...sec,
            questions: sec.questions.map(q => ({ ...q, number: count++ }))
        }));
    };

    const addSection = () => {
        const newSection: Section = {
            id: uuidv4(),
            title: `Section ${sections.length + 1}`,
            questions: [],
        };
        onChange([...sections, newSection]);
    };

    const updateSection = (updated: Section) => {
        const newSections = sections.map((s) => (s.id === updated.id ? updated : s));
        onChange(newSections);
    };

    const deleteSection = (id: string) => {
        if (sections.length <= 1 && sections[0].questions.length > 0) {
            if (!confirm('This will delete the section and all its questions. Continue?')) return;
        }
        const filtered = sections.filter((s) => s.id !== id);
        if (filtered.length === 0) {
            // Always keep at least one section? Or allow empty.
            // If empty, user sees "Add Section".
        }
        onChange(renumberAllQuestions(filtered));
    };

    // Question Handlers
    const handleAddQuestion = (sectionId: string) => {
        const newQuestion: Question = {
            id: uuidv4(),
            type: 'multiple-choice',
            number: 0, // Will be fixed by renumber
            text: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            explanation: '',
        };

        const newSections = sections.map(s => {
            if (s.id === sectionId) {
                return { ...s, questions: [...s.questions, newQuestion] };
            }
            return s;
        });
        onChange(renumberAllQuestions(newSections));
    };

    const handleUpdateQuestion = (sectionId: string, updatedQ: Question) => {
        const newSections = sections.map(s => {
            if (s.id === sectionId) {
                return {
                    ...s,
                    questions: s.questions.map(q => q.id === updatedQ.id ? updatedQ : q)
                };
            }
            return s;
        });
        onChange(newSections);
    };

    const handleDeleteQuestion = (sectionId: string, questionId: string) => {
        const newSections = sections.map(s => {
            if (s.id === sectionId) {
                return { ...s, questions: s.questions.filter(q => q.id !== questionId) };
            }
            return s;
        });
        onChange(renumberAllQuestions(newSections));
    };

    const handleDuplicateQuestion = (sectionId: string, question: Question) => {
        const newQuestion = {
            ...question,
            id: uuidv4(),
        };

        const newSections = sections.map(s => {
            if (s.id === sectionId) {
                const index = s.questions.findIndex(q => q.id === question.id);
                const newQs = [...s.questions];
                newQs.splice(index + 1, 0, newQuestion);
                return { ...s, questions: newQs };
            }
            return s;
        });
        onChange(renumberAllQuestions(newSections));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">Questions</h2>
                <div className="flex gap-2">
                    {sections.length > 0 && (
                        <Button
                            onClick={onClear}
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-zinc-700"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Clear All
                        </Button>
                    )}
                    <Button onClick={addSection} size="sm" className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Add Section
                    </Button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-6">
                        {sections.map((section) => (
                            <SectionCard
                                key={section.id}
                                section={section}
                                onUpdate={updateSection}
                                onDelete={() => deleteSection(section.id)}
                                onAddQuestion={handleAddQuestion}
                                onUpdateQuestion={handleUpdateQuestion}
                                onDeleteQuestion={handleDeleteQuestion}
                                onDuplicateQuestion={handleDuplicateQuestion}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {sections.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed rounded-lg text-gray-500 bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800">
                    No sections yet. Click "Add Section" to start adding questions.
                </div>
            )}
        </div>
    );
}
