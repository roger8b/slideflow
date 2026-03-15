import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { SlideNodeData } from '../types';
import { cn } from '../constants';
import { Editor, Frame } from '@craftjs/core';
import { Container } from './editor/selectors/Container';
import { Title } from './editor/selectors/Title';
import { Text } from './editor/selectors/Text';
import { Image } from './editor/selectors/Image';
import { Icon } from './editor/selectors/Icon';

export const CustomNode = memo(({ data, selected }: NodeProps<SlideNodeData>) => {
  return (
    <div className={cn(
      "shadow-[0_1px_4px_rgba(0,0,0,0.1)] rounded-[2px] border bg-white w-[960px] h-[540px] flex flex-col overflow-hidden transition-all duration-200 ease-in-out",
      selected ? "border-[#0D99FF] ring-1 ring-[#0D99FF]" : "border-[#BBBFCA]",
      data.isFocused === false && "opacity-40 grayscale"
    )}>
      {/* Node Label Overlay */}
      <div className="absolute top-[-24px] left-0 text-[10px] font-medium text-[#888888] flex items-center gap-1.5 px-2">
        <span className="bg-[#E5E5E5] px-1 rounded uppercase tracking-tighter">Slide</span>
        <span>{data.label}</span>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-6 rounded-none bg-[#0D99FF] border-none -translate-x-1"
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {data.layout ? (
          <Editor
            key={data.layout}
            enabled={false}
            resolver={{
              Container,
              Title,
              Text,
              Image,
              Icon,
            }}
          >
            <Frame json={data.layout} />
          </Editor>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F9F9F9] text-[#BBBFCA] font-semibold text-2xl uppercase tracking-[0.2em]">
            Empty Slide
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-6 rounded-none bg-[#0D99FF] border-none translate-x-1"
      />
    </div>
  );
});
