export type TextEffectType = 'none' | 'shadow' | 'float' | 'hollow' | 'background';

export interface TextEffect {
    type: TextEffectType;
    // Sombreado (shadow)
    shadowDistance?: number;    // 0–100, default 50
    shadowDirection?: number;   // -180–180 degrees, default -45
    shadowBlur?: number;        // 0–100, default 0
    shadowOpacity?: number;     // 0–100, default 40
    shadowColor?: string;       // default '#000000'
    // Flutuante (float)
    floatIntensity?: number;    // 0–100, default 50
    // Vazado (hollow)
    hollowThickness?: number;   // 0–100, default 50
    // Fundo (background)
    bgRoundness?: number;       // 0–100, default 50
    bgExtension?: number;       // 0–100, default 50
    bgOpacity?: number;         // 0–100, default 100
    bgColor?: string;           // default '#000000'
}

export const DEFAULT_SHADOW: Required<Pick<TextEffect, 'shadowDistance' | 'shadowDirection' | 'shadowBlur' | 'shadowOpacity' | 'shadowColor'>> = {
    shadowDistance: 50,
    shadowDirection: -45,
    shadowBlur: 0,
    shadowOpacity: 40,
    shadowColor: '#000000',
};

export const DEFAULT_FLOAT: Required<Pick<TextEffect, 'floatIntensity'>> = {
    floatIntensity: 50,
};

export const DEFAULT_HOLLOW: Required<Pick<TextEffect, 'hollowThickness'>> = {
    hollowThickness: 50,
};

export const DEFAULT_BACKGROUND: Required<Pick<TextEffect, 'bgRoundness' | 'bgExtension' | 'bgOpacity' | 'bgColor'>> = {
    bgRoundness: 50,
    bgExtension: 50,
    bgOpacity: 100,
    bgColor: '#000000',
};
