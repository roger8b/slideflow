import React, { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { Sparkles, Loader2, Send, Wand2 } from 'lucide-react';
import { generateAILayout } from '../../lib/gemini';
import { cn } from '../../constants';

export const AILayoutGenerator = () => {
    const { actions, query } = useEditor();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const components = await generateAILayout(prompt);

            // Map the simplified JSON from Gemini to Craft.js serializable format
            const craftNodes: any = {
                ROOT: {
                    type: { resolvedName: "Container" },
                    isCanvas: true,
                    props: { padding: 40, flex: 1, height: "100%", width: "100%", background: "transparent" },
                    nodes: [],
                    linkedNodes: {},
                    displayName: "Container",
                    custom: {},
                    parent: null,
                    hidden: false
                }
            };

            let nodeCounter = 0;
            const processComponent = (comp: any, parentId: string) => {
                const nodeId = `ai_node_${nodeCounter++}`;
                craftNodes[parentId].nodes.push(nodeId);

                const { type, props, children, ...rest } = comp;

                // Merge props if they exist, or take top-level properties as props
                const componentProps = {
                    ...(props || {}),
                    ...rest
                };

                craftNodes[nodeId] = {
                    type: { resolvedName: type },
                    isCanvas: type === "Container",
                    props: componentProps,
                    nodes: [],
                    linkedNodes: {},
                    parent: parentId,
                    displayName: type,
                    custom: {},
                    hidden: false
                };

                if (children && Array.isArray(children) && type === "Container") {
                    children.forEach((child: any) => processComponent(child, nodeId));
                }
            };

            components.forEach((comp: any) => processComponent(comp, "ROOT"));

            // Serialize and Deserialize to update the canvas
            const serialized = JSON.stringify(craftNodes);
            actions.deserialize(serialized);

            setPrompt('');
        } catch (err: any) {
            console.error("AI Generation failed:", err);
            setError(err.message || "Failed to generate layout");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-white border-b border-[#BBBFCA] shadow-inner">
            <div className="flex items-center gap-2 mb-3 text-[#495464]">
                <Sparkles size={18} className="text-indigo-500 animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Mágica com Gemini</h3>
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Descreva o que você quer no slide... (ex: Título e 3 tópicos em colunas)"
                        className="w-full h-24 p-3 bg-white border border-[#BBBFCA] rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none placeholder:text-[#BBBFCA]"
                        disabled={isLoading}
                    />
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl transition-all">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="animate-spin text-indigo-600" size={24} />
                                <span className="text-xs font-bold text-indigo-600">Criando Layout...</span>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-2 text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-lg">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className={cn(
                        "w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-black transition-all shadow-md active:scale-95",
                        isLoading || !prompt.trim()
                            ? "bg-[#E8E8E8] text-[#BBBFCA] cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                    )}
                >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                    {isLoading ? "Processando..." : "Gerar com IA"}
                </button>
            </div>
        </div>
    );
};
