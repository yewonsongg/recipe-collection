type IngredientListInputProps = {
  values: string[];
  onChange: (values: string[]) => void;
};

export function IngredientListInput({ values, onChange }: IngredientListInputProps) {
  const updateValue = (index: number, value: string) => {
    const nextValues = [...values];
    nextValues[index] = value;
    onChange(nextValues);
  };

  const addValue = () => {
    onChange([...values, '']);
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">Ingredients</h3>
        <button
          type="button"
          onClick={addValue}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Add ingredient
        </button>
      </div>

      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={`ingredient-${index}`} className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(event) => updateValue(index, event.target.value)}
              placeholder="2 cups flour"
              className="min-w-0 flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-emerald-100"
            />
            <button
              type="button"
              onClick={() => removeValue(index)}
              disabled={values.length === 1}
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}