import { Message } from '@/components/ui/chat-message';
import { Recipe } from '@/components/RecipeCard';

export const saveChatHistory = (messages: Message[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }
};

export const loadChatHistory = (): Message[] => {
  if (typeof window !== 'undefined') {
    const savedMessages = localStorage.getItem('chatHistory');
    return savedMessages ? JSON.parse(savedMessages) : [];
  }
  return [];
};

export const saveRecipes = (recipes: Recipe[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cachedRecipes', JSON.stringify(recipes));
  }
};

export const loadRecipes = (): Recipe[] => {
  if (typeof window !== 'undefined') {
    const savedRecipes = localStorage.getItem('cachedRecipes');
    return savedRecipes ? JSON.parse(savedRecipes) : [];
  }
  return [];
};