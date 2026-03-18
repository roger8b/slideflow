import { useState, useEffect, useCallback } from 'react';
import { PresentationMetadata } from '../types';
import { DEFAULT_BRAND } from '../constants';

export const usePresentationState = () => {
  const [metadata, setMetadata] = useState<PresentationMetadata>(() => {
    const saved = localStorage.getItem('slideflow-metadata');
    const base = {
      title: 'New Presentation',
      author: 'Anonymous',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      baseFontSize: 32,
      theme: 'modern',
      brand: DEFAULT_BRAND,
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...base, ...parsed };
      } catch (e) {
        return base;
      }
    }
    return base;
  });

  const [savedBrandKits, setSavedBrandKits] = useState<any[]>(() => {
    const saved = localStorage.getItem('slideflow-brand-kits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved brand kits:", e);
        localStorage.removeItem('slideflow-brand-kits');
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('slideflow-metadata', JSON.stringify(metadata));
  }, [metadata]);

  useEffect(() => {
    localStorage.setItem('slideflow-brand-kits', JSON.stringify(savedBrandKits));
  }, [savedBrandKits]);

  const handleSaveBrandKit = useCallback((kit: any) => {
    const newKit = {
      ...kit,
      id: `custom_${Date.now()}`,
      name: `Meu Estilo ${savedBrandKits.length + 1}`
    };
    setSavedBrandKits(prev => [newKit, ...prev]);
  }, [savedBrandKits]);

  return {
    metadata,
    setMetadata,
    savedBrandKits,
    setSavedBrandKits,
    handleSaveBrandKit
  };
};
