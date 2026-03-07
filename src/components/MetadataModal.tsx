import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface MetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, author: string, baseFontSize: number) => void;
  initialTitle?: string;
  initialAuthor?: string;
  initialBaseFontSize?: number;
}

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#F4F4F2] p-6 rounded-2xl shadow-2xl w-full max-w-md border border-[#BBBFCA]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#495464]">Presentation Details</h2>
          <button onClick={onClose} className="text-[#495464] hover:bg-[#E8E8E8] p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#495464] mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#BBBFCA] bg-white focus:outline-none focus:ring-2 focus:ring-[#495464] text-[#495464]"
              placeholder="My Awesome Presentation"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#495464] mb-1">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#BBBFCA] bg-white focus:outline-none focus:ring-2 focus:ring-[#495464] text-[#495464]"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#495464] mb-1">Base Resolution (Font Size)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="12"
                max="96"
                value={baseFontSize}
                onChange={(e) => setBaseFontSize(parseInt(e.target.value))}
                className="flex-1 h-2 bg-[#BBBFCA] rounded-lg appearance-none cursor-pointer accent-[#495464]"
              />
              <span className="text-sm font-mono w-12 text-right text-[#495464]">{baseFontSize}px</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-[#495464] hover:bg-[#E8E8E8] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(title, author, baseFontSize)}
            className="px-6 py-2 rounded-lg bg-[#495464] text-white hover:bg-[#3a4350] transition-colors font-medium flex items-center gap-2"
          >
            <Save size={18} />
            Save Presentation
          </button>
        </div>
      </div>
    </div>
  );
};
