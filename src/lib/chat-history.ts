import { Message } from '@/components/ui/chat-message';
import { Recipe } from '@/components/RecipeCard';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export const saveChats = (chats: Record<string, ChatSession>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chatHistory', JSON.stringify(chats));
  }
};

export const loadChats = (): Record<string, ChatSession> => {
  if (typeof window !== 'undefined') {
    const savedChats = localStorage.getItem('chatHistory');
    return savedChats ? JSON.parse(savedChats) : {};
  }
  return {};
};

const loadAllRecipes = (): Record<string, Recipe[]> => {
    if (typeof window !== 'undefined') {
        const savedRecipes = localStorage.getItem('cachedRecipes');
        return savedRecipes ? JSON.parse(savedRecipes) : {};
    }
    return {};
}

export const saveRecipes = (chatId: string, recipes: Recipe[]) => {
  if (typeof window !== 'undefined') {
    const allRecipes = loadAllRecipes();
    allRecipes[chatId] = recipes;
    localStorage.setItem('cachedRecipes', JSON.stringify(allRecipes));
  }
};

export const loadRecipes = (chatId: string): Recipe[] => {
  if (typeof window !== 'undefined') {
    const allRecipes = loadAllRecipes();
    return allRecipes[chatId] || [];
  }
  return [];
};
