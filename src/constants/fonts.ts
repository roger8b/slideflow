export interface FontVariant {
    label: string;
    fontWeight: number;
    fontStyle: 'normal' | 'italic';
}

export interface FontItem {
    name: string;
    value: string;
    category: 'sans-serif' | 'serif' | 'display';
    variants?: FontVariant[];
}

const REGULAR: FontVariant = { label: 'Regular', fontWeight: 400, fontStyle: 'normal' };
const REGULAR_ITALIC: FontVariant = { label: 'Regular Itálico', fontWeight: 400, fontStyle: 'italic' };
const SEMIBOLD: FontVariant = { label: 'Seminegrito', fontWeight: 600, fontStyle: 'normal' };
const BOLD: FontVariant = { label: 'Negrito', fontWeight: 700, fontStyle: 'normal' };
const BOLD_ITALIC: FontVariant = { label: 'Negrito Itálico', fontWeight: 700, fontStyle: 'italic' };

export const FONT_LIBRARY: FontItem[] = [
    // Sans Serif
    {
        name: 'Inter',
        value: 'Inter, sans-serif',
        category: 'sans-serif',
        variants: [REGULAR, REGULAR_ITALIC, SEMIBOLD, BOLD, BOLD_ITALIC],
    },
    {
        name: 'Instrument Sans',
        value: "'Instrument Sans', sans-serif",
        category: 'sans-serif',
        variants: [REGULAR, SEMIBOLD, BOLD],
    },
    {
        name: 'Outfit',
        value: 'Outfit, sans-serif',
        category: 'sans-serif',
        variants: [REGULAR, SEMIBOLD, BOLD],
    },
    {
        name: 'Montserrat',
        value: 'Montserrat, sans-serif',
        category: 'sans-serif',
        variants: [REGULAR, REGULAR_ITALIC, SEMIBOLD, BOLD, BOLD_ITALIC],
    },
    {
        name: 'Space Grotesk',
        value: "'Space Grotesk', sans-serif",
        category: 'sans-serif',
        variants: [REGULAR, SEMIBOLD, BOLD],
    },
    {
        name: 'Plus Jakarta Sans',
        value: "'Plus Jakarta Sans', sans-serif",
        category: 'sans-serif',
        variants: [REGULAR, SEMIBOLD, BOLD],
    },
    {
        name: 'DM Sans',
        value: "'DM Sans', sans-serif",
        category: 'sans-serif',
        variants: [REGULAR, REGULAR_ITALIC, SEMIBOLD, BOLD],
    },
    // Serif
    {
        name: 'EB Garamond',
        value: "'EB Garamond', serif",
        category: 'serif',
        variants: [REGULAR, REGULAR_ITALIC, BOLD, BOLD_ITALIC],
    },
    {
        name: 'Playfair Display',
        value: "'Playfair Display', serif",
        category: 'serif',
        variants: [REGULAR, REGULAR_ITALIC, BOLD, BOLD_ITALIC],
    },
    {
        name: 'Fraunces',
        value: "'Fraunces', serif",
        category: 'serif',
        variants: [REGULAR, REGULAR_ITALIC, BOLD, BOLD_ITALIC],
    },
    {
        name: 'Libre Baskerville',
        value: "'Libre Baskerville', serif",
        category: 'serif',
        variants: [REGULAR, REGULAR_ITALIC, BOLD],
    },
    // Display
    {
        name: 'Syne',
        value: 'Syne, sans-serif',
        category: 'display',
        variants: [REGULAR, SEMIBOLD, BOLD],
    },
    {
        name: 'Clash Display',
        value: "'Clash Display', sans-serif",
        category: 'display',
        variants: [REGULAR, SEMIBOLD, BOLD],
    },
    {
        name: 'Cabinet Grotesk',
        value: "'Cabinet Grotesk', sans-serif",
        category: 'display',
        variants: [REGULAR, SEMIBOLD, BOLD],
    },
];

// Includes italic variants for applicable fonts
export const GOOGLE_FONTS_URL =
    'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Instrument+Sans:wght@400;600;700&family=Outfit:wght@400;600;700&family=Montserrat:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Space+Grotesk:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700&family=DM+Sans:ital,wght@0,400;0,600;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Fraunces:ital,wght@0,400;0,700;1,400;1,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;600;700&display=swap';
