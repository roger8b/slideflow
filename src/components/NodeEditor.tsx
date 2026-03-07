import React, { useState } from 'react';
import { X, Type, Image as ImageIcon, Video, Check } from 'lucide-react';
import { NodeType } from '../types';
import { cn } from '../constants';

interface NodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { type: NodeType; content?: string; mediaBase64?: string; mediaName?: string }) => void;
  initialData?: { type: NodeType; content?: string; mediaBase64?: string; mediaName?: string };
}

export const NodeEditor: React.FC<NodeEditorProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [type, setType] = useState<NodeType>(initialData?.type || 'text');
  const [content, setContent] = useState(initialData?.content || '');
  const [mediaBase64, setMediaBase64] = useState(initialData?.mediaBase64 || '');
  const [mediaName, setMediaName] = useState(initialData?.mediaName || '');
  const [isConverting, setIsConverting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      console.warn('File is too large! Maximum size is 50MB.');
      return;
    }

    // Large video warning removed or handled silently for now to avoid iframe issues


    setIsConverting(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaBase64(reader.result as string);
      setMediaName(file.name);
      setIsConverting(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#F4F4F2] p-6 rounded-2xl shadow-2xl w-full max-w-2xl border border-[#BBBFCA] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#495464]">Edit Node</h2>
          <button onClick={onClose} className="text-[#495464] hover:bg-[#E8E8E8] p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          {(['text', 'image', 'video'] as NodeType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "flex-1 py-3 rounded-xl flex flex-col items-center gap-2 border-2 transition-all",
                type === t 
                  ? "bg-[#495464] text-white border-[#495464]" 
                  : "bg-white text-[#495464] border-[#BBBFCA] hover:border-[#495464]"
              )}
            >
              {t === 'text' && <Type size={24} />}
              {t === 'image' && <ImageIcon size={24} />}
              {t === 'video' && <Video size={24} />}
              <span className="capitalize font-semibold">{t}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {type === 'text' && (
            <div>
              <label className="block text-sm font-semibold text-[#495464] mb-1">Markdown Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-64 px-4 py-3 rounded-xl border border-[#BBBFCA] bg-white focus:outline-none focus:ring-2 focus:ring-[#495464] text-[#495464] font-mono"
                placeholder="# Title\n\n- List item\n- **Bold text**"
              />
            </div>
          )}

          {(type === 'image' || type === 'video') && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#BBBFCA] rounded-xl p-8 text-center bg-white">
                {mediaBase64 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-[#495464] font-medium truncate">{mediaName}</div>
                    {type === 'image' ? (
                      <img src={mediaBase64} className="max-h-48 mx-auto rounded shadow-sm" alt="Preview" />
                    ) : (
                      <video src={mediaBase64} className="max-h-48 mx-auto rounded shadow-sm" controls />
                    )}
                    <button 
                      onClick={() => { setMediaBase64(''); setMediaName(''); }}
                      className="text-red-500 text-sm font-semibold hover:underline"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[#495464] font-medium">
                      {isConverting ? 'Converting...' : `Select ${type} file`}
                    </div>
                    <input
                      type="file"
                      accept={type === 'image' ? "image/*" : "video/*"}
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      disabled={isConverting}
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-6 py-2 bg-[#495464] text-white rounded-lg cursor-pointer hover:bg-[#3a4350] transition-colors"
                    >
                      Browse Files
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-[#495464] hover:bg-[#E8E8E8] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ type, content, mediaBase64, mediaName })}
            disabled={isConverting}
            className="px-6 py-2 rounded-lg bg-[#495464] text-white hover:bg-[#3a4350] transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Check size={18} />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
