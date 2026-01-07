import { QuizState } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LivePreviewProps {
    state: QuizState;
}

const A4_WIDTH_PX = 794; // 210mm at 96dpi
const A4_HEIGHT_PX = 1123; // 297mm at 96dpi

export const LivePreview = ({ state }: LivePreviewProps) => {
    const { title, content, questions, settings } = state;

    return (
        <div className="bg-gray-100 p-4 lg:p-8 overflow-auto h-full flex flex-col items-center gap-8 shadow-inner">
            {/* Cover Page */}
            {settings.coverPage && (
                <div
                    className="bg-white text-black shadow-xl flex flex-col items-center justify-center p-16 text-center transform origin-top transition-transform"
                    style={{ width: A4_WIDTH_PX, minHeight: A4_HEIGHT_PX }}
                >
                    <h1 className="text-4xl font-bold mb-4">{title || 'Untitled Document'}</h1>
                    <p className="text-xl text-gray-600">{new Date().toLocaleDateString()}</p>
                    {/* Add more cover details if needed */}
                </div>
            )}

            {/* Content Page(s) - Simulating continuous page for preview, but could split */}
            <div
                className="bg-white text-black shadow-xl p-16 text-left"
                style={{ width: A4_WIDTH_PX, minHeight: A4_HEIGHT_PX }}
            >
                <h1 className="text-3xl font-bold mb-6 border-b pb-4">{title || 'Untitled Quiz'}</h1>

                {/* Rich Text Content */}
                <div
                    className="prose max-w-none mb-8"
                    dangerouslySetInnerHTML={{ __html: content }}
                />

                {/* Questions */}
                {questions.length > 0 && (
                    <div className="mt-8 space-y-6">
                        <h2 className="text-2xl font-bold border-b pb-2 mb-4">Questions</h2>
                        {questions.map((q) => (
                            <div key={q.id} className="break-inside-avoid">
                                <div className="font-semibold text-lg mb-2">
                                    {q.number}. {q.text}
                                </div>
                                <div className="pl-4 space-y-1">
                                    {q.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <span className="font-medium text-gray-700">{String.fromCharCode(65 + idx)})</span>
                                            <span>{opt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Answer Key */}
                {settings.includeAnswerKey && settings.showAnswers && questions.length > 0 && (
                    <div className="mt-12 pt-8 border-t break-before-page">
                        <h3 className="text-xl font-bold mb-4">Answer Key</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {questions.map((q) => (
                                <div key={q.id}>
                                    <span className="font-bold">{q.number}.</span> {String.fromCharCode(65 + q.correctAnswer)}
                                    {q.explanation && (
                                        <p className="text-sm text-gray-500 mt-1 ml-4 italic">{q.explanation}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
