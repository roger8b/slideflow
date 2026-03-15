import React from 'react';
import { Panel } from 'reactflow';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { SlideNode } from '../../types';

interface PlayerNavigationProps {
  nodes: SlideNode[];
  currentNodeId: string | null;
  navigationHistory: string[];
  nextNodeId: string | null;
  isBifurcation: boolean;
  navigateBack: () => void;
  navigateTo: (id: string) => void;
  exitPresentation: () => void;
}

export const PlayerNavigation: React.FC<PlayerNavigationProps> = ({
  nodes,
  currentNodeId,
  navigationHistory,
  nextNodeId,
  isBifurcation,
  navigateBack,
  navigateTo,
  exitPresentation
}) => {
  return (
    <Panel position="bottom-center" className="mb-8">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-white px-3 py-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#E5E5E5] flex items-center gap-4"
      >
        <button
          onClick={navigateBack}
          disabled={navigationHistory.length <= 1}
          className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95 text-[#333333]"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>

        <div className="flex flex-col items-center px-4">
          <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mb-0.5">Slide</span>
          <span className="text-lg font-black text-[#333333] tabular-nums">
            {nodes.findIndex(n => n.id === currentNodeId) + 1} <span className="text-[#BBBFCA] font-medium mx-1">/</span> {nodes.length}
          </span>
        </div>

        <button
          onClick={() => nextNodeId && navigateTo(nextNodeId)}
          disabled={!nextNodeId || isBifurcation}
          className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95 text-[#333333]"
        >
          <ChevronRight size={24} strokeWidth={2.5} />
        </button>

        <div className="w-px h-8 bg-[#E5E5E5] mx-2" />

        <button
          onClick={exitPresentation}
          className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F5] text-[#333333] hover:bg-[#E5E5E5] rounded-xl transition-all font-bold text-xs active:scale-95"
        >
          <X size={16} strokeWidth={2.5} /> Sair
        </button>
      </motion.div>
    </Panel>
  );
};
