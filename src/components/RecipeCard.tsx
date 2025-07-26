import React from 'react';
import Image from 'next/image';

export interface Recipe {
  recipeName: string;
  description: string;
  imageUrl: string;
  ingredients: string[];
  steps: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div
      className="cursor-pointer rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      onClick={() => onClick(recipe)}
    >
      <div className="relative w-full h-48">
        <Image
          src={recipe.imageUrl}
          alt={recipe.recipeName}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{recipe.recipeName}</h3>
        <p className="text-sm text-gray-600 line-clamp-3">{recipe.description}</p>
      </div>
    </div>
  );
};
