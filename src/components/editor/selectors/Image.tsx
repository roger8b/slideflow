import React from 'react';
import { useNode } from '@craftjs/core';

export interface ImageProps {
    src?: string;
    width?: string;
    height?: string;
    borderRadius?: number;
}

export const Image = ({
    src = 'https://picsum.photos/400/300',
    width = '100%',
    height = 'auto',
    borderRadius = 8
}: ImageProps) => {
    const { connectors: { connect, drag }, selected } = useNode((state) => ({
        selected: state.events.selected,
    }));

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            style={{
                outline: selected ? '2px solid #BBBFCA' : 'none',
                width,
                height,
                borderRadius: `${borderRadius}px`,
                overflow: 'hidden'
            }}
        >
            <img
                src={src}
                alt="Content"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />
        </div>
    );
};

Image.craft = {
    props: {
        src: 'https://picsum.photos/400/300',
        width: '100%',
        height: 'auto',
        borderRadius: 8,
    },
    displayName: 'Image'
};
