import React from 'react';
import Image from 'next/image';
import { Recipe } from './RecipeCard';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onClose }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto p-8">
      <button
        className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 text-2xl font-bold"
        onClick={onClose}
      >
        &times;
      </button>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{recipe.recipeName}</h1>
        <div className="relative w-full h-96 mb-6">
          <Image
            src={recipe.imageUrl}
            alt={recipe.recipeName}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
        <p className="text-lg mb-8">{recipe.description}</p>

        <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
        <ul className="list-disc list-inside mb-8">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside">
          {recipe.steps.map((step, index) => (
            <li key={index} className="mb-2">{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};
