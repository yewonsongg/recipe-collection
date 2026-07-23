import { useEffect, useState, type FormEvent } from 'react';

import type { Recipe, RecipeDraft } from '../types/recipe';
import { ImagePicker } from './ImagePicker';
import { IngredientListInput } from './IngredientListInput';
import { InstructionListInput } from './InstructionListInput';

type RecipeFormProps = {
  initialRecipe?: Recipe | null;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (recipe: RecipeDraft & Partial<Pick<Recipe, 'id' | 'createdAt'>>) => Promise<void>;
};

type FormErrors = {
  title?: string;
  ingredients?: string;
  instructions?: string;
};

function getInitialState(recipe?: Recipe | null) {
  return {
    title: recipe?.title ?? '',
    description: recipe?.description ?? '',
    ingredients: recipe?.ingredients?.length ? recipe.ingredients : [''],
    instructions: recipe?.instructions?.length ? recipe.instructions : [''],
    image: recipe?.image ?? null,
  };
}

export function RecipeForm({ initialRecipe, saving, error, onCancel, onSubmit }: RecipeFormProps) {
  const initialState = getInitialState(initialRecipe);
  const [title, setTitle] = useState(initialState.title);
  const [description, setDescription] = useState(initialState.description);
  const [ingredients, setIngredients] = useState<string[]>(initialState.ingredients);
  const [instructions, setInstructions] = useState<string[]>(initialState.instructions);
  const [image, setImage] = useState<Blob | null>(initialState.image);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    const next = getInitialState(initialRecipe);
    setTitle(next.title);
    setDescription(next.description);
    setIngredients(next.ingredients);
    setInstructions(next.instructions);
    setImage(next.image);
    setFormErrors({});
  }, [initialRecipe]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTitle = title.trim();
    const nextDescription = description.trim();
    const nextIngredients = ingredients.map((value) => value.trim()).filter(Boolean);
    const nextInstructions = instructions.map((value) => value.trim()).filter(Boolean);

    const nextErrors: FormErrors = {};

    if (!nextTitle) {
      nextErrors.title = 'A title is required.';
    }

    if (nextIngredients.length === 0) {
      nextErrors.ingredients = 'Add at least one ingredient.';
    }

    if (nextInstructions.length === 0) {
      nextErrors.instructions = 'Add at least one instruction.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    setFormErrors({});

    await onSubmit({
      id: initialRecipe?.id,
      createdAt: initialRecipe?.createdAt,
      title: nextTitle,
      description: nextDescription || undefined,
      ingredients: nextIngredients,
      instructions: nextInstructions,
      image: image ?? undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {initialRecipe ? 'Edit recipe' : 'Add recipe'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">Keep it local. Your recipes stay on this device.</p>
      </div>

      {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <div className="space-y-2">
        <label htmlFor="recipe-title" className="text-sm font-semibold text-slate-900">
          Title
        </label>
        <input
          id="recipe-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-emerald-100"
          placeholder="Weeknight chili"
        />
        {formErrors.title ? <p className="text-sm text-rose-700">{formErrors.title}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="recipe-description" className="text-sm font-semibold text-slate-900">
          Description
        </label>
        <textarea
          id="recipe-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-emerald-100"
          placeholder="A short note about the dish"
        />
      </div>

      <IngredientListInput values={ingredients} onChange={setIngredients} />
      {formErrors.ingredients ? <p className="text-sm text-rose-700">{formErrors.ingredients}</p> : null}

      <InstructionListInput values={instructions} onChange={setInstructions} />
      {formErrors.instructions ? <p className="text-sm text-rose-700">{formErrors.instructions}</p> : null}

      <ImagePicker value={image} onChange={setImage} />

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? 'Saving...' : initialRecipe ? 'Update recipe' : 'Save recipe'}
        </button>
      </div>
    </form>
  );
}