import React from 'react';
import { Badge } from '@/components/Badge';

interface CategoryCardProps {
  category: string;
  count: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, count }) => {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow flex flex-col items-center">
      <Badge type="primary" />
      <span className="font-display font-bold text-sm text-slate-800 mt-2">{category}</span>
      <span className="text-xs text-slate-500">{count} assets</span>
    </div>
  );
};

export default CategoryCard;
