import React, { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { Sparkles, Loader2, Wand2, X } from 'lucide-react';
import { trpc } from '../../lib/trpc';
import { cn } from '../../constants';

interface AILayoutGeneratorProps {
    variant?: 'default' | 'icon';
}

export const AILayoutGenerator = ({ variant = 'default' }: AILayoutGeneratorProps) => {
    const { actions } = useEditor();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setStatusMessage('Iniciando geração...');

        try {
            const subscription = trpc.generateLayout.subscribe(
                { prompt: prompt.trim() },
                {
                    onData: (event) => {
                        switch (event.type) {
                            case 'progress':
                                setStatusMessage(event.message);
                                break;

                            case 'iteration':
                                setStatusMessage(
                                    `Slide ${event.slideIndex + 1} - Tentativa ${event.iteration}${
                                        event.valid ? ' ✓' : '...'
                                    }`
                                );
                                break;

                            case 'slide_complete':
                                setStatusMessage(`Slide ${event.slideIndex + 1} concluído`);
                                break;

                            case 'complete':
                                // Deserialize the first slide's craftJson into the editor
                                if (event.craftJsons.length > 0) {
                                    const serialized = JSON.stringify(event.craftJsons[0]);
                                    actions.deserialize(serialized);
                                }
                                setStatusMessage('Layout gerado com sucesso!');
                                setPrompt('');
                                if (variant === 'icon') setIsOpen(false);
                                setIsLoading(false);
                                break;

                            case 'error':
                                setError(event.message);
                                setIsLoading(false);
                                break;
                        }
                    },
                    onError: (err) => {
                        console.error('Subscription error:', err);
                        setError(err.message || 'Falha na conexão com o servidor');
                        setIsLoading(false);
                    },
                }
            );

            // Store subscription for cleanup if needed
            return () => subscription.unsubscribe();
        } catch (err: any) {
            console.error('AI Generation failed:', err);
            setError(err.message || 'Falha ao gerar layout');
            setIsLoading(false);
        }
    };

    const GeneratorContent = (
        <div className="w-full">
            <div className="relative">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Descreva o que você quer no slide... (ex: Título e 3 tópicos em colunas)"
                    className="w-full h-24 p-3 bg-white border border-[#E5E5E5] rounded-xl text-[11px] focus:ring-1 focus:ring-[#0D99FF] outline-none transition-all resize-none placeholder:text-[#BBBFCA] text-[#333333]"
                    disabled={isLoading}
                    autoFocus={variant === 'icon'}
                />
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl transition-all">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-[#0D99FF]" size={20} />
                            <span className="text-[10px] font-bold text-[#0D99FF]">{statusMessage}</span>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-2 p-2 text-[10px] font-medium text-red-500 bg-red-50 border border-red-100 rounded-md">
                    {error}
                </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className={cn(
                    "w-full mt-3 py-2 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-sm active:scale-95 text-[11px]",
                    isLoading || !prompt.trim()
                        ? "bg-[#F5F5F5] text-[#BBBFCA] cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                )}
            >
                {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                {isLoading ? "Processando..." : "Gerar com IA"}
            </button>
        </div>
    );

    if (variant === 'icon') {
        return (
            <div className="relative flex items-center">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-xl transition-colors shrink-0",
                        isOpen ? "bg-indigo-50 text-indigo-600" : "text-indigo-500 hover:bg-gray-100"
                    )}
                    title="Generate Layout with AI"
                >
                    <Sparkles size={18} strokeWidth={1.5} className={!isOpen ? "animate-pulse" : ""} />
                </button>

                {isOpen && (
                    <div className="absolute bottom-[120%] right-0 w-80 bg-white border border-[#E5E5E5] rounded-2xl shadow-xl p-4 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2 text-[#333333]">
                                <Sparkles size={14} className="text-indigo-500" />
                                <h3 className="text-[11px] font-semibold tracking-wide">AI Generation</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-[#888888] hover:text-[#333333]">
                                <X size={14} />
                            </button>
                        </div>
                        {GeneratorContent}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-white border-b border-[#E5E5E5]">
            <div className="flex items-center gap-2 mb-3 text-[#333333]">
                <Sparkles size={16} className="text-indigo-500 animate-pulse" />
                <h3 className="text-[11px] font-semibold tracking-wide">Mágica com Gemini</h3>
            </div>
            {GeneratorContent}
        </div>
    );
};
