import { Question, QuizState } from './types';
import { v4 as uuidv4 } from 'uuid';

export function parseTxtToQuiz(text: string): Partial<QuizState> {
    const lines = text.split(/\r?\n/);
    let documentContent: string[] = [];
    const questions: Question[] = [];

    let currentQuestion: Partial<Question> | null = null;
    let isParsingQuestions = false;

    // Regex helpers
    const questionStartRegex = /^(\d+)[\.)]\s+(.+)/; // Matches "1. Question..." or "1) Question..."
    const optionRegex = /^([A-E])[\.)]\s+(.+)/i; // Matches "A) Option..." or "A. Option..." case insensitive
    const answerRegex = /^(Answer|Correct|Cevap|Yanıt|Doğru Cevap)[\s:]*([A-E])/i; // Matches "Answer: A"

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
            if (!isParsingQuestions) documentContent.push('<p><br/></p>'); // Preserve spacing in doc
            continue;
        }

        // Check for Question Start
        const questionMatch = line.match(questionStartRegex);
        if (questionMatch) {
            isParsingQuestions = true;

            // Save previous question if exists
            if (currentQuestion) {
                finalizeQuestion(currentQuestion, questions);
            }

            // Start new question
            currentQuestion = {
                id: uuidv4(),
                number: parseInt(questionMatch[1], 10),
                text: questionMatch[2],
                options: [],
                correctAnswer: -1, // default
                explanation: '',
            };
            continue;
        }

        // Check for Options
        if (isParsingQuestions && currentQuestion) {
            const optionMatch = line.match(optionRegex);
            if (optionMatch) {
                // If we found an option, add it
                currentQuestion.options = currentQuestion.options || [];
                currentQuestion.options.push(optionMatch[2]);
                continue;
            }

            // Check for Answer key at end of block
            const answerMatch = line.match(answerRegex);
            if (answerMatch) {
                const char = answerMatch[2].toUpperCase();
                const index = char.charCodeAt(0) - 65; // A=0, B=1...
                if (index >= 0 && index < 5) {
                    currentQuestion.correctAnswer = index;
                }
                continue;
            }

            // If line is neither question, option, nor answer, but we are inside a question block...
            // It might be continuation of question text or explanation? 
            // For simplicity, let's treat it as continuation of question text if no options yet, 
            // or ignore/append to last option? 
            // Let's append to question text for multi-line questions.
            if (!currentQuestion.options || currentQuestion.options.length === 0) {
                currentQuestion.text += ' ' + line;
            }
        }

        // If not parsing questions, it's document text
        if (!isParsingQuestions) {
            // Convert plain text line to paragraph
            documentContent.push(`<p>${line}</p>`);
        }
    }

    // Finalize last question
    if (currentQuestion) {
        finalizeQuestion(currentQuestion, questions);
    }

    return {
        content: documentContent.join(''),
        questions: questions,
    };
}

function finalizeQuestion(q: Partial<Question>, list: Question[]) {
    // Basic validation
    if (q.text && q.options && q.options.length >= 2) {
        // Ensure correctAnswer is valid range
        if (q.correctAnswer === undefined || q.correctAnswer < 0) {
            q.correctAnswer = 0; // Default to A if not found
        }

        // Ensure options array matches limit? 
        // User said "adjustable between 2-5". 
        // We take what we parse.

        list.push(q as Question);
    }
}
