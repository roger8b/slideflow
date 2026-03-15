import React from 'react';
import { Panel, Edge } from 'reactflow';
import { motion } from 'motion/react';
import { cn } from '../../constants';

interface BifurcationOverlayProps {
  outgoingEdges: Edge[];
  selectedBranchIndex: number;
  navigateTo: (id: string) => void;
}

export const BifurcationOverlay: React.FC<BifurcationOverlayProps> = ({
  outgoingEdges,
  selectedBranchIndex,
  navigateTo
}) => {
  return (
    <Panel position="top-center" className="mt-20">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white px-6 py-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#E5E5E5] flex items-center gap-4"
      >
        <span className="text-xs font-bold text-[#888888] uppercase tracking-wider">Escolha seu caminho:</span>
        <div className="flex gap-2">
          {outgoingEdges.map((edge, idx) => (
            <button
              key={edge.id}
              onClick={() => navigateTo(edge.target)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 shadow-sm border",
                idx === selectedBranchIndex
                  ? "bg-[#0D99FF] text-white border-[#0D99FF]"
                  : "bg-white text-[#0D99FF] border-[#B6DCFF] hover:bg-blue-50"
              )}
            >
              Caminho {idx + 1}
            </button>
          ))}
        </div>
      </motion.div>
    </Panel>
  );
};
