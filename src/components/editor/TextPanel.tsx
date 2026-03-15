import React from 'react';
import { X, Type, Heading1, Heading2, AlignLeft, Sparkles, ArrowUpRight } from 'lucide-react';
import { useEditor, Element } from '@craftjs/core';
import { Title } from './selectors/Title';
import { Text } from './selectors/Text';
import { Container } from './selectors/Container';
import { Icon } from './selectors/Icon';

interface TextPanelProps {
    onClose: () => void;
}

export const TextPanel: React.FC<TextPanelProps> = ({ onClose }) => {
    const { connectors: { create } } = useEditor();

    return (
        <div className="w-80 h-full bg-white border-r border-[#E5E5E5] flex flex-col shadow-xl z-20 animate-in slide-in-from-left duration-300">
            <div className="h-12 px-4 border-b border-[#E5E5E5] flex items-center justify-between bg-gray-50/50">
                <h2 className="text-[13px] font-bold text-[#333333] flex items-center gap-2">
                    <Type size={16} className="text-[#0D99FF]" /> Texto
                </h2>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-[#888888]"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <section className="space-y-4">
                    <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Clique ou arraste</h3>

                    <div className="space-y-3">
                        {/* Heading */}
                        <div
                            ref={(ref: any) => ref && create(ref, <Title text="Título Principal" fontSize={48} fontWeight="800" />)}
                            className="bg-gray-50 border border-[#E5E5E5] rounded-xl p-4 hover:border-[#0D99FF] hover:bg-white transition-all cursor-grab group shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <Heading1 size={24} className="text-[#333333] group-hover:text-[#0D99FF] transition-colors" />
                                <span className="text-xl font-extrabold text-[#333333]">Adicionar Título</span>
                            </div>
                        </div>

                        {/* Subheading */}
                        <div
                            ref={(ref: any) => ref && create(ref, <Title text="Subtítulo ou Seção" fontSize={24} fontWeight="600" />)}
                            className="bg-gray-50 border border-[#E5E5E5] rounded-xl p-4 hover:border-[#0D99FF] hover:bg-white transition-all cursor-grab group shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <Heading2 size={20} className="text-[#333333] group-hover:text-[#0D99FF] transition-colors" />
                                <span className="text-base font-semibold text-[#333333]">Adicionar Subtítulo</span>
                            </div>
                        </div>

                        {/* Body */}
                        <div
                            ref={(ref: any) => ref && create(ref, <Text text="Inclua uma breve descrição ou detalhes extras aqui." fontSize={16} />)}
                            className="bg-gray-50 border border-[#E5E5E5] rounded-xl p-4 hover:border-[#0D99FF] hover:bg-white transition-all cursor-grab group shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <AlignLeft size={18} className="text-[#333333] group-hover:text-[#0D99FF] transition-colors" />
                                <span className="text-sm font-medium text-[#333333]">Adicionar Corpo de Texto</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Com icone</h3>

                    <div className="space-y-3">
                        <div
                            ref={(ref: any) => ref && create(ref,
                                <Element
                                    is={Container}
                                    canvas
                                    custom={{ label: 'Titulo com icone' }}
                                    flexDirection="row"
                                    alignItems="center"
                                    justifyContent="flex-start"
                                    gap={12}
                                    padding={0}
                                    height="auto"
                                >
                                    <Icon name="Sparkles" color="var(--brand-primary)" size={22} />
                                    <Title text="Resultado principal" fontSize={40} fontWeight="800" widthMode="hug" />
                                </Element>
                            )}
                            className="bg-gray-50 border border-[#E5E5E5] rounded-xl p-4 hover:border-[#0D99FF] hover:bg-white transition-all cursor-grab group shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles size={20} className="text-[#333333] group-hover:text-[#0D99FF] transition-colors" />
                                <div>
                                    <div className="text-base font-semibold text-[#333333]">Titulo com icone</div>
                                    <div className="text-[11px] text-[#888888]">Pronto para usar na mesma linha</div>
                                </div>
                            </div>
                        </div>

                        <div
                            ref={(ref: any) => ref && create(ref,
                                <Element
                                    is={Container}
                                    canvas
                                    custom={{ label: 'Titulo com icone a direita' }}
                                    flexDirection="row"
                                    alignItems="center"
                                    justifyContent="flex-start"
                                    gap={12}
                                    padding={0}
                                    height="auto"
                                >
                                    <Title text="Conteudo" fontSize={40} fontWeight="800" widthMode="hug" />
                                    <Icon name="ArrowUpRight" color="var(--brand-primary)" size={24} />
                                </Element>
                            )}
                            className="bg-gray-50 border border-[#E5E5E5] rounded-xl p-4 hover:border-[#0D99FF] hover:bg-white transition-all cursor-grab group shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <ArrowUpRight size={20} className="text-[#333333] group-hover:text-[#0D99FF] transition-colors" />
                                <div>
                                    <div className="text-base font-semibold text-[#333333]">Titulo com icone a direita</div>
                                    <div className="text-[11px] text-[#888888]">Bom para destaque ou CTA visual</div>
                                </div>
                            </div>
                        </div>

                        <div
                            ref={(ref: any) => ref && create(ref,
                                <Element
                                    is={Container}
                                    canvas
                                    custom={{ label: 'Texto com icone' }}
                                    flexDirection="row"
                                    alignItems="center"
                                    justifyContent="flex-start"
                                    gap={10}
                                    padding={0}
                                    height="auto"
                                >
                                    <Icon name="Sparkles" color="var(--brand-primary)" size={18} />
                                    <Text text="Inclua uma mensagem curta com apoio visual." fontSize={18} widthMode="hug" />
                                </Element>
                            )}
                            className="bg-gray-50 border border-[#E5E5E5] rounded-xl p-4 hover:border-[#0D99FF] hover:bg-white transition-all cursor-grab group shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <AlignLeft size={18} className="text-[#333333] group-hover:text-[#0D99FF] transition-colors" />
                                <div>
                                    <div className="text-sm font-medium text-[#333333]">Texto com icone</div>
                                    <div className="text-[11px] text-[#888888]">Para linhas curtas, bullets e chamadas</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Combinações de Fontes</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="p-4 bg-gray-50 rounded-xl border border-[#E5E5E5] hover:border-[#0D99FF] transition-all cursor-pointer">
                            <h4 className="font-bold text-lg mb-1" style={{ fontFamily: 'Playfair Display' }}>Inovação & Futuro</h4>
                            <p className="text-xs text-[#888888]" style={{ fontFamily: 'Inter' }}>Uma combinação elegante para apresentações executivas.</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-[#E5E5E5] hover:border-[#0D99FF] transition-all cursor-pointer">
                            <h4 className="font-extrabold text-lg mb-1" style={{ fontFamily: 'Syne' }}>ESTILO URBANO</h4>
                            <p className="text-xs text-[#888888]" style={{ fontFamily: 'Space Grotesk' }}>Moderno, arrojado e visualmente impactante.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
