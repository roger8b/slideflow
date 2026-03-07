import React from 'react';
import { useEditor, Element } from '@craftjs/core';
import {
    Heading1,
    Type,
    Image as ImageIcon,
    Layout,
    Trash2,
    Plus
} from 'lucide-react';
import { Title } from './selectors/Title';
import { Text } from './selectors/Text';
import { Image } from './selectors/Image';
import { Container } from './selectors/Container';

export const SidebarPalette = () => {
    const { actions, selected } = useEditor((state) => ({
        selected: state.events.selected,
    }));

    return (
        <div className="flex flex-col h-full bg-white border-l border-[#BBBFCA] w-64 overflow-y-auto">
            <div className="p-4 border-b border-[#BBBFCA]">
                <h3 className="text-[10px] font-bold text-[#BBBFCA] uppercase tracking-widest flex items-center gap-2">
                    <Plus size={14} /> Components
                </h3>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3">
                <PaletteItem
                    element={<Title text="New Title" fontSize={48} fontWeight="bold" />}
                    icon={<Heading1 size={20} />}
                    label="Title"
                />
                <PaletteItem
                    element={<Text text="Write something..." fontSize={18} />}
                    icon={<Type size={20} />}
                    label="Text"
                />
                <PaletteItem
                    element={<Image src="https://picsum.photos/400/300" />}
                    icon={<ImageIcon size={20} />}
                    label="Image"
                />
                <PaletteItem
                    element={<Element is={Container} canvas padding={20} />}
                    icon={<Layout size={20} />}
                    label="Grid"
                />
            </div>

            <div className="mt-auto border-t border-[#BBBFCA] p-4 flex gap-2">
                <button
                    disabled={!selected.size}
                    onClick={() => selected.forEach(id => actions.delete(id))}
                    className="flex-1 p-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 disabled:opacity-30 disabled:hover:bg-red-50 transition-colors flex flex-col items-center gap-1"
                    title="Delete Selected"
                >
                    <Trash2 size={20} />
                    <span className="text-[9px] font-bold uppercase">Delete</span>
                </button>
            </div>
        </div>
    );
};

const PaletteItem = ({ element, icon, label }: { element: React.ReactElement, icon: any, label: string }) => {
    const { connectors } = useEditor();

    return (
        <div
            ref={(ref) => { if (ref) connectors.create(ref, element); }}
            className="flex flex-col items-center justify-center p-4 bg-[#E8E8E8] hover:bg-[#BBBFCA] rounded-xl cursor-move transition-all border border-transparent hover:border-[#495464] group"
        >
            <div className="text-[#495464] group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-[10px] font-bold text-[#495464] mt-2 group-hover:darker">{label}</span>
        </div>
    );
};
