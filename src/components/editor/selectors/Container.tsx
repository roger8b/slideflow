import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface ContainerProps {
    flexDirection?: 'row' | 'column';
    alignItems?: 'flex-start' | 'center' | 'flex-end';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
    background?: string;
    padding?: number;
    gap?: number;
    flex?: string | number;
    height?: string;
    children?: React.ReactNode;
}

export const Container = ({
    flexDirection = 'column',
    alignItems = 'center',
    justifyContent = 'center',
    background = 'transparent',
    padding = 20,
    gap = 10,
    flex = 1,
    height = '100%',
    children,
}: ContainerProps) => {
    const { connectors: { connect, drag } } = useNode();
    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled
    }));

    const isFixed = flex === 0 || flex === '0';
    const computedHeight = isNaN(Number(height)) ? height : `${height}px`;

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            style={{
                display: 'flex',
                flexDirection,
                alignItems,
                justifyContent,
                background,
                padding: `${padding}px`,
                gap: `${gap}px`,
                flexGrow: isFixed ? 0 : 1,
                flexShrink: isFixed ? 0 : 1,
                flexBasis: isFixed && computedHeight !== 'auto' ? computedHeight : 'auto',
                height: computedHeight,
                minHeight: '20px',
                width: '100%',
                boxSizing: 'border-box',
                border: (enabled || !children) ? '1px dashed #BBBFCA' : 'none',
                borderRadius: '8px',
                cursor: 'default',
                overflow: 'hidden'
            }}
            className="transition-all"
        >
            {children}
        </div>
    );
};

Container.craft = {
    props: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        padding: 20,
        gap: 10,
        flex: 1,
        height: '100%',
    },
    rules: {
        canDrag: () => true,
        canMoveIn: () => true,
        canMoveOut: () => true,
    },
    isCanvas: true,
    displayName: 'Container'
};
