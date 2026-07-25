import React from 'react';
import AssetCard from '@/components/AssetCard';
import { Asset } from '@/utils/types';

interface SectionSliderProps {
  title: string;
  assets: Asset[];
  subtitle?: React.ReactNode;
  onAssetClick?: (asset: Asset) => void;
}

const SectionSlider: React.FC<SectionSliderProps> = ({ title, assets, subtitle, onAssetClick }) => {
  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-extrabold text-xl text-slate-800">{title}</h2>
        {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-slate-300">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} onClick={() => onAssetClick?.(asset)} />
        ))}
      </div>
    </section>
  );
};

export default SectionSlider;
