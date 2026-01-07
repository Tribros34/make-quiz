import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { QuizState } from '@/lib/types';
import parse, { DOMNode, Element, domToReact } from 'html-react-parser';

// Register a font that supports Turkish characters
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' },
    ],
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Roboto',
        fontSize: 12,
        lineHeight: 1.4,
    },
    coverPage: {
        padding: 40,
        fontFamily: 'Roboto',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // height: '100%', // Removed per recommendation
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 40,
    },
    header: {
        fontSize: 10,
        color: '#999',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        marginBottom: 10,
    },
    h1: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
    h2: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 8 },
    p: { fontSize: 12, marginBottom: 6 },
    ul: { marginLeft: 15, marginBottom: 6 },
    ol: { marginLeft: 15, marginBottom: 6 },
    li: {
        flexDirection: 'row',
        marginBottom: 4
    },
    bullet: { width: 15 },
    bold: { fontWeight: 'bold' },
    italic: { fontStyle: 'italic' },
    questionContainer: {
        marginBottom: 12,
    },
    questionText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    optionRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    optionLabel: {
        width: 25,
        fontWeight: 'bold',
    },
    optionText: {
        width: 450, // Fixed safe width
        fontSize: 12,
    },
    answerKeyContainer: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    answerKeyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    answerRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 10,
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#999',
    },
});

const isBlockElement = (node: DOMNode): boolean => {
    if (node instanceof Element && node.type === 'tag') {
        return ['div', 'p', 'ul', 'ol', 'li', 'table', 'blockquote', 'img'].includes(node.name);
    }
    return false;
};

// Helper to render HTML content to PDF nodes
const HtmlContent = ({ html }: { html: string }) => {
    const options = {
        replace: (domNode: DOMNode) => {
            if (domNode instanceof Element && domNode.type === 'tag') {
                const children = domNode.children ? domToReact(domNode.children as DOMNode[], options) : null;

                switch (domNode.name) {
                    case 'h1':
                        return <Text style={styles.h1}>{children}</Text>;
                    case 'h2':
                        return <Text style={styles.h2}>{children}</Text>;
                    case 'p':
                        const hasBlockChildren = domNode.children && (domNode.children as DOMNode[]).some(isBlockElement);
                        if (hasBlockChildren) {
                            return <View style={{ marginBottom: 6 }}>{children}</View>;
                        }
                        return <Text style={styles.p}>{children}</Text>;
                    case 'ul':
                        return <View style={styles.ul}>{children}</View>;
                    case 'ol':
                        return <View style={styles.ol}>{children}</View>;
                    case 'li':
                        return (
                            <View style={styles.li} wrap={false}>
                                <Text style={styles.bullet}>•</Text>
                                <View style={{ width: 450 }}>
                                    {children}
                                </View>
                            </View>
                        );
                    case 'strong':
                    case 'b':
                        return <Text style={styles.bold}>{children}</Text>;
                    case 'em':
                    case 'i':
                        return <Text style={styles.italic}>{children}</Text>;
                    case 'br':
                        return <Text>{'\n'}</Text>;
                    case 'div':
                        return <View>{children}</View>;
                    default:
                        return <Text>{children}</Text>;
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
}

export const PDFDocument = ({ state }: PDFDocumentProps) => {
    const { title, content, questions, settings } = state;

    // Split questions into chunks of 8 per page to ensure stability
    const questionChunks = chunk(questions, 8);
    const answerChunks = settings.includeAnswerKey && settings.showAnswers
        ? chunk(questions, 30) // Answer keys are smaller, more can fit
        : [];

    return (
        <Document>
            {/* 1. Cover Page */}
            {state.settings.coverPage && (
                <Page size="A4" style={styles.coverPage}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={styles.title}>{title || 'Untitled Quiz'}</Text>
                        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
                        <Text>Generated by QuizPDF Maker</Text>
                    </View>
                </Page>
            )}

            {/* 2. Content Page (Preamble) */}
            {/* If there is content, render it on its own page(s) */}
            {content && content !== '<p></p>' && (
                <Page size="A4" style={styles.page} wrap>
                    <Text style={styles.title} fixed>{title}</Text>
                    <View style={styles.section}>
                        <HtmlContent html={content} />
                    </View>
                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                        `${pageNumber} / ${totalPages}`
                    )} fixed />
                </Page>
            )}

            {/* 3. Question Pages (Chunked) */}
            {questionChunks.map((qs, pageIndex) => (
                <Page key={`q-page-${pageIndex}`} size="A4" style={styles.page}>
                    <Text style={styles.header} fixed>{title}</Text>

                    {qs.map((q) => (
                        <View key={q.id} style={styles.questionContainer} wrap={false}>
                            <Text style={styles.questionText}>{q.number}. {q.text}</Text>
                            {q.options.map((opt, idx) => (
                                <View key={idx} style={styles.optionRow} wrap={false}>
                                    <Text style={styles.optionLabel}>{String.fromCharCode(65 + idx)}</Text>
                                    <Text style={styles.optionText}>{opt}</Text>
                                </View>
                            ))}
                        </View>
                    ))}

                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                        `${pageNumber} / ${totalPages}`
                    )} fixed />
                </Page>
            ))}

            {/* 4. Answer Key Pages (Chunked) */}
            {answerChunks.map((qs, pageIndex) => (
                <Page key={`ans-page-${pageIndex}`} size="A4" style={styles.page}>
                    <Text style={styles.title}>Answer Key</Text>
                    {qs.map((q) => (
                        <View key={q.id} style={styles.answerRow} wrap={false}>
                            <Text style={{ width: 30, fontWeight: 'bold' }}>{q.number}.</Text>
                            <Text style={{ fontWeight: 'bold' }}>{String.fromCharCode(65 + q.correctAnswer)}</Text>
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
