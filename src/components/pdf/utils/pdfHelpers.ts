
import { QuizState, Question, Section, PDFPreset } from '@/lib/types';

// Constants for A4 page calculation (approximate points)
const PAGE_HEIGHT = 841.89;
const PAGE_PADDING = 60; // 30 top + 30 bottom
const USABLE_HEIGHT = PAGE_HEIGHT - PAGE_PADDING;
const HEADER_HEIGHT = 40; // Title usually takes some space
const FOOTER_HEIGHT = 30; // Page numbers

/**
 * Deep clones and normalizes the quiz state for PDF export.
 * Trims whitespace and handles potentially unsafe content.
 */
export const normalizeQuizContent = (state: QuizState): QuizState => {
    // Deep clone to avoid mutating the editor state
    const clone = JSON.parse(JSON.stringify(state));

    const normalizeText = (text: string) => text ? text.trim() : '';

    return {
        ...clone,
        title: normalizeText(clone.title),
        content: clone.content,
        sections: clone.sections.map((section: Section) => ({
            ...section,
            title: normalizeText(section.title),
            description: normalizeText(section.description || ''),
            questions: section.questions.map((q: Question) => ({
                ...q,
                text: normalizeText(q.text),
                options: (q.options || []).map(normalizeText), // Handle optional options
                expectedAnswer: normalizeText(q.expectedAnswer || ''),
                explanation: normalizeText(q.explanation || ''),
            })),
        })),
    };
};

/**
 * Estimates the height of a question in points.
 * This is a heuristic and may need tuning.
 */
/**
 * Estimates the height of a question in points.
 */
export const estimateQuestionHeight = (question: Question, preset: PDFPreset): number => {
    const { fontSize, lineHeight, questionSpacing } = preset.styles;
    const lineHeightPt = fontSize * lineHeight;

    // Base padding/margin for the container
    let height = questionSpacing;

    // Question text: approx characters per line depends on font size and page width
    // A4 width ~595pt. Padding ~40pt * 2 = 80pt. Usable width ~515pt.
    // Avg char width is roughly 0.6 * fontSize?
    const charWidth = fontSize * 0.5; // Approximation
    const charsPerLine = Math.floor(515 / charWidth);

    // Question text lines
    const textLines = Math.ceil(question.text.length / charsPerLine) || 1;
    height += textLines * lineHeightPt;

    // Add height based on Type
    if (!question.type || question.type === 'multiple-choice') {
        // Options
        (question.options || []).forEach(opt => {
            const optLines = Math.ceil(opt.length / (charsPerLine - 5)) || 1; // Indented
            height += optLines * lineHeightPt;
            height += 4; // Margin between options
        });
    } else if (question.type === 'true-false') {
        height += lineHeightPt; // "True / False" line
    } else if (question.type === 'short-answer') {
        height += lineHeightPt * 2; // Space for writing answer
    }

    return height;
};

// Represents a renderable item in the PDF
export type PDFRenderItem =
    | { type: 'section-header'; section: Section }
    | { type: 'question'; question: Question };

export type PDFPage = PDFRenderItem[];

/**
 * Groups questions into pages based on estimated height.
 * Now section aware!
 */
/**
 * Groups questions into pages based on estimated height.
 * Now section aware!
 */
export const paginateQuestions = (sections: Section[], preset: PDFPreset): PDFPage[] => {
    const pages: PDFPage[] = [];
    const { contentPadding } = preset.styles;
    const USABLE_HEIGHT = PAGE_HEIGHT - (contentPadding * 2);

    let currentPage: PDFPage = [];
    let currentHeight = HEADER_HEIGHT; // Start with header offset for page 1 details

    sections.forEach((section, sectionIndex) => {
        // ALWAYS finish current page if new section (unless it's the very first section on Page 1)
        if (sectionIndex > 0 && currentPage.length > 0) {
            pages.push(currentPage);
            currentPage = [];
            currentHeight = HEADER_HEIGHT;
        }

        // Add Section Header item
        const sectionHeaderHeight = 40; // Title + Desc + spacing

        // If section header doesn't fit (rare if we just broke page, but valid check)
        if (currentHeight + sectionHeaderHeight > USABLE_HEIGHT - FOOTER_HEIGHT) {
            pages.push(currentPage);
            currentPage = [];
            currentHeight = HEADER_HEIGHT;
        }

        currentPage.push({ type: 'section-header', section });
        currentHeight += sectionHeaderHeight;

        // Process Questions
        section.questions.forEach((q: Question) => {
            const qHeight = estimateQuestionHeight(q, preset);

            // If adding this question exceeds the page height
            if (currentHeight + qHeight > USABLE_HEIGHT - FOOTER_HEIGHT) {
                // Push current page if it has items
                if (currentPage.length > 0) {
                    pages.push(currentPage);
                    currentPage = [];
                    currentHeight = HEADER_HEIGHT;
                }
            }

            currentPage.push({ type: 'question', question: q });
            currentHeight += qHeight;
        });
    });

    // Push the last page if not empty
    if (currentPage.length > 0) {
        pages.push(currentPage);
    }

    return pages;
};
