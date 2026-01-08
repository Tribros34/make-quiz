import { QuizState, QuestionType } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export interface QuizTemplate {
    id: string;
    name: string;
    description: string;
    questionCount: number;
    defaultQuizData: QuizState;
}

// Helper to generate IDs for template questions so they don't collide
const generateId = () => uuidv4();

export const TEMPLATES: QuizTemplate[] = [
    {
        id: 'weekly-practice',
        name: 'Weekly Practice Quiz',
        description: 'A standard 5-question multiple choice quiz perfect for weekly reviews.',
        questionCount: 5,
        defaultQuizData: {
            title: 'Weekly Practice Quiz',
            content: '<p>Welcome to this week\'s practice quiz. complete all questions and check your answers at the end.</p>',
            sections: [
                {
                    id: generateId(),
                    title: 'General Knowledge',
                    questions: [
                        { id: generateId(), type: 'multiple-choice', number: 1, text: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], correctAnswer: 2 },
                        { id: generateId(), type: 'multiple-choice', number: 2, text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 1 },
                        { id: generateId(), type: 'multiple-choice', number: 3, text: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: 1 },
                        { id: generateId(), type: 'multiple-choice', number: 4, text: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'Jane Austen', 'William Shakespeare', 'Mark Twain'], correctAnswer: 2 },
                        { id: generateId(), type: 'multiple-choice', number: 5, text: 'What is the chemical symbol for Gold?', options: ['Ag', 'Fe', 'Au', 'Cu'], correctAnswer: 2 },
                    ]
                }
            ],
            settings: {
                selectedPresetId: 'standard',
                showAnswers: true,
                coverPage: true,
                includeAnswerKey: true,
                numberingStyle: 'continuous',
                showQuestionNumbers: true,
                showSectionTitles: true,
                description: 'Weekly Practice Quiz',
                answerDisplayMode: 'end_of_pdf',
            },
        },
    },
    {
        id: 'exam-style',
        name: 'Exam Style Quiz',
        description: 'A comprehensive 10-question set with a formal cover page and answer key.',
        questionCount: 10,
        defaultQuizData: {
            title: 'Mid-Term Examination',
            content: '<p><strong>Instructions:</strong> Please read each question carefully. You have 30 minutes to complete this exam.</p>',
            sections: [
                {
                    id: generateId(),
                    title: 'Part A: Multiple Choice',
                    questions: Array.from({ length: 10 }).map((_, i) => ({
                        id: generateId(),
                        type: 'multiple-choice',
                        number: i + 1,
                        text: `Question ${i + 1}: [Replace this with your question text]`,
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                        correctAnswer: 0,
                    }))
                }
            ],
            settings: {
                selectedPresetId: 'standard',
                showAnswers: false,
                coverPage: true,
                includeAnswerKey: true,
                numberingStyle: 'continuous',
                showQuestionNumbers: true,
                showSectionTitles: true,
                description: 'Exam Style Quiz',
                answerDisplayMode: 'end_of_pdf',
            },
        },
    },
    {
        id: 'short-review',
        name: 'Short Review',
        description: 'A quick 3-question checkup with minimal formatting.',
        questionCount: 3,
        defaultQuizData: {
            title: 'Quick Review',
            content: '',
            sections: [
                {
                    id: generateId(),
                    title: 'Questions',
                    questions: [
                        { id: generateId(), type: 'multiple-choice', number: 1, text: 'Review Question 1', options: ['True', 'False'], correctAnswer: 0 },
                        { id: generateId(), type: 'multiple-choice', number: 2, text: 'Review Question 2', options: ['Yes', 'No'], correctAnswer: 0 },
                        { id: generateId(), type: 'multiple-choice', number: 3, text: 'Review Question 3', options: ['A', 'B', 'C'], correctAnswer: 0 },
                    ]
                }
            ],
            settings: {
                selectedPresetId: 'compact',
                showAnswers: true,
                coverPage: false,
                includeAnswerKey: false,
                numberingStyle: 'continuous',
                showQuestionNumbers: true,
                showSectionTitles: false,
                description: '',
                answerDisplayMode: 'end_of_pdf',
            },
        },
    },
];
