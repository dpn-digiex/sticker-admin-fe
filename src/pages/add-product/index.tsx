import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { fetchCategories } from "@apis/category.api";
import { createProduct } from "@apis/product.api";
import PresignedUploader from "@components/common/presigned-uploader";
import useToastStore, { type ToastState } from "@stores/toastStore";
import type { Category } from "@types";
import { slugify } from "@utils";

const MAX_PRODUCT_IMAGES = 10;
const MAX_VARIANT_IMAGES = 5;
const MAX_FILE_SIZE_MB = 5;
const MIN_IMAGES_REQUIRED = 2;

const variantSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "Variant name is required"),
  description: z.string().optional().default(""),
  price: z.coerce.number().int().min(0, "Price must be ≥ 0"),
  stock: z.coerce.number().int().min(0, "Stock must be a whole number ≥ 0"),
});

const productSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    categoryId: z.string().min(1, "Select a category"),
    productType: z.enum(["in_stock", "preorder"]),
    price: z.coerce
      .number()
      .int()
      .min(0, "Price must be ≥ 0")
      .nullable()
      .optional(),
    currency: z.string().default("VND"),
    priceNote: z.string().optional(),
    shippingNote: z.string().optional(),
    stock: z.coerce.number().int().min(0, "Stock must be a whole number ≥ 0"),
    sellerName: z.string().min(1, "Seller name is required"),
    sizeDescription: z.string().optional(),
    packageDescription: z.string().optional(),
    preorderDescription: z.string().optional(),
    hasVariants: z.boolean().default(false),
    variants: z.array(variantSchema).default([]),
  })
  .superRefine((val, ctx) => {
    if (val.hasVariants) {
      if (val.variants.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: "Add at least one variant when using With variants.",
        });
      }
    } else {
      if (val.variants.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: "Remove variants when using Single product.",
        });
      }
    }
  });

export type ProductFormValues = z.infer<typeof productSchema>;

const QUERY_KEY = { categories: ["categories"] as const };

const makeEmptyVariant = () => {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    price: 0,
    stock: 0,
  };
};

const defaultFormValues: ProductFormValues = {
  name: "",
  slug: "",
  categoryId: "",
  productType: "in_stock",
  price: 0,
  stock: 0,
  currency: "VND",
  priceNote: "",
  shippingNote: "",
  sellerName: "",
  sizeDescription: "",
  packageDescription: "",
  preorderDescription: "",
  hasVariants: false,
  variants: [],
};

export default function AddProductPage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s: ToastState) => s.showToast);

  const [slugTouched, setSlugTouched] = React.useState(false);
  const [imageKeys, setImageKeys] = React.useState<string[]>([]);
  const [variantImageKeys, setVariantImageKeys] = React.useState<
    Record<string, string[]>
  >({});

  const { data: categories = [] } = useQuery({
    queryKey: QUERY_KEY.categories,
    queryFn: fetchCategories,
    staleTime: 30_000,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultFormValues,
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "variants",
    keyName: "_key", // avoid clashing with your `id`
  });

  const name = watch("name");
  const slug = watch("slug");
  const hasVariants = watch("hasVariants");

  React.useEffect(() => {
    if (!slugTouched && name) {
      setValue("slug", slugify(name), { shouldValidate: true });
    }
  }, [name, setValue, slugTouched]);

  const createMutation = useMutation({
    mutationFn: (body: Parameters<typeof createProduct>[0]) =>
      createProduct(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("Product created successfully.", "success");
      resetForm();
    },
  });

  const resetForm = () => {
    reset(defaultFormValues);
    replace([]);
    setImageKeys([]);
    setVariantImageKeys({});
    setSlugTouched(false);
  };

  const onToggleMode = (_: unknown, value: "single" | "variants" | null) => {
    if (!value) return;

    const nextHasVariants = value === "variants";
    setValue("hasVariants", nextHasVariants, { shouldValidate: true });

    // keep toggle UX clean + predictable
    clearErrors(["variants"]);

    if (!nextHasVariants) {
      // switching back to single => wipe variants and their image state
      replace([]);
      setVariantImageKeys({});
    } else {
      // switching to variants => reset product-level price & stock; ensure at least one row
      setValue("price", 0, { shouldValidate: true });
      setValue("stock", 0, { shouldValidate: true });
      if (fields.length === 0) append(makeEmptyVariant());
    }
  };

  const onSubmit = handleSubmit(async values => {
    try {
      const hasVariants = values.hasVariants && values.variants.length > 0;

      if (!hasVariants) {
        if (imageKeys.length < MIN_IMAGES_REQUIRED) {
          showToast(
            "Please upload at least 2 product images when not using variants.",
            "error"
          );
          return;
        }
      } else {
        const variantIds = values.variants.map(v => v.id);
        const missing = variantIds.find(
          id => (variantImageKeys[id] ?? []).length < MIN_IMAGES_REQUIRED
        );
        if (missing !== undefined) {
          showToast(
            "Each variant must have at least 2 images. Please upload images for all variants.",
            "error"
          );
          return;
        }
      }

      const variantsPayload = hasVariants
        ? values.variants.map(v => ({
            name: v.name,
            description: v.description || null,
            price: v.price,
            stock: v.stock,
            images: variantImageKeys[v.id] ?? [],
          }))
        : [];

      const payload = {
        name: values.name,
        slug: values.slug,
        categoryId: values.categoryId,
        productType: values.productType,
        price: hasVariants ? null : (values.price ?? 0),
        stock: hasVariants ? null : values.stock,
        currency: values.currency,
        priceNote: values.priceNote || null,
        shippingNote: values.shippingNote || null,
        sellerName: values.sellerName,
        sizeDescription: values.sizeDescription || null,
        packageDescription: values.packageDescription || null,
        preorderDescription: values.preorderDescription || null,
        images: imageKeys,
        preorder: null,
        variants: variantsPayload,
      };

      await createMutation.mutateAsync(payload);
    } catch {
      // handled in mutation
    }
  });

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fill in the product information below. Images are uploaded via presigned
        URL.
      </Typography>

      <form onSubmit={onSubmit}>
        <Stack spacing={3}>
          {/* Basic info */}
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Basic information
              </Typography>

              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="Product name"
                    placeholder="e.g. Sticker Pack A"
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    fullWidth
                  />

                  <TextField
                    label="Slug"
                    placeholder="sticker-pack-a"
                    value={slug}
                    onChange={e => {
                      setSlugTouched(true);
                      setValue("slug", slugify(e.target.value), {
                        shouldValidate: true,
                      });
                    }}
                    error={!!errors.slug && (slugTouched || !!errors.slug)}
                    helperText={
                      errors.slug?.message ??
                      "Auto-generated from name, you can edit"
                    }
                    fullWidth
                  />
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormControl fullWidth error={!!errors.categoryId}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      label="Category"
                      value={watch("categoryId")}
                      onChange={e =>
                        setValue("categoryId", e.target.value, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <MenuItem value="">Select category</MenuItem>
                      {(categories as Category[]).map(c => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {errors.categoryId?.message}
                    </FormHelperText>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Product type</InputLabel>
                    <Select
                      label="Product type"
                      value={watch("productType")}
                      onChange={e =>
                        setValue(
                          "productType",
                          e.target.value as "in_stock" | "preorder",
                          {
                            shouldValidate: true,
                          }
                        )
                      }
                    >
                      <MenuItem value="in_stock">In stock</MenuItem>
                      <MenuItem value="preorder">Preorder</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Pricing, stock & variants */}
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Pricing, stock & variants
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose a single price/stock for the product, or add variants
                with their own price and stock.
              </Typography>

              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <ToggleButtonGroup
                  value={hasVariants ? "variants" : "single"}
                  exclusive
                  onChange={onToggleMode}
                  size="small"
                >
                  <ToggleButton value="single">Single product</ToggleButton>
                  <ToggleButton value="variants">With variants</ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Price (VND)"
                  type="number"
                  slotProps={{ htmlInput: { min: 0 } }}
                  {...register("price")}
                  error={!!errors.price}
                  helperText={
                    hasVariants
                      ? "Set price per variant below."
                      : errors.price?.message
                  }
                  fullWidth
                  disabled={hasVariants}
                />
                <TextField
                  label="Currency"
                  {...register("currency")}
                  fullWidth
                  disabled
                />
                <TextField
                  label="Stock"
                  type="number"
                  slotProps={{ htmlInput: { min: 0 } }}
                  {...register("stock")}
                  error={!!errors.stock}
                  helperText={
                    hasVariants
                      ? "Set stock per variant below."
                      : errors.stock?.message
                  }
                  fullWidth
                  disabled={hasVariants}
                />
              </Stack>

              <TextField
                label="Price note"
                placeholder="e.g. Price may vary"
                {...register("priceNote")}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Shipping note"
                placeholder="e.g. Free shipping over 100k"
                {...register("shippingNote")}
                fullWidth
                sx={{ mt: 1 }}
              />

              {hasVariants && (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{ mb: 1.5 }}
                  >
                    Variant list
                  </Typography>

                  {/* list-level error from superRefine */}
                  {errors.variants?.message && (
                    <FormHelperText error sx={{ mb: 1 }}>
                      {errors.variants?.message}
                    </FormHelperText>
                  )}

                  {fields.length === 0 ? (
                    <Button
                      variant="outlined"
                      startIcon={<AddRoundedIcon />}
                      onClick={() => append(makeEmptyVariant())}
                    >
                      Add variant
                    </Button>
                  ) : (
                    <Stack spacing={2}>
                      {fields.map((field, index) => {
                        const rowErr = errors.variants?.[index];
                        return (
                          <Paper
                            key={field._key}
                            variant="outlined"
                            sx={{ p: 2, borderRadius: 2 }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ mb: 1.5 }}
                            >
                              <Typography variant="subtitle2">
                                Variant {index + 1}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const id = fields[index].id;
                                  remove(index);
                                  setVariantImageKeys(prev => {
                                    const next = { ...prev };
                                    delete next[id];
                                    return next;
                                  });
                                }}
                              >
                                <RemoveCircleOutlineRoundedIcon />
                              </IconButton>
                            </Stack>

                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={2}
                            >
                              <TextField
                                label="Variant name"
                                placeholder="e.g. Size M"
                                size="small"
                                fullWidth
                                {...register(`variants.${index}.name` as const)}
                                error={!!rowErr?.name}
                                helperText={rowErr?.name?.message}
                              />

                              <TextField
                                label="Description"
                                placeholder="Optional"
                                size="small"
                                fullWidth
                                {...register(
                                  `variants.${index}.description` as const
                                )}
                              />

                              <TextField
                                label="Price (VND)"
                                type="number"
                                size="small"
                                fullWidth
                                slotProps={{ htmlInput: { min: 0 } }}
                                {...register(
                                  `variants.${index}.price` as const
                                )}
                                error={!!rowErr?.price}
                                helperText={rowErr?.price?.message}
                              />

                              <TextField
                                label="Stock"
                                type="number"
                                size="small"
                                fullWidth
                                slotProps={{ htmlInput: { min: 0 } }}
                                {...register(
                                  `variants.${index}.stock` as const
                                )}
                                error={!!rowErr?.stock}
                                helperText={rowErr?.stock?.message}
                              />
                            </Stack>

                            <Box sx={{ mt: 2 }}>
                              <PresignedUploader
                                value={variantImageKeys[field.id] ?? []}
                                onChange={keys =>
                                  setVariantImageKeys(prev => ({
                                    ...prev,
                                    [field.id]: keys,
                                  }))
                                }
                                maxFiles={MAX_VARIANT_IMAGES}
                                maxFileSizeMb={MAX_FILE_SIZE_MB}
                                label="Variant images"
                                helperText={`At least ${MIN_IMAGES_REQUIRED} images (max ${MAX_VARIANT_IMAGES}, ${MAX_FILE_SIZE_MB}MB each)`}
                                buttonLabel="Upload variant images"
                                previewSize={72}
                              />
                            </Box>
                          </Paper>
                        );
                      })}

                      <Button
                        variant="outlined"
                        startIcon={<AddRoundedIcon />}
                        onClick={() => append(makeEmptyVariant())}
                        disabled={fields.length >= 20}
                      >
                        Add another variant
                      </Button>
                    </Stack>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Seller & descriptions */}
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Seller & descriptions
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Seller name"
                  placeholder="Store or brand name"
                  {...register("sellerName")}
                  error={!!errors.sellerName}
                  helperText={errors.sellerName?.message}
                  fullWidth
                />
                <TextField
                  label="Size description"
                  placeholder="Dimensions, size chart..."
                  {...register("sizeDescription")}
                  multiline
                  minRows={2}
                  fullWidth
                />
                <TextField
                  label="Package description"
                  placeholder="What's in the box..."
                  {...register("packageDescription")}
                  multiline
                  minRows={2}
                  fullWidth
                />
                <TextField
                  label="Preorder description"
                  placeholder="For preorder items only"
                  {...register("preorderDescription")}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Product images */}
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <PresignedUploader
                value={imageKeys}
                onChange={setImageKeys}
                maxFiles={MAX_PRODUCT_IMAGES}
                maxFileSizeMb={MAX_FILE_SIZE_MB}
                label="Product images"
                helperText={`Upload via presigned URL (max ${MAX_PRODUCT_IMAGES} images, ${MAX_FILE_SIZE_MB}MB each)`}
                buttonLabel="Upload images"
                previewSize={88}
              />
            </CardContent>
          </Card>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <CircularProgress size={18} sx={{ mr: 1 }} />
                  Creating…
                </>
              ) : (
                "Create product"
              )}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
}
