import { useEffect, useState } from 'react';

import type { Recipe } from '../types/recipe';

type RecipeCardProps = {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
};

export function RecipeCard({ recipe, onEdit, onDelete }: RecipeCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!recipe.image) {
      setImageUrl(null);
      return;
    }

    const url = URL.createObjectURL(recipe.image);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [recipe.image]);

  return (
    <article className="group overflow-hidden rounded-[1.8rem] border border-white/80 bg-white/95 shadow-[0_18px_45px_-28px_rgba(78,64,54,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-24px_rgba(78,64,54,0.38)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-100 via-rose-50 to-emerald-50">
        {imageUrl ? (
          <img src={imageUrl} alt={recipe.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium text-slate-500">
            Add an image to make this card stand out
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">{recipe.title}</h3>
          <p className="text-sm leading-6 text-slate-600">{recipe.description?.trim() || 'No description provided.'}</p>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
          {recipe.ingredients.length} ingredient{recipe.ingredients.length === 1 ? '' : 's'}
        </p>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => onEdit(recipe)}
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(recipe)}
            className="flex-1 rounded-full border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-200 hover:bg-rose-100"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}