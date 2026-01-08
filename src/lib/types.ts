export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

export interface Question {
    id: string;
    type: QuestionType;
    number: number;
    text: string;
    options: string[]; // For MC
    correctAnswer: number; // Index of the correct option (MC)
    correctValue?: boolean; // For True/False
    expectedAnswer?: string; // For Short Answer
    explanation?: string;
}

export type NumberingStyle = 'continuous' | 'per_section';

export interface PDFPreset {
    id: string;
    name: string;
    description: string;
    styles: {
        pageSize: 'A4' | 'LETTER';
        fontSize: number; // pt
        lineHeight: number; // unitless multiplier
        contentPadding: number; // pt
        questionSpacing: number; // pt
    };
}

export type AnswerDisplayMode = 'hidden' | 'end_of_pdf' | 'separate_pdf';

export interface QuizSettings {
    // Appearance & Layout
    selectedPresetId: string;

    // Toggles
    showAnswers: boolean; // General visibility toggle (maybe redundant with mode, but keep for backward compat)
    answerDisplayMode: AnswerDisplayMode; // NEW
    includeAnswerKey: boolean; // keep for backward compat, map to mode
    coverPage: boolean;

    // Numbering & Headers
    numberingStyle: NumberingStyle;
    showQuestionNumbers: boolean;
    showSectionTitles: boolean;

    description?: string; // Optional subtitle/description for the quiz
}

export interface Section {
    id: string;
    title: string;
    description?: string;
    questions: Question[];
}

export interface QuizState {
    title: string;
    content: string;
    sections: Section[];
    settings: QuizSettings;
}
