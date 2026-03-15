import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import * as Icons from 'lucide-react';
import { GripVertical } from 'lucide-react';
import { cn } from '../../../constants';

export interface IconProps {
    name?: string;
    size?: number;
    color?: string;
    strokeWidth?: number;
    background?: string;
    padding?: number;
    borderRadius?: number;
}

export const Icon = ({
    name = 'Star',
    size = 24,
    color = 'var(--brand-primary)',
    strokeWidth = 2,
    background = 'transparent',
    padding = 0,
    borderRadius = 0
}: IconProps) => {
    const { connectors: { connect, drag }, selected } = useNode((state: any) => ({
        selected: state.events.selected,
    }));

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled
    }));

    const LucideIcon = (Icons as any)[name] || Icons.HelpCircle;

    return (
        <div
            ref={(ref: any) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "group relative border border-transparent transition-all inline-flex items-center justify-center",
                selected && "border-blue-500 bg-blue-50/10",
                enabled && "hover:border-blue-300 hover:bg-[#F4F4F2] cursor-move"
            )}
            style={{
                backgroundColor: background,
                padding: `${padding}px`,
                borderRadius: `${borderRadius}px`
            }}
        >
            {enabled && selected && (
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 text-blue-500 bg-white shadow-sm rounded-l-md border border-blue-200 z-10">
                    <GripVertical size={14} />
                </div>
            )}
            <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />
        </div>
    );
};

Icon.craft = {
    props: {
        name: 'Star',
        size: 24,
        color: 'var(--brand-primary)',
        strokeWidth: 2,
        background: 'transparent',
        padding: 0,
        borderRadius: 0
    },
    displayName: 'Icon',
    rules: {
        canDrag: () => true,
    }
};
