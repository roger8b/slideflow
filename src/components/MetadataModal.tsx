import React, { useState } from 'react';
import { X, Save, Info } from 'lucide-react';
import { cn } from '../constants';

interface MetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, author: string, baseFontSize: number) => void;
  initialTitle?: string;
  initialAuthor?: string;
  initialBaseFontSize?: number;
}

import { motion, AnimatePresence } from 'motion/react';

export const MetadataModal: React.FC<MetadataModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTitle = '',
  initialAuthor = '',
  initialBaseFontSize = 32,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState(initialAuthor);
  const [baseFontSize, setBaseFontSize] = useState(initialBaseFontSize);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-full max-w-sm border border-[#E5E5E5]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#333333] text-white rounded">
              <Info size={14} />
            </div>
            <h2 className="text-[13px] font-bold text-[#333333] tracking-tight">Presentation Info</h2>
          </div>
          <button onClick={onClose} className="text-[#888888] hover:text-[#333333] hover:bg-gray-100 p-1 rounded-md transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-medium text-[#888888] uppercase tracking-widest mb-1">Presentation Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-[#E5E5E5] bg-white focus:outline-none focus:ring-1 focus:ring-[#0D99FF] text-[12px] text-[#333333] font-medium placeholder:text-gray-300"
              placeholder="My Awesome Presentation"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#888888] uppercase tracking-widest mb-1">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-[#E5E5E5] bg-white focus:outline-none focus:ring-1 focus:ring-[#0D99FF] text-[12px] text-[#333333] font-medium placeholder:text-gray-300"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#888888] uppercase tracking-widest mb-1">Base Font Size (px)</label>
            <input
              type="number"
              value={baseFontSize}
              onChange={(e) => setBaseFontSize(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-md border border-[#E5E5E5] bg-white focus:outline-none focus:ring-1 focus:ring-[#0D99FF] text-[12px] text-[#333333] font-medium"
            />
          </div>
        </div>

            <div className="mt-6 flex items-center gap-2">
              <button
                onClick={() => onSave(title, author, baseFontSize)}
                className="flex-1 py-1.5 rounded-md bg-[#0D99FF] text-white hover:bg-blue-600 transition-all font-semibold text-[11px] flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                <Save size={14} />
                Save Presentation
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-md border border-[#E5E5E5] text-[#333333] hover:bg-gray-50 transition-colors font-medium text-[11px]"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
