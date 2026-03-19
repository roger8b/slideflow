import React from 'react';
import {
    Type,
    Palette as PaletteIcon,
    Image as ImageIcon,
    Layers,
    Layout,
    Settings,
    Plus,
    BookOpen
} from 'lucide-react';
import { cn } from '../../constants';

interface LeftSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'brand', icon: PaletteIcon, label: 'Marca' },
        { id: 'templates', icon: Layout, label: 'Modelos' },
        { id: 'storytellings', icon: BookOpen, label: 'Storytellings' },
        { id: 'elements', icon: Plus, label: 'Elementos' },
        { id: 'uploads', icon: ImageIcon, label: 'Uploads' },
        { id: 'text', icon: Type, label: 'Texto' },
        { id: 'layers', icon: Layers, label: 'Camadas' },
    ];

    return (
        <div className="w-16 h-full bg-[#1e1e1e] flex flex-col items-center py-4 gap-4 z-20 border-r border-black/20">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(activeTab === tab.id ? '' : tab.id)}
                    className={cn(
                        "w-12 h-12 flex flex-col items-center justify-center rounded-lg transition-all group relative",
                        activeTab === tab.id
                            ? "bg-[#333333] text-white"
                            : "text-[#888888] hover:text-white hover:bg-[#2a2a2a]"
                    )}
                    title={tab.label}
                >
                    <tab.icon size={20} />
                    <span className="text-[10px] mt-1 font-medium scale-0 group-hover:scale-100 transition-transform origin-top">
                        {tab.label}
                    </span>
                    {activeTab === tab.id && (
                        <div className="absolute left-0 w-1 h-6 bg-[#0D99FF] rounded-r-full" />
                    )}
                </button>
            ))}

            <div className="mt-auto">
                <button className="w-12 h-12 flex items-center justify-center rounded-lg text-[#888888] hover:text-white hover:bg-[#2a2a2a] transition-all">
                    <Settings size={20} />
                </button>
            </div>
        </div>
    );
};
