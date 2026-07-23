import { useEffect, useState, type ChangeEvent } from 'react';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type ImagePickerProps = {
  value: Blob | null;
  onChange: (value: Blob | null) => void;
};

export function ImagePicker({ value, onChange }: ImagePickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [value]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Please choose a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError('Please choose an image smaller than 5 MB.');
      return;
    }

    setError(null);
    onChange(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">Recipe image</h3>
        {value ? (
          <button
            type="button"
            onClick={() => {
              setError(null);
              onChange(null);
            }}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Remove image
          </button>
        ) : null}
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
      />

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {previewUrl ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
          <img src={previewUrl} alt="Recipe preview" className="h-56 w-full object-cover" />
        </div>
      ) : (
        <p className="text-sm text-slate-500">No image selected.</p>
      )}
    </div>
  );
}