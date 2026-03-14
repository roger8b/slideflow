import React from 'react';
import { useEditor } from '@craftjs/core';
import { Layout, Type, StretchVertical, Image as ImageIcon, Box, Layers } from 'lucide-react';

// Maps Craft.js component names to Lucide icons
const ComponentIcon = ({ name, size = 14 }: { name: string; size?: number }) => {
    switch (name) {
        case 'Container': return <Layout size={size} />;
        case 'Title': return <Type size={size} />;
        case 'Text': return <StretchVertical size={size} />;
        case 'Image': return <ImageIcon size={size} />;
        default: return <Box size={size} />;
    }
};

const TreeNode = ({ id, depth = 0 }: { id: string; depth?: number }) => {
    const { actions, isActive, node } = useEditor((state) => ({
        isActive: state.events.selected.has(id),
        node: state.nodes[id]
    }));

    if (!node) return null;

    const isRoot = id === 'ROOT';
    const hasChildren = node.data.nodes && node.data.nodes.length > 0;

    // Don't show the root wrapper if it's the only thing to show
    // We usually want to start showing from the slide's main Container

    return (
        <div className="flex flex-col">
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    actions.selectNode(id);
                }}
                className={`
                    flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors text-xs
                    ${isActive ? 'bg-[#495464] text-white' : 'hover:bg-[#E8E8E8] text-[#495464]'}
                `}
                style={{ marginLeft: `${depth * 12}px` }}
            >
                <div className={`opacity-70 ${isActive ? 'text-white' : 'text-[#BBBFCA]'}`}>
                    <ComponentIcon name={node.data.name} size={12} />
                </div>
                <span className="font-semibold truncate">
                    {node.data.custom?.label || node.data.name}
                </span>
            </div>

            {hasChildren && (
                <div className="flex flex-col mt-0.5">
                    {node.data.nodes.map((childId) => (
                        <TreeNode key={childId} id={childId} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const LayersTree = () => {
    const { rootNodeId } = useEditor((state) => ({
        rootNodeId: 'ROOT'
    }));

    return (
        <div className="p-4 bg-white animate-in slide-in-from-left duration-200">
            <h4 className="flex items-center gap-2 text-[11px] font-black text-[#495464] uppercase border-b border-[#E8E8E8] pb-2 mb-3">
                <Layers size={14} /> Slide Layers
            </h4>
            <div className="overflow-x-auto pb-4">
                <TreeNode id={rootNodeId} depth={0} />
            </div>
        </div>
    );
};
