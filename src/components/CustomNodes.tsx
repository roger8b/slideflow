import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { SlideNodeData } from '../types';
import { cn } from '../constants';
import { Editor, Frame } from '@craftjs/core';
import { Container } from './editor/selectors/Container';
import { Title } from './editor/selectors/Title';
import { Text } from './editor/selectors/Text';
import { Image } from './editor/selectors/Image';

export const CustomNode = memo(({ data, selected }: NodeProps<SlideNodeData>) => {
  return (
    <div className={cn(
      "shadow-md rounded-md border-2 bg-white w-[960px] h-[540px] flex flex-col overflow-hidden transition-all",
      selected ? "border-blue-500 border-dashed ring-4 ring-blue-500/20" : "border-[#BBBFCA]",
      data.isFocused === false && "opacity-30 grayscale"
    )}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#495464]" />
      <div className="flex-1 overflow-hidden relative">
        {data.layout ? (
          <Editor
            enabled={false}
            resolver={{
              Container,
              Title,
              Text,
              Image,
            }}
          >
            <Frame json={data.layout} />
          </Editor>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#E8E8E8] text-[#495464] font-bold uppercase tracking-widest">
            Empty Layout - Edit to add content
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#495464]" />
    </div>
  );
});
