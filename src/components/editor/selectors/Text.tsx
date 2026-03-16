import React, { useState } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { GripVertical } from 'lucide-react';
import { cn } from '../../../constants';

export interface TextProps {
    text?: string;
    fontSize?: number;
    color?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    background?: string;
    widthMode?: 'fill' | 'hug';
}

export const Text = ({
    text = 'Your text here...',
    fontSize = 18,
    color = 'var(--brand-text)',
    textAlign = 'left',
    fontFamily = 'var(--brand-font-body)',
    fontWeight = 'normal',
    fontStyle = 'normal',
    textDecoration = 'none',
    background = 'transparent',
    widthMode = 'fill'
}: TextProps) => {
    const { connectors: { connect, drag }, actions: { setProp }, selected } = useNode((state: any) => ({
        selected: state.events.selected,
    }));

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled
    }));

    const [isEditing, setIsEditing] = useState(false);
    const isHug = widthMode === 'hug';

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (!enabled) return;
        e.stopPropagation();
        setIsEditing(true);
    };

    const isGradient = color?.includes('gradient');
    const textStyle: React.CSSProperties = isGradient ? {
        backgroundImage: color,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    } : {
        color: color,
    };

    return (
        <div
            ref={(ref: any) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "group relative border border-transparent transition-all",
                selected && "border-blue-500 bg-blue-50/10",
                enabled && "hover:border-blue-300 hover:bg-[#F4F4F2] cursor-move",
                isHug ? "inline-block max-w-full" : "w-full"
            )}
            style={{
                background: background,
                width: isHug ? 'fit-content' : '100%',
                maxWidth: '100%'
            }}
        >
            {enabled && selected && (
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 text-blue-500 bg-white shadow-sm rounded-l-md border border-blue-200 z-10">
                    <GripVertical size={14} />
                </div>
            )}
            <div
                className={cn("h-full", isHug ? "inline-block max-w-full" : "w-full")}
                onDoubleClick={handleDoubleClick}
                style={{
                    width: isHug ? 'fit-content' : '100%',
                    maxWidth: '100%'
                }}
            >
                {enabled && isEditing ? (
                    <textarea
                        autoFocus
                        value={text}
                        onBlur={() => setIsEditing(false)}
                        onChange={(e) => setProp((props: any) => (props.text = e.target.value))}
                        className="w-full min-h-[100px] bg-transparent outline-none resize-none px-1 py-1 border-none focus:ring-0"
                        style={{
                            fontSize: `${fontSize}px`,
                            ...textStyle,
                            textAlign,
                            lineHeight: '1.5',
                            fontWeight,
                            fontStyle,
                            textDecoration,
                            fontFamily: isEditing ? 'monospace' : fontFamily,
                            width: isHug ? 'max-content' : '100%',
                            minWidth: isHug ? '12ch' : '100%',
                            maxWidth: '100%'
                        }}
                    />
                ) : (
                    <div
                        className="markdown-content text-inherit"
                        style={{
                            fontSize: `${fontSize}px`,
                            ...textStyle,
                            textAlign,
                            lineHeight: '1.5',
                            fontWeight,
                            fontStyle,
                            textDecoration,
                            fontFamily: fontFamily,
                            padding: '4px',
                            minHeight: '1em',
                            width: isHug ? 'fit-content' : '100%',
                            maxWidth: '100%',
                            display: isHug ? 'inline-block' : 'block'
                        }}
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            components={{
                                a: ({ node, ...props }) => <a {...props} style={{ color: 'blue', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer" />,
                                strong: ({ node, ...props }) => <strong {...props} style={{ fontWeight: 'bold' }} />,
                            }}
                        >
                            {text || ''}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};

Text.craft = {
    props: {
        text: 'Your text here...',
        fontSize: 18,
        color: 'var(--brand-text)',
        textAlign: 'left',
        fontFamily: 'var(--brand-font-body)',
        background: 'transparent',
        widthMode: 'fill',
    },
    displayName: 'Text',
    rules: {
        canDrag: () => true,
    }
};
