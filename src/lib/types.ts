export interface Question {
    id: string;
    number: number;
    text: string;
    options: string[];
    correctAnswer: number; // Index of the correct option
    explanation?: string;
}

export interface PDFSettings {
    showAnswers: boolean;
    coverPage: boolean;
    fontSize: 'small' | 'medium' | 'large';
    includeAnswerKey: boolean;
}

export interface QuizState {
    title: string;
    content: string;
    questions: Question[];
    settings: PDFSettings;
}
