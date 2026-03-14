import React from 'react';
import { X, Layout, Columns2, Columns3, BookOpen, User, Plus } from 'lucide-react';
import { cn } from '../../constants';
import slideTemplates from '../../data/slideTemplates.json';

interface TemplatesPanelProps {
    onSelectTemplate: (layout: string) => void;
    onClose: () => void;
}

const iconMap = {
    Layout,
    Columns2,
    Columns3,
    BookOpen,
    User
};

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ onSelectTemplate, onClose }) => {
    return (
        <div className="w-80 h-full bg-white border-r border-[#E5E5E5] flex flex-col shadow-xl z-20 animate-in slide-in-from-left duration-300">
            <div className="h-12 px-4 border-b border-[#E5E5E5] flex items-center justify-between bg-gray-50/50">
                <h2 className="text-[13px] font-bold text-[#333333] flex items-center gap-2">
                    <Layout size={16} className="text-[#0D99FF]" /> Modelos de Slide
                </h2>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-[#888888]"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <section className="space-y-3">
                    <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Templates Iniciais</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {slideTemplates.map((template) => {
                            const IconComponent = iconMap[template.icon as keyof typeof iconMap] || Layout;
                            return (
                                <button
                                    key={template.id}
                                    onClick={() => onSelectTemplate(template.layout)}
                                    className="group flex flex-col gap-2 p-3 bg-gray-50 border border-[#E5E5E5] rounded-xl hover:border-[#0D99FF] hover:bg-white transition-all text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center text-[#888888] group-hover:text-[#0D99FF] group-hover:border-[#0D99FF]/30 transition-colors shadow-sm">
                                            <IconComponent size={20} />
                                        </div>
                                        <div>
                                            <span className="text-[12px] font-bold text-[#333333] block">{template.name}</span>
                                            <span className="text-[10px] text-[#888888]">{template.type.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="h-24 w-full bg-gray-200 rounded-lg overflow-hidden border border-[#E5E5E5] relative">
                                        {/* Simple preview representation */}
                                        <div className="absolute inset-0 p-3 flex flex-col gap-2">
                                            <div className="h-2 w-2/3 bg-gray-400/30 rounded" />
                                            <div className="h-1 w-1/2 bg-gray-400/20 rounded" />
                                            <div className="flex-1" />
                                            <div className="h-1 w-1/4 bg-gray-400/20 rounded self-end" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="space-y-3 pb-8">
                    <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Mais em breve</h3>
                    <div className="h-32 border-2 border-dashed border-[#E5E5E5] rounded-xl flex flex-col items-center justify-center text-center p-4">
                        <Plus size={24} className="text-[#BBBFCA] mb-2" />
                        <span className="text-[11px] font-medium text-[#BBBFCA]">Estamos preparando mais layouts para você!</span>
                    </div>
                </section>
            </div>
        </div>
    );
};
