import { test, describe } from 'node:test';
import assert from 'node:assert';
import { applyTextEffect } from './applyTextEffect';

describe('applyTextEffect', () => {
    test('should return empty styles for undefined effect', () => {
        const result = applyTextEffect(undefined);
        assert.deepStrictEqual(result, { textStyles: {}, wrapperStyles: {} });
    });

    test('should return empty styles for effect type "none"', () => {
        const result = applyTextEffect({ type: 'none' });
        assert.deepStrictEqual(result, { textStyles: {}, wrapperStyles: {} });
    });

    describe('shadow effect', () => {
        test('should apply default shadow styles', () => {
            const result = applyTextEffect({ type: 'shadow' });
            // Default: distance 50, direction -45, blur 0, opacity 40, color #000000
            // rad = (-45 * Math.PI) / 180 = -0.785398...
            // x = Math.round(Math.sin(rad) * (50 / 5)) = Math.round(-0.7071 * 10) = -7
            // y = Math.round(Math.cos(rad) * (50 / 5)) = Math.round(0.7071 * 10) = 7
            // blurPx = Math.round(0 / 5) = 0
            // alpha = 40 / 100 = 0.4
            // rgb = 0,0,0
            assert.deepStrictEqual(result.textStyles, {
                textShadow: '-7px 7px 0px rgba(0,0,0,0.4)',
            });
            assert.deepStrictEqual(result.wrapperStyles, {});
        });

        test('should apply custom shadow styles', () => {
            const result = applyTextEffect({
                type: 'shadow',
                shadowDistance: 100,
                shadowDirection: 90,
                shadowBlur: 25,
                shadowOpacity: 80,
                shadowColor: '#ff0000',
            });
            // rad = (90 * Math.PI) / 180 = 1.5707...
            // x = Math.round(Math.sin(rad) * (100 / 5)) = Math.round(1 * 20) = 20
            // y = Math.round(Math.cos(rad) * (100 / 5)) = Math.round(0 * 20) = 0
            // blurPx = Math.round(25 / 5) = 5
            // alpha = 80 / 100 = 0.8
            // rgb = 255,0,0
            assert.deepStrictEqual(result.textStyles, {
                textShadow: '20px 0px 5px rgba(255,0,0,0.8)',
            });
        });
    });

    describe('float effect', () => {
        test('should apply default float styles', () => {
            const result = applyTextEffect({ type: 'float' });
            // Default: intensity 50
            // offset = Math.round(50 / 20) = 2 (standard round is .5 up) - wait, Math.round(2.5) is 3 in JS
            // Math.round(2.5) === 3
            // blur = Math.round(50 / 5) = 10
            assert.deepStrictEqual(result.textStyles, {
                textShadow: '0px 3px 10px rgba(0,0,0,0.35)',
            });
        });

        test('should apply custom float styles', () => {
            const result = applyTextEffect({ type: 'float', floatIntensity: 80 });
            // offset = Math.round(80 / 20) = 4
            // blur = Math.round(80 / 5) = 16
            assert.deepStrictEqual(result.textStyles, {
                textShadow: '0px 4px 16px rgba(0,0,0,0.35)',
            });
        });
    });

    describe('hollow effect', () => {
        test('should apply default hollow styles', () => {
            const result = applyTextEffect({ type: 'hollow' });
            // Default: thickness 50
            // strokeWidth = (50 / 20).toFixed(1) = "2.5"
            assert.deepStrictEqual(result.textStyles, {
                WebkitTextStroke: '2.5px currentColor',
                WebkitTextFillColor: 'transparent',
            });
        });

        test('should apply custom hollow styles', () => {
            const result = applyTextEffect({ type: 'hollow', hollowThickness: 20 });
            // strokeWidth = (20 / 20).toFixed(1) = "1.0"
            assert.deepStrictEqual(result.textStyles, {
                WebkitTextStroke: '1.0px currentColor',
                WebkitTextFillColor: 'transparent',
            });
        });
    });

    describe('background effect', () => {
        test('should apply default background styles', () => {
            const result = applyTextEffect({ type: 'background' });
            // Default: roundness 50, extension 50, opacity 100, color #000000
            // borderRadius = Math.round(50 / 2) = 25
            // paddingV = Math.round(50 / 10) = 5
            // paddingH = Math.round(50 / 5) = 10
            // alpha = 100 / 100 = 1
            // rgb = 0,0,0
            assert.deepStrictEqual(result.wrapperStyles, {
                backgroundColor: 'rgba(0,0,0,1)',
                borderRadius: '25px',
                padding: '5px 10px',
                display: 'inline-block',
            });
        });

        test('should apply custom background styles', () => {
            const result = applyTextEffect({
                type: 'background',
                bgRoundness: 10,
                bgExtension: 20,
                bgOpacity: 50,
                bgColor: '#ffffff',
            });
            // borderRadius = Math.round(10 / 2) = 5
            // paddingV = Math.round(20 / 10) = 2
            // paddingH = Math.round(20 / 5) = 4
            // alpha = 50 / 100 = 0.5
            // rgb = 255,255,255
            assert.deepStrictEqual(result.wrapperStyles, {
                backgroundColor: 'rgba(255,255,255,0.5)',
                borderRadius: '5px',
                padding: '2px 4px',
                display: 'inline-block',
            });
        });
    });

    describe('hexToRgb internal testing via effects', () => {
        test('should handle 3-digit hex colors', () => {
            const result = applyTextEffect({
                type: 'background',
                bgColor: '#f00', // red
                bgOpacity: 100
            });
            assert.strictEqual(result.wrapperStyles.backgroundColor, 'rgba(255,0,0,1)');
        });

        test('should handle CSS variables', () => {
            const result = applyTextEffect({
                type: 'background',
                bgColor: 'var(--brand-primary)',
                bgOpacity: 100
            });
            // hexToRgb returns '0,0,0' for 'var('
            assert.strictEqual(result.wrapperStyles.backgroundColor, 'rgba(0,0,0,1)');
        });

        test('should handle invalid hex colors', () => {
            const result = applyTextEffect({
                type: 'background',
                bgColor: 'invalid',
                bgOpacity: 100
            });
            // hexToRgb returns '0,0,0' for invalid
            assert.strictEqual(result.wrapperStyles.backgroundColor, 'rgba(0,0,0,1)');
        });
    });
});
