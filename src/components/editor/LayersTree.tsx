import React, { useState, useRef, useContext, createContext, useEffect } from 'react';
import { useEditor, Element } from '@craftjs/core';
import {
    Layout,
    Type,
    StretchVertical,
    Image as ImageIcon,
    Box,
    Layers as LayersIcon,
    ChevronRight,
    ChevronDown,
    Eye,
    EyeOff,
    GripVertical,
    Star,
    Pencil,
    Copy,
    Clipboard,
} from 'lucide-react';
import { setClipboard, getClipboard, hasClipboard, cloneNodeTree } from '../../lib/clipboard';
import { Container } from './selectors/Container';
import { Text } from './selectors/Text';
import { Image } from './selectors/Image';
import { Title } from './selectors/Title';
import { Icon as IconComponent } from './selectors/Icon';

// ─── Tipos ──────────────────────────────────────────────────────────────────
type DropPosition = 'before' | 'inside' | 'after';

interface DropTarget {
    id: string;
    position: DropPosition;
}

interface ContextMenuState {
    nodeId: string;
    x: number;
    y: number;
}

// ─── Context ─────────────────────────────────────────────────────────────────
interface TreeDragContextType {
    draggedNodeId: string | null;
    draggedIdRef: React.RefObject<string | null>;
    dropTarget: DropTarget | null;
    setDropTarget: (t: DropTarget | null) => void;
    openContextMenu: (nodeId: string, x: number, y: number) => void;
    renamingNodeId: string | null;
    setRenamingNodeId: (id: string | null) => void;
}
const TreeDragContext = createContext<TreeDragContextType>({
    draggedNodeId: null,
    draggedIdRef: { current: null },
    dropTarget: null,
    setDropTarget: () => {},
    openContextMenu: () => {},
    renamingNodeId: null,
    setRenamingNodeId: () => {},
});

// ─── Ícone do componente ─────────────────────────────────────────────────────
const ComponentIcon = ({ name, size = 12 }: { name: string; size?: number }) => {
    switch (name) {
        case 'Container': return <Layout size={size} />;
        case 'Title':     return <Type size={size} />;
        case 'Text':      return <StretchVertical size={size} />;
        case 'Image':     return <ImageIcon size={size} />;
        case 'Icon':      return <Star size={size} />;
        default:          return <Box size={size} />;
    }
};

// ─── Calcula zona de drop pelo Y relativo ────────────────────────────────────
function computeDropPosition(e: React.DragEvent, canReceiveChildren: boolean): DropPosition {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pct  = (e.clientY - rect.top) / rect.height;
    if (canReceiveChildren) {
        if (pct < 0.33) return 'before';
        if (pct > 0.67) return 'after';
        return 'inside';
    }
    return pct < 0.5 ? 'before' : 'after';
}

// ─── Context Menu Popup ───────────────────────────────────────────────────────
const ADDABLE_TYPES = ['Container', 'Title', 'Text', 'Image', 'Icon'] as const;

const ContextMenuPopup = ({
    nodeId, x, y, onClose,
}: { nodeId: string; x: number; y: number; onClose: () => void }) => {
    const { actions, query } = useEditor();
    const { setRenamingNodeId } = useContext(TreeDragContext);
    const menuRef = useRef<HTMLDivElement>(null);

    const node = query.node(nodeId).get();
    const isCanvas = node?.data.isCanvas;

    // Fecha ao clicar fora
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        // Pequeno delay para não fechar imediatamente pelo mesmo clique que abriu
        const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
        return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
    }, [onClose]);

    // Ajusta posição para não sair da viewport
    const [pos, setPos] = useState({ x, y });
    useEffect(() => {
        if (!menuRef.current) return;
        const { width, height } = menuRef.current.getBoundingClientRect();
        setPos({
            x: Math.min(x, window.innerWidth  - width  - 8),
            y: Math.min(y, window.innerHeight - height - 8),
        });
    }, [x, y]);

    const addComponent = (type: typeof ADDABLE_TYPES[number]) => {
        try {
            let element: React.ReactElement;
            switch (type) {
                case 'Container': element = <Container padding={20} />; break;
                case 'Title':     element = <Title text="New Title" />; break;
                case 'Text':      element = <Text text="New Text" />; break;
                case 'Image':     element = <Image />; break;
                case 'Icon':      element = <IconComponent name="Star" />; break;
            }
            const tree = query.parseReactElement(element).toNodeTree();
            actions.addNodeTree(tree, nodeId);
        } catch (err) {
            console.warn('[LayersTree] Add failed:', err);
        }
        onClose();
    };

    const clipboardHasContent = hasClipboard();

    const handleCopy = () => {
        try {
            const tree = query.node(nodeId).toNodeTree();
            setClipboard(tree);
        } catch (err) {
            console.warn('[LayersTree] Copy failed:', err);
        }
        onClose();
    };

    const handlePaste = () => {
        const tree = getClipboard();
        if (!tree) return;
        try {
            if (isCanvas) {
                actions.addNodeTree(tree, nodeId);
            } else {
                const parentId = node?.data.parent;
                if (parentId) {
                    const siblings: string[] = query.node(parentId).get().data.nodes ?? [];
                    const idx = siblings.indexOf(nodeId);
                    actions.addNodeTree(tree, parentId, idx + 1);
                }
            }
        } catch (err) {
            console.warn('[LayersTree] Paste failed:', err);
        }
        onClose();
    };

    const handleDuplicate = () => {
        try {
            const parentId = node?.data.parent;
            if (parentId) {
                const tree = query.node(nodeId).toNodeTree();
                const cloned = cloneNodeTree(tree);
                const siblings: string[] = query.node(parentId).get().data.nodes ?? [];
                const idx = siblings.indexOf(nodeId);
                actions.addNodeTree(cloned, parentId, idx + 1);
            }
        } catch (err) {
            console.warn('[LayersTree] Duplicate failed:', err);
        }
        onClose();
    };

    const handleRename = () => {
        setRenamingNodeId(nodeId);
        onClose();
    };

    return (
        <div
            ref={menuRef}
            className="fixed z-[300] bg-white border border-[#E5E5E5] rounded-lg shadow-2xl py-1 min-w-[168px] text-[11px]"
            style={{ left: pos.x, top: pos.y }}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Adicionar dentro (só containers) */}
            {isCanvas && (
                <>
                    <div className="px-3 pt-1.5 pb-0.5 text-[9px] font-bold text-[#BBBFCA] uppercase tracking-widest">
                        Adicionar dentro
                    </div>
                    {ADDABLE_TYPES.map(type => (
                        <button
                            key={type}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#F2F2F2] text-[#495464] flex items-center gap-2 transition-colors"
                            onClick={() => addComponent(type)}
                        >
                            <ComponentIcon name={type} size={11} />
                            {type}
                        </button>
                    ))}
                    <div className="border-t border-[#F0F0F0] my-1" />
                </>
            )}

            {/* Copy / Paste / Duplicate */}
            <button
                className="w-full text-left px-3 py-1.5 hover:bg-[#F2F2F2] text-[#495464] flex items-center gap-2 transition-colors"
                onClick={handleCopy}
            >
                <Copy size={11} />
                Copiar
            </button>
            {clipboardHasContent && (
                <button
                    className="w-full text-left px-3 py-1.5 hover:bg-[#F2F2F2] text-[#495464] flex items-center gap-2 transition-colors"
                    onClick={handlePaste}
                >
                    <Clipboard size={11} />
                    Colar aqui
                </button>
            )}
            <button
                className="w-full text-left px-3 py-1.5 hover:bg-[#F2F2F2] text-[#495464] flex items-center gap-2 transition-colors"
                onClick={handleDuplicate}
            >
                <Copy size={11} />
                Duplicar
            </button>

            <div className="border-t border-[#F0F0F0] my-1" />

            {/* Renomear */}
            <button
                className="w-full text-left px-3 py-1.5 hover:bg-[#F2F2F2] text-[#495464] flex items-center gap-2 transition-colors"
                onClick={handleRename}
            >
                <Pencil size={11} />
                Renomear
            </button>
        </div>
    );
};

// ─── Nó da árvore ────────────────────────────────────────────────────────────
const TreeNode = ({ id, depth = 0 }: { id: string; depth?: number }) => {
    const { actions, connectors, query, selected, node } = useEditor((state) => ({
        selected: state.events.selected.has(id),
        node: state.nodes[id],
    }));

    const {
        draggedNodeId, draggedIdRef,
        dropTarget, setDropTarget,
        openContextMenu,
        renamingNodeId, setRenamingNodeId,
    } = useContext(TreeDragContext);

    const isRoot = id === 'ROOT';
    const [expanded, setExpanded] = useState(true);
    const renameInputRef = useRef<HTMLInputElement>(null);

    // Foca o input quando entrar no modo rename
    useEffect(() => {
        if (renamingNodeId === id) renameInputRef.current?.select();
    }, [renamingNodeId, id]);

    if (!node) return null;

    const { name, nodes, isCanvas, custom } = node.data;
    const hasChildren       = nodes && nodes.length > 0;
    const isHidden          = custom?.hidden || false;
    const isBeingDragged    = draggedNodeId === id;
    const canReceiveChildren = isCanvas;
    const isRenaming        = renamingNodeId === id;
    const displayLabel      = custom?.label || name;

    const activePos: DropPosition | null =
        dropTarget?.id === id && !isBeingDragged ? dropTarget.position : null;

    // ── Rename ───────────────────────────────────────────────────────────────
    const commitRename = (value: string) => {
        const newLabel = value.trim() || name;
        actions.setCustom(id, (c: Record<string, any>) => { c.label = newLabel; });
        setRenamingNodeId(null);
    };

    const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (e.key === 'Enter')  commitRename(e.currentTarget.value);
        if (e.key === 'Escape') setRenamingNodeId(null);
    };

    // ── Context menu ─────────────────────────────────────────────────────────
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isRoot) return;
        openContextMenu(id, e.clientX, e.clientY);
    };

    // ── Drag source ──────────────────────────────────────────────────────────
    const handleDragStart = () => { draggedIdRef.current = id; };
    const handleDragEnd   = () => { draggedIdRef.current = null; setDropTarget(null); };

    // ── Drop target ──────────────────────────────────────────────────────────
    const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        const draggedId = draggedIdRef.current;
        if (!draggedId || draggedId === id || isRoot) return;
        const position = computeDropPosition(e, canReceiveChildren);
        if (dropTarget?.id !== id || dropTarget?.position !== position) {
            setDropTarget({ id, position });
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (dropTarget?.id !== id) return;
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDropTarget(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const draggedId = draggedIdRef.current;
        if (!draggedId || draggedId === id || !dropTarget || dropTarget.id !== id) {
            setDropTarget(null);
            return;
        }
        try {
            const pos = dropTarget.position;
            if (pos === 'inside' && canReceiveChildren) {
                actions.move(draggedId, id, nodes?.length ?? 0);
            } else {
                const parentId = node.data.parent;
                if (parentId) {
                    const siblings: string[] = query.node(parentId).get().data.nodes ?? [];
                    const idx = siblings.indexOf(id);
                    actions.move(draggedId, parentId, Math.max(0, pos === 'after' ? idx + 1 : idx));
                }
            }
        } catch (err) {
            console.warn('[LayersTree] Move failed:', err);
        }
        draggedIdRef.current = null;
        setDropTarget(null);
    };

    // ── Classes visuais ──────────────────────────────────────────────────────
    const rowClasses = [
        'relative flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-all group text-[11px] mb-[1px]',
        selected && activePos !== 'inside'  ? 'bg-[#495464] text-white shadow-sm'  : '',
        !selected && activePos !== 'inside' ? 'hover:bg-[#F2F2F2] text-[#495464]' : '',
        isBeingDragged                      ? 'opacity-40'                          : '',
        activePos === 'inside'              ? 'outline outline-2 outline-[#0D99FF] bg-blue-50 text-[#495464]' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className="flex flex-col">
            <div
                className={rowClasses}
                style={{ paddingLeft: `${depth * 10 + 8}px` }}
                onClick={(e) => { e.stopPropagation(); if (!isRenaming) actions.selectNode(id); }}
                onContextMenu={handleContextMenu}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Indicadores de posição before/after */}
                {activePos === 'before' && (
                    <span className="pointer-events-none absolute inset-x-1 -top-px h-0.5 rounded-full bg-[#0D99FF]" />
                )}
                {activePos === 'after' && (
                    <span className="pointer-events-none absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-[#0D99FF]" />
                )}

                {/* Drag Handle */}
                {!isRoot && (
                    <div
                        ref={(ref: any) => ref && connectors.drag(ref, id)}
                        className={`w-3 h-4 flex items-center justify-center opacity-0 group-hover:opacity-40 hover:!opacity-100 cursor-grab active:cursor-grabbing shrink-0 transition-opacity ${selected ? 'text-white' : 'text-[#888888]'}`}
                        onClick={(e) => e.stopPropagation()}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <GripVertical size={10} />
                    </div>
                )}

                {/* Toggle expandir/recolher */}
                <div
                    className="w-4 h-4 flex items-center justify-center opacity-50 hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                >
                    {hasChildren ? (
                        expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />
                    ) : (
                        <div className="w-1 h-1 rounded-full bg-current opacity-20" />
                    )}
                </div>

                <div className={`shrink-0 ${selected ? 'text-white' : 'text-[#888888]'}`}>
                    <ComponentIcon name={name} size={12} />
                </div>

                {/* Label ou input de rename */}
                {isRenaming ? (
                    <input
                        ref={renameInputRef}
                        className="flex-1 bg-white border border-[#0D99FF] rounded px-1 py-0 text-[11px] text-[#333] outline-none min-w-0"
                        defaultValue={displayLabel}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={(e) => commitRename(e.target.value)}
                        onKeyDown={handleRenameKeyDown}
                    />
                ) : (
                    <span
                        className={`truncate flex-1 ${selected ? 'font-bold' : 'font-semibold'}`}
                        onDoubleClick={(e) => { e.stopPropagation(); if (!isRoot) setRenamingNodeId(id); }}
                    >
                        {displayLabel}
                    </span>
                )}

                {/* Botão olho (visibilidade) */}
                {!isRenaming && (
                    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${selected ? 'text-white' : 'text-[#BBBFCA]'}`}>
                        <button className="p-0.5 hover:bg-white/20 rounded">
                            {isHidden ? <EyeOff size={10} /> : <Eye size={10} />}
                        </button>
                    </div>
                )}
            </div>

            {expanded && hasChildren && (
                <div className="flex flex-col">
                    {nodes.map((childId: string) => (
                        <TreeNode key={childId} id={childId} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Árvore principal ─────────────────────────────────────────────────────────
export const LayersTree = () => {
    const { enabled, draggedNodeId } = useEditor((state) => ({
        enabled: state.options.enabled,
        draggedNodeId: state.events.dragged?.size > 0
            ? [...state.events.dragged][0]
            : null,
    }));

    const draggedIdRef                        = useRef<string | null>(null);
    const [dropTarget, setDropTarget]         = useState<DropTarget | null>(null);
    const [contextMenu, setContextMenu]       = useState<ContextMenuState | null>(null);
    const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);

    useEffect(() => {
        if (!draggedNodeId) {
            draggedIdRef.current = null;
            setDropTarget(null);
        }
    }, [draggedNodeId]);

    const openContextMenu = (nodeId: string, x: number, y: number) =>
        setContextMenu({ nodeId, x, y });

    if (!enabled) return null;

    return (
        <TreeDragContext.Provider value={{
            draggedNodeId, draggedIdRef,
            dropTarget, setDropTarget,
            openContextMenu,
            renamingNodeId, setRenamingNodeId,
        }}>
            <div className="flex flex-col h-full bg-white animate-in slide-in-from-left duration-200">
                <div className="p-4 border-b border-[#E8E8E8] shrink-0">
                    <h4 className="flex items-center gap-2 text-[11px] font-black text-[#495464] uppercase tracking-wider">
                        <LayersIcon size={14} /> Slide Layers
                    </h4>
                    <div className="mt-2">
                        <span className="text-[10px] text-[#BBBFCA] font-medium uppercase tracking-tighter">Structure</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                    <TreeNode id="ROOT" />
                </div>

                <div className="p-3 border-t border-[#E8E8E8] bg-gray-50/50 shrink-0">
                    <span className="text-[9px] font-bold text-[#BBBFCA] uppercase mb-2 block tracking-widest">Quick Add (Drag to Slide/Tree)</span>
                    <div className="flex items-center gap-2 py-1">
                        <QuickAddButton type="Container" icon={<Layout size={12} />} component={<Element is={Container} canvas flex={1} padding={20} />} />
                        <QuickAddButton type="Text"      icon={<Type size={12} />}   component={<Text text="New Text" />} />
                        <QuickAddButton type="Title"     icon={<StretchVertical size={12} />} component={<Title text="New Title" />} />
                        <QuickAddButton type="Image"     icon={<ImageIcon size={12} />} component={<Image />} />
                    </div>
                </div>
            </div>

            {/* Context menu — renderizado fora do scroll para não ser clipado */}
            {contextMenu && (
                <ContextMenuPopup
                    nodeId={contextMenu.nodeId}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </TreeDragContext.Provider>
    );
};

// ─── Botão de adição rápida ───────────────────────────────────────────────────
const QuickAddButton = ({ type, icon, component }: { type: string, icon: React.ReactNode, component: React.ReactElement }) => {
    const { connectors: { create } } = useEditor();
    return (
        <div
            ref={(ref: any) => ref && create(ref, component)}
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#E5E5E5] text-[#495464] rounded-md hover:border-[#0D99FF] hover:text-[#0D99FF] cursor-grab shadow-sm transition-all shrink-0"
            title={`Drag into tree or slide to add ${type}`}
        >
            {icon}
        </div>
    );
};
