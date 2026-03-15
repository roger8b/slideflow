import React, { useState } from 'react';
import { X, Layout, Columns2, Columns3, BookOpen, User, Plus, FileText, ChevronRight } from 'lucide-react';
import { cn } from '../../constants';
import slideTemplates from '../../data/slideTemplates.json';
import presentationTemplates from '../../data/presentationTemplates.json';

interface TemplatesPanelProps {
    onSelectTemplate: (layout: string) => void;
    onSelectPresentationTemplate: (template: any) => void;
    onClose: () => void;
}

const iconMap = {
    Layout,
    Columns2,
    Columns3,
    BookOpen,
    User
};

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
    onSelectTemplate,
    onSelectPresentationTemplate,
    onClose
}) => {
    const [view, setView] = useState<'slides' | 'presentations'>('presentations');

    return (
        <div className="w-80 h-full bg-white border-r border-[#E5E5E5] flex flex-col shadow-xl z-20 animate-in slide-in-from-left duration-300">
            <div className="h-12 px-4 border-b border-[#E5E5E5] flex items-center justify-between bg-gray-50/50">
                <h2 className="text-[13px] font-bold text-[#333333] flex items-center gap-2">
                    <Layout size={16} className="text-[#0D99FF]" /> Modelos
                </h2>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-[#888888]"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex p-2 gap-1 bg-gray-100/50 border-b border-[#E5E5E5]">
                <button
                    onClick={() => setView('presentations')}
                    className={cn(
                        "flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all",
                        view === 'presentations' ? "bg-white text-[#0D99FF] shadow-sm" : "text-[#888888] hover:bg-gray-200"
                    )}
                >
                    Apresentações
                </button>
                <button
                    onClick={() => setView('slides')}
                    className={cn(
                        "flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all",
                        view === 'slides' ? "bg-white text-[#0D99FF] shadow-sm" : "text-[#888888] hover:bg-gray-200"
                    )}
                >
                    Layouts Individuais
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {view === 'presentations' ? (
                    <section className="space-y-3">
                        <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Apresentações Prontas</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {presentationTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => onSelectPresentationTemplate(template)}
                                    className="group flex flex-col p-0 bg-white border border-[#E5E5E5] rounded-xl hover:border-[#0D99FF] transition-all text-left overflow-hidden shadow-sm hover:shadow-md"
                                >
                                    <div className="h-28 w-full bg-gray-900 relative">
                                        <img
                                            src={template.thumbnail}
                                            alt={template.name}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                            <span className="text-[12px] font-bold text-white block truncate">{template.name}</span>
                                            <span className="text-[9px] text-white/70 uppercase tracking-tighter">{template?.slides?.length || 0} SLIDES • {template?.brand?.colors?.primary || '#888888'}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white flex items-center justify-between">
                                        <p className="text-[10px] text-[#888888] line-clamp-1 flex-1 leading-tight mr-2">
                                            {template.description}
                                        </p>
                                        <ChevronRight size={14} className="text-[#BBBFCA]" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                ) : (
                    <section className="space-y-3">
                        <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Layouts de Slide</h3>
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
                )}

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
