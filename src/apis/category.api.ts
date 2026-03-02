import type { Category } from "@types";

import { axiosPrivate } from "@apis/clientAxios";

export type CreateCategoryFormData = {
  name: string;
  slug: string;
  description?: string;
  images: File[];
};

/** For update: keep these keys and add new files. */
export type UpdateCategoryFormData = CreateCategoryFormData & {
  existingImageKeys?: string[];
};

export async function fetchCategories(): Promise<Category[]> {
  const res = await axiosPrivate.get("/categories");
  return res.data?.data ?? res.data;
}

export async function fetchCategoryById(id: string): Promise<Category | null> {
  const res = await axiosPrivate.get(`/categories/${id}`);
  return (res.data?.data ?? res.data) as Category | null;
}

export async function createCategory(
  payload: CreateCategoryFormData
): Promise<Category> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("slug", payload.slug);
  if (payload.description) {
    formData.append("description", payload.description);
  }
  (payload.images ?? []).forEach(file => formData.append("images", file));
  const res = await axiosPrivate.post("/categories/create", formData);
  return res.data?.data ?? res.data;
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryFormData
): Promise<Category> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("slug", payload.slug);
  if (payload.description) {
    formData.append("description", payload.description);
  }
  if (
    payload.existingImageKeys != null &&
    Array.isArray(payload.existingImageKeys) &&
    payload.existingImageKeys.length > 0
  ) {
    formData.append(
      "existingImages",
      JSON.stringify(payload.existingImageKeys)
    );
  }
  (payload.images ?? []).forEach(file => formData.append("images", file));
  const res = await axiosPrivate.put(`/categories/${id}`, formData);
  return res.data?.data ?? res.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await axiosPrivate.delete(`/categories/${id}`);
}

export async function deleteCategoryAsset(
  categoryId: string,
  assetPath: string
): Promise<void> {
  await axiosPrivate.delete(`/categories/${categoryId}/assets`, {
    data: { path: assetPath },
  });
}
