import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface ContainerProps {
    flexDirection?: 'row' | 'column';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
    background?: string;
    padding?: number;
    gap?: number;
    flex?: string | number;
    height?: string;
    children?: React.ReactNode;

    // Novas propriedades de design
    borderRadius?: number;
    boxShadow?: string;
    borderWidth?: number;
    borderColor?: string;
    backgroundImage?: string;
    backgroundSize?: 'cover' | 'contain' | 'auto';
    backgroundPosition?: string;
    backgroundOpacity?: number; // Overlay
}

export const Container = ({
    flexDirection = 'column',
    alignItems = 'center',
    justifyContent = 'center',
    background = 'transparent',
    padding = 20,
    gap = 10,
    flex = 1,
    height = 'auto',
    children,

    // Design Defaults
    borderRadius = 0,
    boxShadow = 'none',
    borderWidth = 0,
    borderColor = '#BBBFCA',
    backgroundImage = '',
    backgroundSize = 'cover',
    backgroundPosition = 'center',
    backgroundOpacity = 0,
}: ContainerProps) => {
    const { connectors: { connect, drag } } = useNode();
    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled
    }));

    const isFixed = flex === 0 || flex === '0';
    const computedHeight = isNaN(Number(height)) ? height : `${height}px`;

    const bgStyles: React.CSSProperties = backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize,
        backgroundPosition,
        backgroundRepeat: 'no-repeat',
    } : {};

    return (
        <div
            ref={(ref: any) => { if (ref) connect(drag(ref)); }}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection,
                alignItems,
                justifyContent,
                backgroundColor: background,
                ...bgStyles,
                padding: `${padding}px`,
                gap: `${gap}px`,
                flexGrow: isFixed ? 0 : 1,
                flexShrink: isFixed ? 0 : 1,
                flexBasis: isFixed && computedHeight !== 'auto' ? computedHeight : 'auto',
                height: computedHeight,
                minHeight: computedHeight === 'auto' ? '100px' : computedHeight,
                width: '100%',
                boxSizing: 'border-box',
                border: (enabled || !children) ? (borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : '1px dashed #BBBFCA') : (borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none'),
                borderRadius: `${borderRadius}px`,
                boxShadow,
                cursor: 'default',
                overflow: 'hidden'
            }}
            className="transition-all"
        >
            {/* Overlay for background images */}
            {backgroundImage && backgroundOpacity > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: `rgba(0,0,0,${backgroundOpacity / 100})`,
                        zIndex: 0,
                        pointerEvents: 'none'
                    }}
                />
            )}

            <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection,
                alignItems,
                justifyContent,
                width: '100%',
                height: height === 'auto' ? 'auto' : '100%',
                flexGrow: 1,
                gap: `${gap}px`
            }}>
                {children}
            </div>
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
        height: 'auto',
        borderRadius: 0,
        boxShadow: 'none',
        borderWidth: 0,
        borderColor: '#BBBFCA',
        backgroundImage: '',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundOpacity: 0,
    },
    rules: {
        canDrag: () => true,
        canMoveIn: () => true,
        canMoveOut: () => true,
    },
    isCanvas: true,
    displayName: 'Container'
};
