let _clipboard: any = null;

const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

/**
 * Deep-clone a Craft.js NodeTree, remapping all internal IDs to fresh ones.
 * Prevents ID collisions when the same tree is pasted multiple times.
 */
export const cloneNodeTree = (tree: any): any => {
    if (!tree?.nodes) return tree;

    const idMap: Record<string, string> = {};
    Object.keys(tree.nodes).forEach(id => { idMap[id] = generateId(); });

    const newNodes: Record<string, any> = {};
    Object.entries(tree.nodes).forEach(([id, node]: [string, any]) => {
        const newId = idMap[id];
        const isRoot = id === tree.rootNodeId;
        newNodes[newId] = {
            ...node,
            id: newId,
            data: {
                ...node.data,
                // Root's parent will be set by addNodeTree; internal parents are remapped
                parent: isRoot ? null : (node.data.parent ? (idMap[node.data.parent] ?? null) : null),
                nodes: (node.data.nodes ?? []).map((c: string) => idMap[c] ?? c),
                linkedNodes: Object.fromEntries(
                    Object.entries(node.data.linkedNodes ?? {}).map(([k, v]) => [k, idMap[v as string] ?? v])
                ),
            },
        };
    });

    return { rootNodeId: idMap[tree.rootNodeId], nodes: newNodes };
};

export const setClipboard = (tree: any): void => {
    _clipboard = tree;
    window.dispatchEvent(new Event('clipboardUpdated'));
};

/** Returns a fresh clone of the clipboard tree (safe to paste multiple times). */
export const getClipboard = (): any => _clipboard ? cloneNodeTree(_clipboard) : null;

export const hasClipboard = (): boolean => _clipboard !== null;
