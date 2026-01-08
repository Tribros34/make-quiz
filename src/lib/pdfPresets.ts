import { PDFPreset } from './types';

export const PDF_PRESETS: Record<string, PDFPreset> = {
    standard: {
        id: 'standard',
        name: 'Standard Exam',
        description: 'Balanced spacing and standard font size. Best for most quizzes.',
        styles: {
            pageSize: 'A4',
            fontSize: 11,
            lineHeight: 1.5,
            contentPadding: 40,
            questionSpacing: 14,
        },
    },
    compact: {
        id: 'compact',
        name: 'Compact',
        description: 'Smaller font and tighter spacing to save paper.',
        styles: {
            pageSize: 'A4',
            fontSize: 9,
            lineHeight: 1.3,
            contentPadding: 30,
            questionSpacing: 8,
        },
    },
    readable: {
        id: 'readable',
        name: 'Large & Readable',
        description: 'Larger text and generous spacing for accessibility.',
        styles: {
            pageSize: 'A4',
            fontSize: 14,
            lineHeight: 1.6,
            contentPadding: 40,
            questionSpacing: 20,
        },
    },
};

export const DEFAULT_PRESET_ID = 'standard';

export function getPreset(id: string): PDFPreset {
    return PDF_PRESETS[id] || PDF_PRESETS[DEFAULT_PRESET_ID];
}
