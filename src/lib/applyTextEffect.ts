import { TextEffect, DEFAULT_SHADOW, DEFAULT_FLOAT, DEFAULT_HOLLOW, DEFAULT_BACKGROUND } from '../types/textEffect';

export interface TextEffectStyles {
    textStyles: React.CSSProperties;
    wrapperStyles: React.CSSProperties;
}

function hexToRgb(hex: string): string {
    // Handle CSS variables — return as-is (can't resolve at runtime here)
    if (hex.startsWith('var(')) return '0,0,0';
    const clean = hex.replace('#', '');
    const full = clean.length === 3
        ? clean.split('').map(c => c + c).join('')
        : clean;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return '0,0,0';
    return `${r},${g},${b}`;
}

export function applyTextEffect(effect: TextEffect | undefined): TextEffectStyles {
    if (!effect || effect.type === 'none') {
        return { textStyles: {}, wrapperStyles: {} };
    }

    switch (effect.type) {
        case 'shadow': {
            const distance = effect.shadowDistance ?? DEFAULT_SHADOW.shadowDistance;
            const direction = effect.shadowDirection ?? DEFAULT_SHADOW.shadowDirection;
            const blur = effect.shadowBlur ?? DEFAULT_SHADOW.shadowBlur;
            const opacity = effect.shadowOpacity ?? DEFAULT_SHADOW.shadowOpacity;
            const color = effect.shadowColor ?? DEFAULT_SHADOW.shadowColor;

            const rad = (direction * Math.PI) / 180;
            const x = Math.round(Math.sin(rad) * (distance / 5));
            const y = Math.round(Math.cos(rad) * (distance / 5));
            const blurPx = Math.round(blur / 5);
            const alpha = opacity / 100;
            const rgb = hexToRgb(color);

            return {
                textStyles: {
                    textShadow: `${x}px ${y}px ${blurPx}px rgba(${rgb},${alpha})`,
                },
                wrapperStyles: {},
            };
        }

        case 'float': {
            const intensity = effect.floatIntensity ?? DEFAULT_FLOAT.floatIntensity;
            const offset = Math.round(intensity / 20);
            const blur = Math.round(intensity / 5);
            return {
                textStyles: {
                    textShadow: `0px ${offset}px ${blur}px rgba(0,0,0,0.35)`,
                },
                wrapperStyles: {},
            };
        }

        case 'hollow': {
            const thickness = effect.hollowThickness ?? DEFAULT_HOLLOW.hollowThickness;
            const strokeWidth = (thickness / 20).toFixed(1);
            return {
                textStyles: {
                    WebkitTextStroke: `${strokeWidth}px currentColor`,
                    WebkitTextFillColor: 'transparent',
                },
                wrapperStyles: {},
            };
        }

        case 'background': {
            const roundness = effect.bgRoundness ?? DEFAULT_BACKGROUND.bgRoundness;
            const extension = effect.bgExtension ?? DEFAULT_BACKGROUND.bgExtension;
            const opacity = effect.bgOpacity ?? DEFAULT_BACKGROUND.bgOpacity;
            const color = effect.bgColor ?? DEFAULT_BACKGROUND.bgColor;

            const borderRadius = Math.round(roundness / 2);
            const paddingV = Math.round(extension / 10);
            const paddingH = Math.round(extension / 5);
            const alpha = opacity / 100;
            const rgb = hexToRgb(color);

            return {
                textStyles: {},
                wrapperStyles: {
                    backgroundColor: `rgba(${rgb},${alpha})`,
                    borderRadius: `${borderRadius}px`,
                    padding: `${paddingV}px ${paddingH}px`,
                    display: 'inline-block',
                },
            };
        }

        default:
            return { textStyles: {}, wrapperStyles: {} };
    }
}
