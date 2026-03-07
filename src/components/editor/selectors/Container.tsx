import React from 'react';
import { useNode } from '@craftjs/core';

export interface ContainerProps {
    flexDirection?: 'row' | 'column';
    alignItems?: 'flex-start' | 'center' | 'flex-end';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
    background?: string;
    padding?: number;
    gap?: number;
    children?: React.ReactNode;
}

export const Container = ({
    flexDirection = 'column',
    alignItems = 'flex-start',
    justifyContent = 'flex-start',
    background = 'transparent',
    padding = 20,
    gap = 10,
    children,
}: ContainerProps) => {
    const { connectors: { connect, drag } } = useNode();

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
                minHeight: '80px',
                width: '100%',
                boxSizing: 'border-box',
                border: '1px dashed #BBBFCA',
                borderRadius: '8px',
                cursor: 'default',
            }}
            className="transition-all hover:bg-[#F4F4F2]"
        >
            {children}
        </div>
    );
};

Container.craft = {
    props: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        background: 'transparent',
        padding: 20,
        gap: 10,
    },
    rules: {
        canDrag: () => true,
        canMoveIn: () => true,
        canMoveOut: () => true,
    },
    displayName: 'Container'
};
