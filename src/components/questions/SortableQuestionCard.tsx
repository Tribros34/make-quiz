import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuestionCard } from './QuestionCard';
import { Question } from '@/lib/types';

interface SortableQuestionCardProps {
    question: Question;
    onUpdate: (q: Question) => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

export function SortableQuestionCard(props: SortableQuestionCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative">
            <QuestionCard {...props} dragHandleProps={{ ...attributes, ...listeners }} />
        </div>
    );
}
