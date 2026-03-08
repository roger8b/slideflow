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
      <div className="bg-[#F4F4F2] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-[#BBBFCA]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#495464] text-white rounded-lg">
              <Info size={20} />
            </div>
            <h2 className="text-2xl font-black text-[#495464] uppercase tracking-tighter">Presentation Info</h2>
          </div>
          <button onClick={onClose} className="text-[#495464] hover:bg-[#E8E8E8] p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-[#BBBFCA] uppercase tracking-widest mb-1.5">Presentation Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#BBBFCA] bg-white focus:outline-none focus:ring-2 focus:ring-[#495464] text-[#495464] font-medium"
              placeholder="My Awesome Presentation"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#BBBFCA] uppercase tracking-widest mb-1.5">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#BBBFCA] bg-white focus:outline-none focus:ring-2 focus:ring-[#495464] text-[#495464] font-medium"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#BBBFCA] uppercase tracking-widest mb-1.5">Base Font Size (px)</label>
            <input
              type="number"
              value={baseFontSize}
              onChange={(e) => setBaseFontSize(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#BBBFCA] bg-white focus:outline-none focus:ring-2 focus:ring-[#495464] text-[#495464] font-medium"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => onSave(title, author, baseFontSize)}
            className="w-full py-3 rounded-xl bg-[#495464] text-white hover:bg-[#3a4350] transition-all font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95"
          >
            <Save size={18} />
            Save Presentation
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-[#BBBFCA] hover:text-[#495464] transition-colors font-bold text-sm uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
