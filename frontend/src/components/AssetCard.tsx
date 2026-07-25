import React from 'react';
import { Asset } from '@/utils/types';
import Badge from '@/components/Badge';
import StarRating from '@/components/StarRating';

interface AssetCardProps {
  asset: Asset;
  onClick?: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
  return (
    <article 
      className="w-64 flex-shrink-0 p-3 glass-panel premium-shadow-hover rounded-lg overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <img
        src={asset.imageUrl}
        alt={asset.title}
        className="w-full h-40 object-cover rounded-md mb-2"
        loading="lazy"
      />
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium truncate" title={asset.title}>
          {asset.title}
        </h3>
        <div className="flex space-x-1">
          {asset.isVerified && <Badge type="verified" />}
          {asset.isAiRecommended && <Badge type="ai" />}
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-1 line-clamp-2" title={asset.description}>
        {asset.description}
      </p>
      <div className="flex items-center text-xs text-gray-600 mb-1">
        <span className="mr-2">{asset.ownerName}</span>
        <span>{asset.location}</span>
      </div>
      <StarRating rating={asset.rating} reviewCount={asset.reviewCount} />
      <div className="flex items-center justify-between mt-2 text-sm">
        <div>
          <span className="line-through text-gray-400 mr-1">₹{asset.originalPrice}</span>
          <span className="font-semibold text-primary">₹{asset.discountPrice}</span>
        </div>
        <span className="text-xs text-gray-500">{asset.distanceKm} km</span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <button 
          className="bg-primary text-white text-xs px-3 py-1 rounded-md hover:bg-primary/80 transition"
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
          }}
        >
          Book Now
        </button>
        <div className="flex space-x-2">
          <button aria-label="Add to wishlist" className="text-gray-500 hover:text-primary transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button aria-label="Share" className="text-gray-500 hover:text-primary transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v.01M12 12v.01M20 12v.01" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};

export default AssetCard;
