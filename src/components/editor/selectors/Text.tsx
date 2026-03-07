import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';
import { GripVertical } from 'lucide-react';
import { cn } from '../../../constants';

export interface TextProps {
    text?: string;
    fontSize?: number;
    color?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export const Text = ({ text = 'Your text here...', fontSize = 18, color = '#495464', textAlign = 'left' }: TextProps) => {
    const { connectors: { connect, drag }, actions: { setProp }, selected } = useNode((state: any) => ({
        selected: state.events.selected,
    }));

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled
    }));

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "group relative border border-transparent transition-all",
                selected && "border-blue-500 bg-blue-50/10",
                enabled && "hover:border-blue-300 hover:bg-[#F4F4F2] cursor-move"
            )}
        >
            {enabled && selected && (
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 text-blue-500 bg-white shadow-sm rounded-l-md border border-blue-200 z-10">
                    <GripVertical size={14} />
                </div>
            )}
            <ContentEditable
                html={text}
                disabled={!enabled}
                onChange={(e) => setProp((props: any) => (props.text = e.target.value))}
                tagName="p"
                style={{
                    fontSize: `${fontSize}px`,
                    color,
                    textAlign,
                    lineHeight: '1.5',
                    margin: 0,
                    padding: '4px',
                }}
            />
        </div>
    );
};

Text.craft = {
    props: {
        text: 'Your text here...',
        fontSize: 18,
        color: '#495464',
        textAlign: 'left',
    },
    displayName: 'Text',
    rules: {
        canDrag: () => true,
    }
};
