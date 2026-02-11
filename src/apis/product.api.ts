import type { CreateProductBody, Product } from "@types";

import { axiosPrivate } from "@apis/clientAxios";

export async function createProduct(body: CreateProductBody): Promise<Product> {
  const res = await axiosPrivate.post<{ data?: Product }>("/products", body);
  return (res.data?.data ?? res.data) as Product;
}

export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  category_id?: string;
  product_type?: "in_stock" | "preorder";
  keyword?: string;
}): Promise<Product[]> {
  const res = await axiosPrivate.get<{ data?: Product[] }>("/products", {
    params,
  });
  return (res.data?.data ?? res.data) as Product[];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const res = await axiosPrivate.get<{ data?: Product }>(`/products/${id}`);
  return (res.data?.data ?? res.data) as Product | null;
}
