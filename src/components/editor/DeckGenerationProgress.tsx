import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, X } from 'lucide-react';
import { trpc } from '../../lib/trpc';
import { MacroNode } from '../../lib/storytellingStorage';
import { cn } from '../../constants';

interface DeckGenerationProgressProps {
  macroNodes: MacroNode[];
  onCancel: () => void;
  onComplete: () => void;
  addNode: (craftJson: any) => void;
  rfInstance: any;
}

export const DeckGenerationProgress: React.FC<DeckGenerationProgressProps> = ({
  macroNodes,
  onCancel,
  onComplete,
  addNode,
  rfInstance,
}) => {
  const [statusMessage, setStatusMessage] = useState<string>('Iniciando geração...');
  const [completedSlides, setCompletedSlides] = useState<Array<{ title: string; index: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const sub = trpc.generateDeckFromStorytelling.subscribe(
      { macroNodes },
      {
        onData: (event) => {
          switch (event.type) {
            case 'progress':
              setStatusMessage(event.message);
              break;

            case 'iteration':
              setStatusMessage(
                `Slide ${event.slideIndex + 1}: Tentativa ${event.iteration}${event.valid ? ' ✓' : '...'}`
              );
              break;

            case 'slide_complete':
              // Add slide to ReactFlow canvas
              const id = `node_${Date.now()}_${event.slideIndex}`;
              const slideTitle = macroNodes[event.slideIndex]?.title || `Slide ${event.slideIndex + 1}`;
              
              const newNode = {
                id,
                type: 'custom',
                position: {
                  x: 100 + (event.slideIndex % 4) * 350,
                  y: 100 + Math.floor(event.slideIndex / 4) * 250,
                },
                data: {
                  type: 'custom',
                  label: slideTitle,
                  layout: JSON.stringify(event.craftJson),
                },
              };

              addNode(newNode);

              setCompletedSlides((prev) => [
                ...prev,
                { title: slideTitle, index: event.slideIndex },
              ]);
              setStatusMessage(`Slide ${event.slideIndex + 1} concluído: ${slideTitle}`);
              break;

            case 'complete':
              setStatusMessage('Deck gerado com sucesso!');
              setIsComplete(true);
              
              // Fit view to show all slides
              setTimeout(() => {
                if (rfInstance) {
                  rfInstance.fitView({ padding: 0.2, duration: 800 });
                }
              }, 300);

              // Auto-close after 2 seconds
              setTimeout(() => {
                onComplete();
              }, 2000);
              break;

            case 'error':
              setError(event.message);
              setStatusMessage('Erro na geração');
              break;
          }
        },
        onError: (err) => {
          console.error('Subscription error:', err);
          setError(err.message || 'Falha na conexão com o servidor');
          setStatusMessage('Erro na geração');
        },
      }
    );

    setSubscription(sub);

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [macroNodes, addNode, rfInstance, onComplete]);

  const handleCancel = () => {
    if (subscription) {
      subscription.unsubscribe();
    }
    onCancel();
  };

  const handleRetry = () => {
    setError(null);
    setCompletedSlides([]);
    setIsComplete(false);
    setStatusMessage('Reiniciando geração...');
    
    // Re-trigger generation by unmounting and remounting
    window.location.reload();
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200 animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-indigo-900">Gerando Deck</h3>
          <p className="text-xs text-indigo-600 mt-0.5">
            {completedSlides.length} / {macroNodes.length} slides
          </p>
        </div>
        {!isComplete && !error && (
          <button
            onClick={handleCancel}
            className="text-indigo-400 hover:text-indigo-600 transition-colors"
            title="Cancelar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Status Message */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-white/60 rounded-lg">
        {!error && !isComplete && (
          <Loader2 className="animate-spin text-indigo-600 shrink-0" size={16} />
        )}
        {isComplete && (
          <CheckCircle2 className="text-green-600 shrink-0" size={16} />
        )}
        {error && (
          <XCircle className="text-red-600 shrink-0" size={16} />
        )}
        <p className={cn(
          "text-xs font-medium",
          error ? "text-red-600" : isComplete ? "text-green-600" : "text-gray-700"
        )}>
          {statusMessage}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-800 mb-2">{error}</p>
          <button
            onClick={handleRetry}
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {!error && !isComplete && (
        <div className="mb-3">
          <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-500 ease-out"
              style={{
                width: `${(completedSlides.length / macroNodes.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Completed Slides List (compact) */}
      {completedSlides.length > 0 && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {completedSlides.map((slide) => (
            <div
              key={slide.index}
              className="flex items-center gap-2 p-2 bg-white/60 rounded-lg text-xs animate-in slide-in-from-left duration-200"
            >
              <CheckCircle2 className="text-green-600 shrink-0" size={12} />
              <span className="flex-1 truncate text-gray-900 font-medium">
                {slide.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
