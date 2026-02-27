import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { fetchCategories } from "@apis/category.api";
import { fetchProductById, updateProduct } from "@apis/product.api";
import PresignedUploader from "@components/common/presigned-uploader";
import { MAX_PRODUCT_IMAGES } from "@constants";
import useToastStore, { type ToastState } from "@stores/toastStore";
import type { Category } from "@types";
import { slugify } from "@utils";
import { envConfig } from "@utils/envConfig";

const MAX_FILE_SIZE_MB = 5;

const updateProductSchema = z.object({
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
});

type UpdateProductFormValues = z.infer<typeof updateProductSchema>;

const QUERY_KEY = {
  categories: ["categories"] as const,
  product: (id: string) => ["product", id] as const,
};

export type ProductUpdateModalProps = {
  open: boolean;
  productId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function ProductUpdateModal({
  open,
  productId,
  onClose,
  onSuccess,
}: ProductUpdateModalProps) {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s: ToastState) => s.showToast);
  const [slugTouched, setSlugTouched] = React.useState(false);
  /** Existing image keys/URLs from API – user can remove. */
  const [existingImages, setExistingImages] = React.useState<string[]>([]);
  /** New keys from presigned upload (under products/{id}/). */
  const [newImageKeys, setNewImageKeys] = React.useState<string[]>([]);

  const { data: categories = [] } = useQuery({
    queryKey: QUERY_KEY.categories,
    queryFn: fetchCategories,
    staleTime: 30_000,
  });

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: QUERY_KEY.product(productId ?? ""),
    queryFn: () => fetchProductById(productId!),
    enabled: open && !!productId,
    staleTime: 0,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
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
    },
  });

  const name = watch("name");
  const slug = watch("slug");

  React.useEffect(() => {
    if (!slugTouched && name) {
      setValue("slug", slugify(name), { shouldValidate: true });
    }
  }, [name, setValue, slugTouched]);

  React.useEffect(() => {
    if (!product) return;
    reset({
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      productType: product.productType,
      price: product.price ?? 0,
      stock: product.stock ?? 0,
      currency: product.currency,
      priceNote: product.priceNote ?? "",
      shippingNote: product.shippingNote ?? "",
      sellerName: product.sellerName,
      sizeDescription: product.sizeDescription ?? "",
      packageDescription: product.packageDescription ?? "",
      preorderDescription: product.preorderDescription ?? "",
    });
    setExistingImages(
      product.images?.map(image => `${envConfig.assetBaseUrl}/${image}`) ?? []
    );
    setNewImageKeys([]);
    setSlugTouched(false);
  }, [product, reset]);

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof updateProduct>[1];
    }) => updateProduct(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEY.product(productId),
        });
      }
      showToast("Product updated successfully.", "success");
      onSuccess?.();
      onClose();
    },
  });

  const handleSave = handleSubmit(async values => {
    if (!productId) return;
    const images = [...existingImages, ...newImageKeys];
    await updateMutation.mutateAsync({
      id: productId,
      body: {
        name: values.name,
        slug: values.slug,
        categoryId: values.categoryId,
        productType: values.productType,
        price: values.price ?? null,
        stock: values.stock,
        currency: values.currency,
        priceNote: values.priceNote || null,
        shippingNote: values.shippingNote || null,
        sellerName: values.sellerName,
        sizeDescription: values.sizeDescription || null,
        packageDescription: values.packageDescription || null,
        preorderDescription: values.preorderDescription || null,
        images,
      },
    });
  });

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const maxNewUploads = Math.max(
    0,
    MAX_PRODUCT_IMAGES - existingImages.length - newImageKeys.length
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>Update product</DialogTitle>
      <DialogContent>
        {isLoadingProduct && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 3 }}>
            <CircularProgress size={24} />
            <Typography color="text.secondary">Loading product…</Typography>
          </Stack>
        )}

        {!isLoadingProduct && product && (
          <Box component="form" onSubmit={handleSave} sx={{ pt: 1 }}>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Product name"
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Slug"
                  value={slug}
                  onChange={e => {
                    setSlugTouched(true);
                    setValue("slug", slugify(e.target.value), {
                      shouldValidate: true,
                    });
                  }}
                  error={!!errors.slug}
                  helperText={errors.slug?.message}
                  fullWidth
                  size="small"
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl fullWidth size="small" error={!!errors.categoryId}>
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
                  <FormHelperText>{errors.categoryId?.message}</FormHelperText>
                </FormControl>
                <FormControl fullWidth size="small">
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

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Price (VND)"
                  type="number"
                  size="small"
                  slotProps={{ htmlInput: { min: 0 } }}
                  {...register("price")}
                  error={!!errors.price}
                  helperText={errors.price?.message}
                  fullWidth
                />
                <TextField
                  label="Currency"
                  {...register("currency")}
                  fullWidth
                  size="small"
                  disabled
                />
                <TextField
                  label="Stock"
                  type="number"
                  size="small"
                  slotProps={{ htmlInput: { min: 0 } }}
                  {...register("stock")}
                  error={!!errors.stock}
                  helperText={errors.stock?.message}
                  fullWidth
                />
              </Stack>

              <TextField
                label="Price note"
                size="small"
                {...register("priceNote")}
                fullWidth
              />
              <TextField
                label="Shipping note"
                size="small"
                {...register("shippingNote")}
                fullWidth
              />
              <TextField
                label="Seller name"
                size="small"
                {...register("sellerName")}
                error={!!errors.sellerName}
                helperText={errors.sellerName?.message}
                fullWidth
              />
              <TextField
                label="Size description"
                size="small"
                multiline
                minRows={2}
                {...register("sizeDescription")}
                fullWidth
              />
              <TextField
                label="Package description"
                size="small"
                multiline
                minRows={2}
                {...register("packageDescription")}
                fullWidth
              />
              <TextField
                label="Preorder description"
                size="small"
                multiline
                minRows={2}
                {...register("preorderDescription")}
                fullWidth
              />

              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 1 }}
                  >
                    Product images
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Remove images below or add more (max {MAX_PRODUCT_IMAGES}{" "}
                    total).
                  </Typography>

                  {existingImages.length > 0 && (
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={1.5}
                      sx={{ mb: 2 }}
                    >
                      {existingImages.map((src, index) => (
                        <Box
                          key={`existing-${index}-${src.slice(-12)}`}
                          sx={{
                            position: "relative",
                            width: 88,
                            height: 88,
                            borderRadius: 1.5,
                            overflow: "hidden",
                            border: 1,
                            borderColor: "divider",
                            bgcolor: "action.hover",
                          }}
                        >
                          <img
                            src={src}
                            alt={`Product ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeExistingImage(index)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              bgcolor: "background.paper",
                              "&:hover": { bgcolor: "action.selected" },
                              width: 28,
                              height: 28,
                            }}
                            aria-label="Remove image"
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  )}

                  {maxNewUploads > 0 && (
                    <PresignedUploader
                      value={newImageKeys}
                      onChange={setNewImageKeys}
                      maxFiles={maxNewUploads}
                      maxFileSizeMb={MAX_FILE_SIZE_MB}
                      prefix={`products/${productId}`}
                      label="Add more images"
                      helperText={`Upload new images (max ${maxNewUploads} more, ${MAX_FILE_SIZE_MB}MB each)`}
                      buttonLabel="Upload images"
                      previewSize={72}
                    />
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Box>
        )}
      </DialogContent>
      {!isLoadingProduct && product && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSubmitting || updateMutation.isPending}
            startIcon={
              updateMutation.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
          >
            {updateMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
