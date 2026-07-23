import { useMemo, useState } from 'react';

import { ConfirmDialog } from './components/ConfirmDialog';
import { RecipeCard } from './components/RecipeCard';
import { RecipeForm } from './components/RecipeForm';
import { useRecipes } from './hooks/useRecipes';
import type { Recipe, RecipeDraft } from './types/recipe';

type FormState = {
  open: boolean;
  recipe: Recipe | null;
};

export default function App() {
  const { recipes, loading, error, clearError, createRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');
  const [formState, setFormState] = useState<FormState>({ open: false, recipe: null });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Recipe | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return recipes;
    }

    return recipes.filter((recipe) => recipe.title.toLowerCase().includes(term));
  }, [recipes, searchTerm]);

  const openCreateForm = () => {
    clearError();
    setFormError(null);
    setFormState({ open: true, recipe: null });
  };

  const openEditForm = (recipe: Recipe) => {
    clearError();
    setFormError(null);
    setFormState({ open: true, recipe });
  };

  const closeForm = () => {
    if (isSaving) {
      return;
    }

    setFormState({ open: false, recipe: null });
    setFormError(null);
  };

  const handleSubmit = async (recipeDraft: RecipeDraft & Partial<Pick<Recipe, 'id' | 'createdAt'>>) => {
    setIsSaving(true);
    setFormError(null);
    clearError();

    try {
      if (formState.recipe) {
        await updateRecipe({
          ...recipeDraft,
          id: formState.recipe.id,
          createdAt: formState.recipe.createdAt,
        });
      } else {
        await createRecipe(recipeDraft);
      }

      setFormState({ open: false, recipe: null });
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'The recipe could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    setDeleteError(null);
    clearError();

    try {
      await deleteRecipe(pendingDelete.id);
      setPendingDelete(null);
    } catch (deleteFailure) {
      setDeleteError(deleteFailure instanceof Error ? deleteFailure.message : 'The recipe could not be deleted.');
      setPendingDelete(null);
    }
  };

  const isFormOpen = formState.open;
  const topRecipes = recipes.slice(0, 4);

  return (
    <div className="min-h-screen text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(250,247,242,0.88))] px-5 py-6 shadow-[0_30px_80px_-40px_rgba(78,64,54,0.45)] backdrop-blur sm:px-8 sm:py-7">
          <div className="pointer-events-none absolute -left-16 top-6 h-40 w-40 rounded-full bg-rose-200/35 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-amber-200/35 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-200 bg-white text-[10px] font-extrabold uppercase tracking-[0.22em] text-rose-600 shadow-sm">
                    RC
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-500">Recipe Collection</p>
                    <p className="text-sm text-slate-500">Local recipes on this device</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openCreateForm}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Add Recipe
                </button>
              </div>

              <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
                <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  Explore your recipe collection
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                  Search, save, edit, and revisit your favorite recipes with everything stored locally in your browser.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                {['All', 'Breakfast', 'Starters', 'Main Courses', 'Side Dishes', 'Desserts'].map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                      index === 2
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'border border-white/70 bg-white/80 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:min-w-[280px] lg:items-end">
              <div className="w-full max-w-lg rounded-full border border-white/80 bg-white/90 px-4 py-3 shadow-sm">
                <label htmlFor="recipe-search" className="sr-only">
                  Search by title
                </label>
                <input
                  id="recipe-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search recipes"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="rounded-[2rem] border border-white/80 bg-white/90 px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">Most recent</p>
                <div className="mt-3 space-y-3">
                  {topRecipes.length === 0 ? (
                    <p className="text-sm text-slate-500">No recipes yet.</p>
                  ) : (
                    topRecipes.map((recipe) => (
                      <button
                        key={recipe.id}
                        type="button"
                        onClick={() => openEditForm(recipe)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-left transition hover:border-slate-200 hover:bg-white"
                      >
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-rose-100 text-xs font-bold uppercase text-rose-700">
                          {recipe.title.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{recipe.title}</p>
                          <p className="text-xs text-slate-500">{recipe.ingredients.length} ingredients</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {error ? <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {deleteError ? <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{deleteError}</p> : null}

        <main className="flex-1 rounded-[2.2rem] border border-white/70 bg-[rgba(255,255,255,0.72)] p-4 shadow-[0_30px_90px_-48px_rgba(78,64,54,0.38)] backdrop-blur sm:p-6 lg:p-7">
          {isFormOpen ? (
            <RecipeForm
              initialRecipe={formState.recipe}
              saving={isSaving}
              error={formError}
              onCancel={closeForm}
              onSubmit={handleSubmit}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 border-b border-white/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-950">Saved recipes</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Browse cards on the page, open a recipe to edit it, and keep the collection fully local.
                  </p>
                </div>

                <p className="text-sm font-medium text-slate-500">
                  {filteredRecipes.length} recipe{filteredRecipes.length === 1 ? '' : 's'}
                </p>
              </div>

              {loading ? (
                <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center text-slate-600">
                  Loading recipes...
                </div>
              ) : filteredRecipes.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {recipes.length === 0 ? 'No recipes yet' : 'No matching recipes'}
                  </h3>
                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
                    {recipes.length === 0
                      ? 'Create your first recipe to start building your local collection.'
                      : 'Try a different search term or clear the search box.'}
                  </p>
                  {recipes.length === 0 ? (
                    <button
                      type="button"
                      onClick={openCreateForm}
                      className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Add your first recipe
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} onEdit={openEditForm} onDelete={setPendingDelete} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete recipe?"
        description={pendingDelete ? `This will permanently delete ${pendingDelete.title}.` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}