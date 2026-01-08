import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { QuizState, Question, Section } from '@/lib/types';
import { PDFPage } from './utils/pdfHelpers';
import { getPreset } from '@/lib/pdfPresets';
import parse, { DOMNode, Element, domToReact } from 'html-react-parser';

// Register a font that supports Turkish characters
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' },
    ],
});

// Helper for parsing HTML into React-PDF compatible components
const HtmlContent = ({ html, fontSize }: { html: string, fontSize: number }) => {
    const options = {
        replace: (domNode: DOMNode) => {
            if (domNode instanceof Element) {
                const { name, children } = domNode;
                switch (name) {
                    case 'strong':
                    case 'b':
                        return <Text style={{ fontWeight: 700 }}>{domToReact(children as DOMNode[], options)}</Text>;
                    case 'p':
                        return <Text style={{ marginBottom: 8 }}>{domToReact(children as DOMNode[], options)}</Text>;
                    case 'u':
                        return <Text style={{ textDecoration: 'underline' }}>{domToReact(children as DOMNode[], options)}</Text>;
                    case 'em':
                    case 'i':
                        return <Text style={{ fontStyle: 'italic' }}>{domToReact(children as DOMNode[], options)}</Text>;
                    case 'br':
                        return <Text>{'\n'}</Text>;
                    case 'div':
                        return <View>{domToReact(children as DOMNode[], options)}</View>;
                    default:
                        // For unhandled tags, just render children
                        return <Text>{domToReact(children as DOMNode[], options)}</Text>;
                }
            }
            if (domNode.type === 'text') {
                return <Text>{domNode.data}</Text>;
            }
        }
    };

    return <View>{parse(html, options)}</View>;
};

// Chunk helper
const chunk = <T,>(arr: T[], size: number) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );

interface PDFDocumentProps {
    state: QuizState;
    pages?: PDFPage[]; // Pre-calculated pages
}

export const PDFDocument = ({ state, pages }: PDFDocumentProps) => {
    const { title, content, settings } = state;
    const finalPages = pages || [];

    // Get styles from preset
    const preset = getPreset(settings.selectedPresetId);
    const { pageSize, fontSize, lineHeight, contentPadding, questionSpacing } = preset.styles;

    // Dynamic styles
    const styles = StyleSheet.create({
        page: {
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            padding: contentPadding,
            fontFamily: 'Roboto',
            fontSize: fontSize,
            lineHeight: lineHeight,
            color: '#333',
        },
        coverPage: {
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            fontFamily: 'Roboto',
            padding: 40,
        },
        title: {
            fontSize: fontSize * 2,
            marginBottom: 20,
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#111',
        },
        description: {
            fontSize: fontSize * 1.2,
            marginBottom: 30,
            textAlign: 'center',
            color: '#555',
        },
        header: {
            fontSize: fontSize * 0.9,
            marginBottom: 20,
            textAlign: 'center',
            color: '#666',
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
            paddingBottom: 5,
        },
        section: {
            margin: 10,
            padding: 10,
        },
        sectionHeader: {
            marginTop: 10,
            marginBottom: 10,
        },
        sectionTitle: {
            fontSize: fontSize * 1.4,
            fontWeight: 'bold',
        },
        sectionDesc: {
            fontSize: fontSize * 0.9,
            color: '#666',
            marginTop: 4,
        },
        questionContainer: {
            marginBottom: questionSpacing,
        },
        questionText: {
            marginBottom: 6,
            fontWeight: 'bold',
            lineHeight: lineHeight,
        },
        optionRow: {
            flexDirection: 'row',
            marginBottom: 3,
        },
        optionLabel: {
            width: 20,
            fontWeight: 'bold',
            marginRight: 5,
        },
        optionText: {
            flex: 1,
            lineHeight: lineHeight,
        },
        tfContainer: {
            flexDirection: 'row',
            marginTop: 5,
        },
        tfOption: {
            marginRight: 20,
            fontSize: fontSize * 0.9,
        },
        shortAnswerLine: {
            marginTop: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#333',
            width: '100%',
            height: 1,
        },
        answerRow: {
            flexDirection: 'row',
            marginBottom: 5,
            borderBottomWidth: 0.5,
            borderBottomColor: '#eee',
            paddingBottom: 2,
        },
        date: {
            fontSize: fontSize,
            textAlign: 'center',
            color: '#555',
            marginTop: 10,
            marginBottom: 40,
        },
        pageNumber: {
            position: 'absolute',
            fontSize: 10,
            bottom: 30,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'grey',
        },
    });

    // Answer keys: flattened list of all questions for the key area
    const allQuestions = state.sections.flatMap(s => s.questions);
    const shouldShowAnswerKey = settings.answerDisplayMode === 'end_of_pdf' || (settings.includeAnswerKey && settings.answerDisplayMode !== 'hidden');
    const answerChunks = shouldShowAnswerKey
        ? chunk(allQuestions, 30) // increased chunk size just in case, or keep 30
        : [];

    const getCorrectAnswerLabel = (q: Question) => {
        if (!q.type || q.type === 'multiple-choice') {
            return String.fromCharCode(65 + q.correctAnswer);
        } else if (q.type === 'true-false') {
            return q.correctValue ? 'True' : 'False';
        } else if (q.type === 'short-answer') {
            return q.expectedAnswer || '[No Answer]';
        }
        return '';
    };

    return (
        <Document>
            {/* 1. Cover Page */}
            {state.settings.coverPage && (
                <Page size={pageSize} style={styles.coverPage}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={styles.title}>{title || 'Untitled Quiz'}</Text>
                        {settings.description && (
                            <Text style={styles.description}>{settings.description}</Text>
                        )}
                        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
                        <Text style={{ textAlign: 'center', fontSize: 10, color: '#999' }}>Generated by QuizPDF Maker</Text>
                    </View>
                </Page>
            )}

            {/* 2. Content Page (Preamble) */}
            {content && content !== '<p></p>' && content !== '<p>Start typing your content here...</p>' && (
                <Page size={pageSize} style={styles.page} wrap>
                    <Text style={styles.header} fixed>{title}</Text>
                    <View style={styles.section}>
                        <HtmlContent html={content} fontSize={fontSize} />
                    </View>
                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                        `${pageNumber} / ${totalPages}`
                    )} fixed />
                </Page>
            )}

            {/* 3. Question Pages (Dynamic) */}
            {finalPages.map((pageItems, pageIndex) => (
                <Page key={`q-page-${pageIndex}`} size={pageSize} style={styles.page}>
                    <Text style={styles.header} fixed>{title}</Text>

                    {pageItems.map((item, idx) => {
                        if (item.type === 'section-header') {
                            if (!settings.showSectionTitles) return null;
                            return (
                                <View key={`sec-${item.section.id}`} style={styles.sectionHeader} wrap={false}>
                                    <Text style={styles.sectionTitle}>{item.section.title}</Text>
                                    {item.section.description && (
                                        <Text style={styles.sectionDesc}>{item.section.description}</Text>
                                    )}
                                    <View style={{ borderBottomWidth: 1, borderBottomColor: '#ccc', marginTop: 4, marginBottom: 4 }} />
                                </View>
                            );
                        } else {
                            const q = item.question;
                            const questionNumber = settings.numberingStyle === 'continuous'
                                ? `${q.number}.`
                                : ''; // TODO: Implement per-section numbering logic or accept it from state if prepared

                            return (
                                <View key={q.id} style={styles.questionContainer} wrap={false}>
                                    <View style={{ flexDirection: 'row' }}>
                                        {settings.showQuestionNumbers && (
                                            <Text style={{ width: 25, fontWeight: 'bold' }}>{q.number}.</Text>
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.questionText}>{q.text}</Text>
                                            {(!q.type || q.type === 'multiple-choice') && (q.options || []).map((opt: string, idx: number) => (
                                                <View key={idx} style={styles.optionRow} wrap={false}>
                                                    <Text style={styles.optionLabel}>{String.fromCharCode(65 + idx)}</Text>
                                                    <Text style={styles.optionText}>{opt}</Text>
                                                </View>
                                            ))}

                                            {q.type === 'true-false' && (
                                                <View style={styles.tfContainer}>
                                                    <Text style={styles.tfOption}>○ True</Text>
                                                    <Text style={styles.tfOption}>○ False</Text>
                                                </View>
                                            )}

                                            {q.type === 'short-answer' && (
                                                <View style={styles.shortAnswerLine} />
                                            )}
                                        </View>
                                    </View>
                                </View>
                            );
                        }
                    })}

                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                        `${pageNumber} / ${totalPages}`
                    )} fixed />
                </Page>
            ))}

            {/* 4. Answer Key Pages (Chunked) */}
            {answerChunks.map((qs, pageIndex) => (
                <Page key={`ans-page-${pageIndex}`} size={pageSize} style={styles.page}>
                    <Text style={styles.title}>Answer Key</Text>
                    {qs.map((q) => (
                        <View key={q.id} style={styles.answerRow} wrap={false}>
                            <Text style={{ width: 30, fontWeight: 'bold' }}>{q.number}.</Text>
                            <Text style={{ fontWeight: 'bold' }}>{getCorrectAnswerLabel(q)}</Text>
                            {q.explanation ? <Text style={{ marginLeft: 10, color: '#555', fontStyle: 'italic' }}> - {q.explanation}</Text> : null}
                        </View>
                    ))}
                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                        `${pageNumber} / ${totalPages}`
                    )} fixed />
                </Page>
            ))}
        </Document>
    );
};
