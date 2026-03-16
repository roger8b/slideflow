import React from 'react';
import { Play, Save, Upload } from 'lucide-react';
import { PresentationMetadata } from '../../types';

interface HeaderProps {
  metadata: PresentationMetadata;
  setIsMetadataOpen: (isOpen: boolean) => void;
  loadPresentation: (event: React.ChangeEvent<HTMLInputElement>) => void;
  startPresentation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metadata,
  setIsMetadataOpen,
  loadPresentation,
  startPresentation,
}) => {
  return (
    <header className="h-14 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-6 z-10 transition-all shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0D99FF] to-[#007ACC] shadow-md border border-white/20">
          {metadata.brand?.logoUrl ? (
            <img src={metadata.brand.logoUrl} alt="Logo" className="w-full h-full object-contain p-1.5 bg-white" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <span className="font-black text-xs">SF</span>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-[13px] leading-tight text-[#333333] tracking-tight">{metadata.title}</h1>
            <div className="px-1.5 py-0.5 bg-blue-50 text-[#0D99FF] text-[9px] font-bold rounded uppercase tracking-wider">Draft</div>
          </div>
          <p className="text-[10px] text-[#888888] font-medium tracking-wide">Publicado por {metadata.author}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsMetadataOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 text-[#333333] rounded-xl transition-all text-xs font-bold active:scale-95 border border-transparent hover:border-[#E5E5E5]"
          title="Configurações da Apresentação"
        >
          <Save size={16} className="text-[#888888]" /> Salvar
        </button>
        <label className="flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 text-[#333333] rounded-xl transition-all text-xs font-bold cursor-pointer active:scale-95 border border-transparent hover:border-[#E5E5E5]" title="Carregar Projeto">
          <Upload size={16} className="text-[#888888]" /> Carregar
          <input type="file" accept=".json" onChange={loadPresentation} className="hidden" />
        </label>
        <div className="w-px h-8 bg-[#E5E5E5] mx-2" />
        <button
          onClick={startPresentation}
          className="flex items-center gap-2 px-6 py-2 bg-[#0D99FF] text-white hover:bg-blue-600 rounded-xl transition-all font-bold text-xs shadow-[0_4px_12px_rgba(13,153,255,0.3)] active:scale-95"
        >
          <Play size={14} fill="currentColor" /> Apresentar
        </button>
      </div>
    </header>
  );
};
