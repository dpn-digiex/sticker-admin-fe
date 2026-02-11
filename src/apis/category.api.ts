import type { Category } from "@types";

import { axiosPrivate } from "@apis/clientAxios";

export type CreateCategoryFormData = {
  name: string;
  slug: string;
  description?: string;
  images: File[];
};

export async function fetchCategories(): Promise<Category[]> {
  const res = await axiosPrivate.get("/categories");
  return res.data?.data ?? res.data;
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
