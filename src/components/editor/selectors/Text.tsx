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
}

export const Text = ({ text = 'Your text here...', fontSize = 18, color = '#495464', textAlign = 'left', fontFamily = 'inherit' }: TextProps) => {
    const { connectors: { connect, drag }, actions: { setProp }, selected } = useNode((state: any) => ({
        selected: state.events.selected,
    }));

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled
    }));

    const [isEditing, setIsEditing] = useState(false);

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (!enabled) return;
        e.stopPropagation();
        setIsEditing(true);
    };

    return (
        <div
            ref={(ref: any) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "group relative border border-transparent transition-all",
                selected && "border-blue-500 bg-blue-50/10",
                enabled && "hover:border-blue-300 hover:bg-[#F4F4F2] cursor-move",
                "w-full"
            )}
        >
            {enabled && selected && (
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 text-blue-500 bg-white shadow-sm rounded-l-md border border-blue-200 z-10">
                    <GripVertical size={14} />
                </div>
            )}
            <div
                className="w-full h-full"
                onDoubleClick={handleDoubleClick}
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
                            color,
                            textAlign,
                            lineHeight: '1.5',
                            fontFamily: isEditing ? 'monospace' : fontFamily
                        }}
                    />
                ) : (
                    <div
                        className="markdown-content prose max-w-none"
                        style={{
                            fontSize: `${fontSize}px`,
                            color,
                            textAlign,
                            lineHeight: '1.5',
                            fontFamily,
                            padding: '4px',
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
        color: '#495464',
        textAlign: 'left',
        fontFamily: 'inherit',
    },
    displayName: 'Text',
    rules: {
        canDrag: () => true,
    }
};
