import React from 'react';
import { Panel } from 'reactflow';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { cn } from '../../constants';
import { SlideNode } from '../../types';

interface CanvasToolbarProps {
  nodes: SlideNode[];
  addNode: () => void;
  deleteNode: (id: string) => void;
  onEditNode: (id: string) => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  nodes,
  addNode,
  deleteNode,
  onEditNode
}) => {
  const isSelected = nodes.some(n => n.selected);
  const selectedNode = nodes.find(n => n.selected);

  return (
    <Panel position="bottom-center" className="mb-6">
      <div className="bg-white px-2 py-1.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#E5E5E5] flex items-center gap-1">
        <button
          onClick={addNode}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-[#333333] rounded-xl transition-all text-xs font-bold active:scale-95"
        >
          <Plus size={18} className="text-[#0D99FF]" strokeWidth={2.5} /> Adicionar Slide
        </button>

        <div className="w-px h-6 bg-[#E5E5E5] mx-1" />

        <button
          onClick={() => {
            if (selectedNode) {
              onEditNode(selectedNode.id);
            }
          }}
          disabled={!isSelected}
          className={cn(
            "p-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 text-xs font-bold",
            isSelected ? "hover:bg-gray-100 text-[#333333]" : "opacity-30 cursor-not-allowed text-[#BBBFCA]"
          )}
          title="Edit Selected Slide"
        >
          <Edit3 size={18} strokeWidth={2} /> Editar
        </button>
        <button
          onClick={() => {
            if (selectedNode) {
              deleteNode(selectedNode.id);
            }
          }}
          disabled={!isSelected}
          className={cn(
            "p-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 text-xs font-bold",
            isSelected ? "hover:bg-red-50 text-red-500" : "opacity-30 cursor-not-allowed text-[#BBBFCA]"
          )}
          title="Delete Selected Slide"
        >
          <Trash2 size={18} strokeWidth={2} /> Excluir
        </button>
      </div>
    </Panel>
  );
};
