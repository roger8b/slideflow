import React, { useState, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';
import { GripVertical } from 'lucide-react';
import { cn } from '../../../constants';

export interface TitleProps {
    text?: string;
    fontSize?: number;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    fontFamily?: string;
    background?: string;
    widthMode?: 'fill' | 'hug';
}

export const Title = ({
    text = 'New Title',
    fontSize = 48,
    color = 'var(--brand-text)',
    textAlign = 'left',
    fontWeight = 'bold',
    fontStyle = 'normal',
    textDecoration = 'none',
    fontFamily = 'var(--brand-font-title)',
    background = 'transparent',
    widthMode = 'fill'
}: TitleProps) => {
    const { connectors: { connect, drag }, actions: { setProp }, selected } = useNode((state: any) => ({
        selected: state.events.selected,
    }));

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled
    }));
    const isHug = widthMode === 'hug';
    const isGradient = color?.includes('gradient');
    const textStyle: React.CSSProperties = isGradient ? {
        backgroundImage: color,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent', // Fallback
        display: isHug ? 'inline-block' : 'block',
    } : {
        color: color,
        display: isHug ? 'inline-block' : 'block',
    };

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)); }}
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
            <ContentEditable
                html={text}
                disabled={!enabled}
                onChange={(e) => setProp((props: any) => (props.text = e.target.value.replace(/<\/?[^>]+(>|$)/g, "")))}
                tagName="h1"
                style={{
                    fontSize: `${fontSize}px`,
                    textAlign,
                    fontWeight: fontWeight,
                    fontStyle: fontStyle,
                    textDecoration: textDecoration,
                    fontFamily: fontFamily,
                    margin: 0,
                    padding: '4px',
                    width: isHug ? 'fit-content' : '100%',
                    maxWidth: '100%',
                    ...textStyle
                }}
            />
        </div>
    );
};

Title.craft = {
    props: {
        text: 'New Title',
        fontSize: 48,
        color: 'var(--brand-text)',
        textAlign: 'left',
        fontWeight: 'bold',
        fontFamily: 'var(--brand-font-title)',
        background: 'transparent',
        widthMode: 'fill',
    },
    displayName: 'Title',
    rules: {
        canDrag: () => true,
    }
};
