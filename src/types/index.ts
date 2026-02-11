export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images?: string[];
};

export interface AuthData {
  roles: string[];
  accessToken?: string;
  refreshToken?: string;
  user?: any;
  // some other data...
}

export type UserRoleType = "admin" | "editor" | "user";

export type ProductType = "in_stock" | "preorder";

export type Product = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  productType: ProductType;
  price: number | null;
  stock: number | null;
  currency: string;
  priceNote: string | null;
  shippingNote: string | null;
  viewCount: number;
  sellerName: string;
  sizeDescription: string | null;
  packageDescription: string | null;
  preorderDescription: string | null;
  images: string[];
  preorder: unknown;
  createdAt: string;
  updatedAt: string;
};

export type Variant = {
  id: string;
  productId: string;
  name: string;
  description: string | null;
  price: number | null;
  stock: number | null;
  images: string[];
};

/** Variant payload when creating a product (no id, productId set by backend) */
export type CreateVariantInput = {
  name: string;
  description?: string | null;
  price?: number | null;
  stock?: number | null;
  images?: string[];
};

export type CreateProductBody = Omit<
  Product,
  "id" | "viewCount" | "createdAt" | "updatedAt"
> & {
  variants?: CreateVariantInput[];
};
