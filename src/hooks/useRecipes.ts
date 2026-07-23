import { useCallback, useEffect, useState } from 'react';

import {
  createRecipe as saveRecipe,
  deleteRecipe as removeRecipe,
  getRecipes,
  updateRecipe as replaceRecipe,
} from '../storage/recipeDatabase';
import type { Recipe, RecipeDraft } from '../types/recipe';

type RecipeUpsert = RecipeDraft & Partial<Pick<Recipe, 'id' | 'createdAt'>>;

function getFriendlyError(error: unknown, fallbackMessage: string): string {
  return error instanceof Error && error.message ? error.message : fallbackMessage;
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const storedRecipes = await getRecipes();
        if (active) {
          setRecipes(storedRecipes);
        }
      } catch (loadError) {
        if (active) {
          setError(getFriendlyError(loadError, 'Recipes could not be loaded.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const create = useCallback(async (recipeDraft: RecipeDraft) => {
    try {
      setError(null);
      const now = new Date().toISOString();
      const recipe: Recipe = {
        ...recipeDraft,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      await saveRecipe(recipe);
      setRecipes((current) => [recipe, ...current].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)));
      return recipe;
    } catch (createError) {
      const message = getFriendlyError(createError, 'The recipe could not be saved.');
      setError(message);
      throw new Error(message);
    }
  }, []);

  const update = useCallback(async (recipeDraft: RecipeUpsert) => {
    try {
      setError(null);
      const recipe: Recipe = {
        id: recipeDraft.id ?? crypto.randomUUID(),
        createdAt: recipeDraft.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: recipeDraft.title,
        description: recipeDraft.description,
        ingredients: recipeDraft.ingredients,
        instructions: recipeDraft.instructions,
        image: recipeDraft.image,
      };
      await replaceRecipe(recipe);
      setRecipes((current) =>
        current
          .map((entry) => (entry.id === recipe.id ? recipe : entry))
          .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
      );
      return recipe;
    } catch (updateError) {
      const message = getFriendlyError(updateError, 'The recipe could not be updated.');
      setError(message);
      throw new Error(message);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      setError(null);
      await removeRecipe(id);
      setRecipes((current) => current.filter((recipe) => recipe.id !== id));
    } catch (deleteError) {
      const message = getFriendlyError(deleteError, 'The recipe could not be deleted.');
      setError(message);
      throw new Error(message);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    recipes,
    loading,
    error,
    clearError,
    createRecipe: create,
    updateRecipe: update,
    deleteRecipe: remove,
  };
}