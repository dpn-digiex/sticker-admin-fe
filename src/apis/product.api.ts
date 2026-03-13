import { axiosPrivate } from "@apis/clientAxios";
import { API_ENDPOINTS } from "@constants/index";
import type { CreateProductBody, Product, UpdateProductBody } from "@types";

export async function createProduct(body: CreateProductBody): Promise<Product> {
  const res = await axiosPrivate.post<{ data?: Product }>("/products", body);
  return (res.data?.data ?? res.data) as Product;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
}

export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  category_id?: string;
  product_type?: "in_stock" | "preorder";
  keyword?: string;
}): Promise<ProductListResponse> {
  const res = await axiosPrivate.get<{ data?: Product[] }>(
    API_ENDPOINTS.PRODUCTS,
    {
      params,
    }
  );
  return (res.data?.data ?? res.data) as ProductListResponse;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const res = await axiosPrivate.get<{ data?: Product }>(
    `${API_ENDPOINTS.PRODUCTS}/${id}`
  );
  return (res.data?.data ?? res.data) as Product | null;
}

export async function updateProduct(
  id: string,
  body: UpdateProductBody
): Promise<Product> {
  const res = await axiosPrivate.put<{ data?: Product }>(
    `${API_ENDPOINTS.PRODUCTS}/${id}`,
    body
  );
  return (res.data?.data ?? res.data) as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  await axiosPrivate.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`);
}

export async function deleteProductAsset(
  productId: string,
  assetPath: string
): Promise<void> {
  await axiosPrivate.delete(`${API_ENDPOINTS.PRODUCTS}/${productId}/assets`, {
    data: { path: assetPath },
  });
}
