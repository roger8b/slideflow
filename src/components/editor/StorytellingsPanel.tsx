import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Loader2,
  Check,
  RotateCcw,
  Trash2,
  Play,
  ChevronDown,
  Edit3,
} from 'lucide-react';
import { trpc } from '../../lib/trpc';
import {
  MacroNode,
  SavedStorytelling,
  saveStorytelling,
  listStorytelling,
  deleteStorytelling,
} from '../../lib/storytellingStorage';
import { DeckGenerationProgress } from './DeckGenerationProgress';
import { cn } from '../../constants';

interface StorytellingsPanelProps {
  onClose: () => void;
  addNode: (node: any) => void;
  rfInstance: any;
}

const TEMPLATES = [
  {
    id: 'pitch',
    title: 'Pitch de produto',
    scaffold: 'Pitch de produto SaaS para investidores: problema, solução, tração, modelo de negócio, próximos passos',
  },
  {
    id: 'quarterly',
    title: 'Relatório de resultados Q{N}',
    scaffold: 'Relatório trimestral para stakeholders: métricas principais, conquistas, desafios, plano próximo trimestre',
  },
  {
    id: 'kickoff',
    title: 'Kickoff de projeto',
    scaffold: 'Kickoff de projeto para equipe: objetivos, escopo, timeline, papéis, recursos necessários',
  },
  {
    id: 'training',
    title: 'Treinamento corporativo',
    scaffold: 'Treinamento corporativo: conceitos fundamentais, exemplos práticos, exercícios hands-on, recursos',
  },
  {
    id: 'demo',
    title: 'Demo de funcionalidade',
    scaffold: 'Demo de nova funcionalidade: problema que resolve, como funciona, benefícios, casos de uso',
  },
  {
    id: 'onboarding',
    title: 'Onboarding de time',
    scaffold: 'Onboarding de novos membros: missão e valores, estrutura, processos, ferramentas, primeiros passos',
  },
];

export const StorytellingsPanel: React.FC<StorytellingsPanelProps> = ({
  onClose,
  addNode,
  rfInstance,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generatedMacroNodes, setGeneratedMacroNodes] = useState<MacroNode[] | null>(null);
  const [savedStorytelling, setSavedStorytelling] = useState<SavedStorytelling[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingNodes, setEditingNodes] = useState<MacroNode[] | null>(null);
  const [generatingDeck, setGeneratingDeck] = useState<MacroNode[] | null>(null);

  // Load saved storytellings on mount
  useEffect(() => {
    setSavedStorytelling(listStorytelling());

    const handleUpdate = () => {
      setSavedStorytelling(listStorytelling());
    };

    window.addEventListener('storytellingsUpdated', handleUpdate);
    return () => window.removeEventListener('storytellingsUpdated', handleUpdate);
  }, []);

  const handleTemplateSelect = (scaffold: string) => {
    setPrompt(scaffold);
    setShowTemplates(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedMacroNodes(null);
    setStatusMessage('Gerando estrutura narrativa...');

    try {
      const subscription = trpc.generateStorytelling.subscribe(
        { prompt: prompt.trim() },
        {
          onData: (event) => {
            switch (event.type) {
              case 'progress':
                setStatusMessage(event.message);
                break;

              case 'complete':
                setGeneratedMacroNodes(event.macroNodes as MacroNode[]);
                setEditingNodes(event.macroNodes as MacroNode[]);
                setStatusMessage('Storytelling gerado com sucesso!');
                setIsGenerating(false);
                break;

              case 'error':
                setError(event.message);
                setIsGenerating(false);
                break;
            }
          },
          onError: (err) => {
            console.error('Subscription error:', err);
            setError(err.message || 'Falha na conexão com o servidor');
            setIsGenerating(false);
          },
        }
      );

      return () => subscription.unsubscribe();
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message || 'Falha ao gerar storytelling');
      setIsGenerating(false);
    }
  };

  const handleApprove = () => {
    if (!editingNodes) return;

    try {
      const saved = saveStorytelling(editingNodes);
      setSavedStorytelling((prev) => [...prev, saved]);
      setGeneratedMacroNodes(null);
      setEditingNodes(null);
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar storytelling');
    }
  };

  const handleRegenerate = () => {
    setGeneratedMacroNodes(null);
    setEditingNodes(null);
    handleGenerate();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este storytelling?')) {
      deleteStorytelling(id);
    }
  };

  const handleGenerateDeck = (macroNodes: MacroNode[]) => {
    setGeneratingDeck(macroNodes);
  };

  const handleNodeEdit = (index: number, field: 'title' | 'purpose', value: string) => {
    if (!editingNodes) return;
    const updated = [...editingNodes];
    updated[index] = { ...updated[index], [field]: value };
    setEditingNodes(updated);
  };

  return (
    <div className="w-80 h-full bg-white border-r border-[#E5E5E5] flex flex-col shadow-xl z-20 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="h-12 px-4 border-b border-[#E5E5E5] flex items-center justify-between bg-gray-50/50">
          <h2 className="text-[13px] font-bold text-[#333333] flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-600" /> Storytellings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-[#888888]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Section 1: Prompt Input */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                Nova Narrativa
              </h3>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                Templates <ChevronDown size={12} className={cn("transition-transform", showTemplates && "rotate-180")} />
              </button>
            </div>

            {/* Template Suggestions */}
            {showTemplates && (
              <div className="space-y-2 animate-in slide-in-from-top duration-200">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.scaffold)}
                    className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors group"
                  >
                    <p className="text-[11px] font-semibold text-indigo-900 group-hover:text-indigo-700">
                      {template.title}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Prompt Textarea */}
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva a narrativa da sua apresentação... (ex: Pitch de produto SaaS para investidores)"
                className="w-full h-32 p-3 bg-white border border-[#E5E5E5] rounded-xl text-[11px] focus:ring-1 focus:ring-indigo-600 outline-none transition-all resize-none placeholder:text-[#BBBFCA] text-[#333333]"
                disabled={isGenerating}
              />
              {isGenerating && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-indigo-600" size={20} />
                    <span className="text-[10px] font-bold text-indigo-600">{statusMessage}</span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-2 text-[10px] font-medium text-red-500 bg-red-50 border border-red-100 rounded-md">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={cn(
                "w-full py-2 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-sm active:scale-95 text-[11px]",
                isGenerating || !prompt.trim()
                  ? "bg-[#F5F5F5] text-[#BBBFCA] cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              )}
            >
              {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
              {isGenerating ? "Gerando..." : "Gerar Storytelling"}
            </button>
          </section>

          {/* Section 2: Generation Result */}
          {editingNodes && (
            <section className="space-y-3 animate-in slide-in-from-bottom duration-300">
              <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                Resultado ({editingNodes.length} slides)
              </h3>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {editingNodes.map((node, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-gray-500 mt-1">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={node.title}
                        onChange={(e) => handleNodeEdit(index, 'title', e.target.value)}
                        className="flex-1 text-[11px] font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-600 outline-none transition-colors"
                      />
                    </div>
                    <textarea
                      value={node.purpose}
                      onChange={(e) => handleNodeEdit(index, 'purpose', e.target.value)}
                      placeholder="Purpose of this slide..."
                      className="w-full text-[10px] text-gray-600 bg-transparent border border-transparent hover:border-gray-300 focus:border-indigo-600 rounded p-1 outline-none transition-colors resize-none"
                      rows={2}
                    />
                    <div className="space-y-1">
                      {node.key_points.map((point, pointIdx) => (
                        <div key={pointIdx} className="flex items-start gap-2">
                          <span className="text-[9px] text-gray-400 mt-0.5">•</span>
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => {
                              if (!editingNodes) return;
                              const updated = [...editingNodes];
                              const updatedPoints = [...updated[index].key_points];
                              updatedPoints[pointIdx] = e.target.value;
                              updated[index] = { ...updated[index], key_points: updatedPoints };
                              setEditingNodes(updated);
                            }}
                            className="flex-1 text-[9px] text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-600 outline-none transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  className="flex-1 py-2 px-4 bg-green-600 text-white text-[11px] font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={14} /> Aprovar
                </button>
                <button
                  onClick={handleRegenerate}
                  className="flex-1 py-2 px-4 bg-gray-600 text-white text-[11px] font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} /> Regenerar
                </button>
              </div>
            </section>
          )}

          {/* Section 3: Saved Storytellings */}
          {savedStorytelling.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                Salvos ({savedStorytelling.length})
              </h3>

              <div className="space-y-2">
                {savedStorytelling.map((story) => (
                  <div
                    key={story.id}
                    className="p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-semibold text-gray-900 truncate">
                          {story.title}
                        </h4>
                        <p className="text-[9px] text-gray-500 mt-0.5">
                          {story.slideCount} slides • {new Date(story.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(story.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Preview first 3 slides */}
                    <div className="space-y-1 mb-3">
                      {story.macroNodes.slice(0, 3).map((node, idx) => (
                        <p key={idx} className="text-[9px] text-gray-600 truncate">
                          {idx + 1}. {node.title}
                        </p>
                      ))}
                      {story.macroNodes.length > 3 && (
                        <p className="text-[9px] text-gray-400 italic">
                          +{story.macroNodes.length - 3} mais...
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleGenerateDeck(story.macroNodes)}
                      className="w-full py-2 px-3 bg-indigo-600 text-white text-[10px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play size={12} /> Gerar Deck
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Deck Generation Progress */}
          {generatingDeck && (
            <section className="space-y-3">
              <DeckGenerationProgress
                macroNodes={generatingDeck}
                onCancel={() => setGeneratingDeck(null)}
                onComplete={() => setGeneratingDeck(null)}
                addNode={addNode}
                rfInstance={rfInstance}
              />
            </section>
          )}
        </div>
      </div>
  );
};
