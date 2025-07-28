import React from 'react';
import Image from 'next/image';

export interface Recipe {
  recipeName: string;
  description: string;
  imageUrl: string;
  ingredients: string[];
  steps: string[];
  prepTime: string;
  servings: number;
}

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div
      className="cursor-pointer rounded-lg shadow-md overflow-hidden transform hover:scale-105 flex flex-row bg-card hover:bg-muted hover:shadow-lg transition-all duration-300 ease-in-out border border-primary-background/20"
      onClick={() => onClick(recipe)}
    >
      <div className="relative w-40 h-40 flex-shrink-0">
        <Image
          src={recipe.imageUrl}
          alt={recipe.recipeName}
          layout="fill"
          objectFit="cover"
          className="rounded-l-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-l-lg"></div>
      </div>
      <div className="p-4 flex flex-col justify-center flex-grow">
        <h3 className="text-lg font-semibold mb-1 text-card-foreground">{recipe.recipeName}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">{recipe.description}</p>
      </div>
    </div>
  );
};
