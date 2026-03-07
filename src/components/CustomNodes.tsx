import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import ReactMarkdown from 'react-markdown';
import { SlideNodeData } from '../types';
import { cn } from '../constants';

export const TextNode = memo(({ data, selected }: NodeProps<SlideNodeData>) => {
  return (
    <div className={cn(
      "px-6 py-4 shadow-md rounded-md border-2 bg-white w-[960px] h-[540px] flex flex-col overflow-hidden transition-all",
      selected ? "border-blue-500 border-dashed ring-4 ring-blue-500/20" : "border-[#BBBFCA]",
      data.isFocused === false && "opacity-30 grayscale"
    )}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#495464]" />
      <div 
        className="prose prose-sm flex-1 overflow-hidden break-words"
        style={{ fontSize: 'var(--slide-font-size, 14px)' }}
      >
        <ReactMarkdown>{data.content || ''}</ReactMarkdown>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#495464]" />
    </div>
  );
});

export const ImageNode = memo(({ data, selected }: NodeProps<SlideNodeData>) => {
  return (
    <div className={cn(
      "p-1 shadow-md rounded-md border-2 bg-white w-[960px] h-[540px] overflow-hidden flex items-center justify-center transition-all",
      selected ? "border-blue-500 border-dashed ring-4 ring-blue-500/20" : "border-[#BBBFCA]",
      data.isFocused === false && "opacity-30 grayscale"
    )}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#495464]" />
      <div className="w-full h-full relative flex items-center justify-center bg-[#E8E8E8] rounded overflow-hidden">
        {data.mediaBase64 ? (
          <img 
            src={data.mediaBase64} 
            alt={data.mediaName || 'Slide Image'} 
            className="max-w-full max-h-full object-contain block"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-[#495464] text-xs font-bold uppercase tracking-widest">
            No Image
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#495464]" />
    </div>
  );
});

export const VideoNode = memo(({ data, selected }: NodeProps<SlideNodeData>) => {
  return (
    <div className={cn(
      "p-1 shadow-md rounded-md border-2 bg-white w-[960px] h-[540px] overflow-hidden flex items-center justify-center transition-all",
      selected ? "border-blue-500 border-dashed ring-4 ring-blue-500/20" : "border-[#BBBFCA]",
      data.isFocused === false && "opacity-30 grayscale"
    )}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#495464]" />
      <div className="w-full h-full relative flex items-center justify-center bg-[#E8E8E8] rounded overflow-hidden">
        {data.mediaBase64 ? (
          <video 
            src={data.mediaBase64} 
            controls 
            className="max-w-full max-h-full object-contain block"
          />
        ) : (
          <div className="text-[#495464] text-xs font-bold uppercase tracking-widest">
            No Video
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#495464]" />
    </div>
  );
});
