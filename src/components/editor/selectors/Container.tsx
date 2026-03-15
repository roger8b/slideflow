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
    display?: 'flex' | 'grid';
    gridTemplateColumns?: string;
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
    backdropBlur?: number;
    backdropBlurColor?: string;
    width?: string;
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
    display = 'flex',
    gridTemplateColumns = '1fr 1fr',
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
    backdropBlur = 0,
    backdropBlurColor = 'rgba(255, 255, 255, 0.1)',
}: ContainerProps) => {
    const { connectors: { connect, drag }, selected } = useNode((node) => ({
        selected: node.events.selected
    }));
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
                display: 'flex', // Outer wrapper is always flex to manage size correctly
                flexDirection: 'column',
                backgroundColor: background,
                ...bgStyles,
                padding: `${padding}px`,
                gap: `${gap}px`,
                flexGrow: (isFixed || computedHeight === 'auto') ? 0 : 1,
                flexShrink: 1,
                flexBasis: (isFixed && computedHeight !== 'auto') ? computedHeight : (computedHeight === '100%' ? '0%' : 'auto'),
                height: computedHeight === '100%' ? 'auto' : computedHeight,
                minHeight: computedHeight === 'auto' ? (enabled && !children ? '100px' : '0') : (computedHeight === '100%' ? '0' : computedHeight),
                width: '100%',
                boxSizing: 'border-box',
                border: (enabled || !children) ? (borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : '1px dashed #BBBFCA') : (borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none'),
                borderRadius: `${borderRadius}px`,
                boxShadow,
                cursor: 'default',
                overflow: 'hidden',
                backdropFilter: backdropBlur > 0 ? `blur(${backdropBlur}px)` : 'none',
                WebkitBackdropFilter: backdropBlur > 0 ? `blur(${backdropBlur}px)` : 'none',
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
                display: display,
                flexDirection: display === 'flex' ? flexDirection : undefined,
                alignItems,
                justifyContent,
                gridTemplateColumns: display === 'grid' ? gridTemplateColumns : undefined,
                width: '100%',
                height: height === 'auto' ? 'auto' : '100%',
                flexGrow: 1,
                gap: `${gap}px`
            }}>
                {children}

                {/* Visual Layout Guides (Figma Style) */}
                {enabled && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 10,
                            pointerEvents: 'none',
                            opacity: 'var(--show-grid-overlay, 0)',
                            transition: 'opacity 0.2s ease-in-out',
                        }}
                    >
                        {display === 'grid' ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: gridTemplateColumns,
                                gap: `${gap}px`,
                                height: '100%',
                                outline: selected ? '1px solid rgba(13, 153, 255, 0.3)' : 'none',
                            }}>
                                {(() => {
                                    // Calculate column count from gridTemplateColumns string
                                    let colCount = 1;
                                    if (gridTemplateColumns.includes('repeat')) {
                                        const match = gridTemplateColumns.match(/repeat\((\d+)/);
                                        colCount = match ? parseInt(match[1]) : 1;
                                    } else {
                                        colCount = gridTemplateColumns.split(' ').filter(Boolean).length || 1;
                                    }

                                    return Array.from({ length: colCount }).map((_, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                height: '100%',
                                                background: selected ? 'rgba(13, 153, 255, 0.04)' : 'rgba(13, 153, 255, 0.01)',
                                                borderLeft: selected ? '1px solid rgba(13, 153, 255, 0.2)' : '1px solid rgba(13, 153, 255, 0.05)',
                                                borderRight: selected ? '1px solid rgba(13, 153, 255, 0.2)' : '1px solid rgba(13, 153, 255, 0.05)',
                                            }}
                                        />
                                    ));
                                })()}
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection,
                                alignItems,
                                justifyContent,
                                gap: `${gap}px`,
                                height: '100%',
                                outline: selected ? '1px dashed rgba(13, 153, 255, 0.3)' : 'none',
                            }}>
                                {/* Axis line removed to avoid confusion with grid columns */}

                                {/* Gap Indicators (only show if gap > 0) */}
                                {gap > 0 && Array.from({ length: Math.max(0, React.Children.count(children) - 1) }).map((_, i) => (
                                    <div key={i} style={{
                                        background: 'repeating-linear-gradient(45deg, rgba(13, 153, 255, 0.05), rgba(13, 153, 255, 0.05) 2px, transparent 2px, transparent 4px)',
                                        minWidth: flexDirection === 'row' ? `${gap}px` : '10px',
                                        minHeight: flexDirection === 'column' ? `${gap}px` : '10px',
                                        opacity: selected ? 0.6 : 0.2
                                    }} />
                                ))}

                                {/* Direction Indicator Label */}
                                {selected && (
                                    <div style={{
                                        position: 'absolute',
                                        top: -12,
                                        left: 0,
                                        fontSize: '8px',
                                        color: '#0D99FF',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {flexDirection}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
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
        display: 'flex',
        gridTemplateColumns: '1fr 1fr',
        borderRadius: 0,
        boxShadow: 'none',
        borderWidth: 0,
        borderColor: '#BBBFCA',
        backgroundImage: '',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundOpacity: 0,
        backdropBlur: 0,
        backdropBlurColor: 'rgba(255, 255, 255, 0.1)',
    },
    rules: {
        canDrag: () => true,
        canMoveIn: () => true,
        canMoveOut: () => true,
    },
    isCanvas: true,
    displayName: 'Container'
};
