export type Recipe = {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  image?: Blob;
  createdAt: string;
  updatedAt: string;
};

export type RecipeDraft = {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  image?: Blob;
};