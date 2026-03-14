export interface SavedBlock {
    id: string;
    name: string;
    tree: any; // Craft.js serialized node tree
    createdAt: string;
}

const STORAGE_KEY = 'slideflow_saved_blocks';

export const getSavedBlocks = (): SavedBlock[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to parse saved blocks', error);
        return [];
    }
};

export const saveBlock = (name: string, tree: any): SavedBlock => {
    const blocks = getSavedBlocks();
    const newBlock: SavedBlock = {
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        tree,
        createdAt: new Date().toISOString()
    };

    blocks.push(newBlock);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));

    // Dispatch event so SidebarPalette can update
    window.dispatchEvent(new Event('savedBlocksUpdated'));

    return newBlock;
};

export const deleteSavedBlock = (id: string) => {
    const blocks = getSavedBlocks();
    const filtered = blocks.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('savedBlocksUpdated'));
};
