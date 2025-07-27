import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Recipe } from './RecipeCard';
import { X, ChefHat, GlassWater, Utensils } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 "
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-card text-card-foreground rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary">{recipe.recipeName}</h1>
            <button
                className="p-2 rounded-full hover:bg-muted"
                onClick={onClose}
            >
                <X size={24} />
            </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Image and Description */}
                <div className="space-y-4">
                    <div className="relative w-full h-80 rounded-lg overflow-hidden">
                        <Image
                            src={recipe.imageUrl}
                            alt={recipe.recipeName}
                            layout="fill"
                            objectFit="cover"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                         <p className="absolute bottom-4 left-4 text-white text-lg font-semibold p-2 bg-black/50 rounded">{recipe.description}</p>
                    </div>
                </div>

                {/* Right Column: Ingredients and Instructions */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-3 flex items-center text-amber-500">
                            <GlassWater className="mr-2" size={20}/> Ingredients
                        </h2>
                        <ul className="space-y-2 text-muted-foreground pl-2 border-l-2 border-amber-500">
                            {recipe.ingredients.map((ingredient, index) => (
                                <li key={index} className="pl-4">{ingredient}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold mb-3 flex items-center text-amber-500">
                        <Utensils className="mr-2" size={20}/> Instructions
                    </h2>
                    <ol className="space-y-4">
                        {recipe.steps.map((step, index) => (
                            <li key={index} className="flex items-start">
                                <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full h-6 w-6 text-sm flex items-center justify-center mr-4 mt-1">
                                    {index + 1}
                                </div>
                                <span className="flex-grow">{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
