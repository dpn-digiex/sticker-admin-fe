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
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { deleteCategoryAsset } from "@apis/category.api";
import FileUploader from "@components/common/file-uploader";
import useToastStore, { type ToastState } from "@stores/toastStore";
import type { Category } from "@types";
import { slugify } from "@utils";
import { envConfig } from "@utils/envConfig";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE_MB = 5;

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof schema>;

export type CategoryFormSubmitPayload = CategoryFormValues & {
  images: File[];
  /** When editing: existing image keys to keep (user can remove from list). */
  existingImageKeys?: string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  initialCategory?: Category | null;
  onSubmit: (
    payload: CategoryFormSubmitPayload,
    categoryId?: string
  ) => Promise<void> | void;
};

const QUERY_KEY_CATEGORIES = ["categories"] as const;

export default function CategoryFormDialog({
  open,
  onClose,
  initialCategory = null,
  onSubmit,
}: Props) {
  const isEdit = !!initialCategory;
  const queryClient = useQueryClient();
  const showToast = useToastStore((s: ToastState) => s.showToast);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", description: "" },
  });

  const name = watch("name");
  const slug = watch("slug");

  const [slugTouched, setSlugTouched] = React.useState(false);
  /** Existing image keys (from API) – edit mode only; user can remove. */
  const [existingImageKeys, setExistingImageKeys] = React.useState<string[]>([]);
  /** New files to upload (create: all images; edit: additional only). */
  const [newImages, setNewImages] = React.useState<File[]>([]);
  const [removingIndex, setRemovingIndex] = React.useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const removeExistingImage = async (index: number) => {
    const key = existingImageKeys[index];
    if (!initialCategory?.id || key == null) return;
    setRemovingIndex(index);
    try {
      await deleteCategoryAsset(initialCategory.id, key);
      setExistingImageKeys(prev => prev.filter((_, i) => i !== index));
      showToast("Image removed.", "success");
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_CATEGORIES });
    } catch {
      showToast("Failed to remove image.", "error");
    } finally {
      setRemovingIndex(null);
    }
  };

  // Auto-generate slug from name until user edits slug manually
  React.useEffect(() => {
    if (!slugTouched)
      setValue("slug", slugify(name || ""), {
        shouldValidate: (name || "").length > 0,
      });
  }, [name, setValue, slugTouched]);

  React.useEffect(() => {
    if (!open) {
      reset({ name: "", slug: "", description: "" });
      setSlugTouched(false);
      setExistingImageKeys([]);
      setNewImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else if (initialCategory) {
      reset({
        name: initialCategory.name,
        slug: initialCategory.slug,
        description: initialCategory.description ?? "",
      });
      setSlugTouched(true);
      setExistingImageKeys(initialCategory.images ?? []);
      setNewImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      setExistingImageKeys([]);
      setNewImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open, initialCategory, reset]);

  const submit = handleSubmit(async values => {
    try {
      await onSubmit(
        {
          ...values,
          images: newImages,
          ...(isEdit && { existingImageKeys }),
        },
        initialCategory ? initialCategory.id : undefined
      );
      onClose();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            placeholder="Outfit & Doll"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            autoFocus
          />

          <TextField
            label="Slug"
            placeholder="outfit-doll"
            value={slug}
            onChange={e => {
              setSlugTouched(true);
              setValue("slug", slugify(e.target.value), {
                shouldValidate: true,
              });
            }}
            error={!!errors.slug && (slugTouched || isSubmitted)}
            helperText={
              slugTouched || isSubmitted
                ? errors.slug?.message ||
                  "Auto-generated from name, you can edit"
                : "Auto-generated from name, you can edit"
            }
          />

          <TextField
            label="Description"
            placeholder="Optional description"
            {...register("description")}
            error={!!errors.description}
            helperText={errors.description?.message}
            multiline
            minRows={3}
          />

          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{ mb: 1 }}
              >
                Category images
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {isEdit
                  ? "Remove images below or add more (max " +
                    MAX_IMAGES +
                    " total)."
                  : `Upload images (max ${MAX_IMAGES}, ${MAX_FILE_SIZE_MB}MB each).`}
              </Typography>

              {isEdit && existingImageKeys.length > 0 && (
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  gap={1.5}
                  sx={{ mb: 2 }}
                >
                  {existingImageKeys.map((key, index) => (
                    <Box
                      key={`existing-${index}-${key.slice(-12)}`}
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
                        src={`${envConfig.assetBaseUrl}/${key}`}
                        alt={`Category ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          opacity: removingIndex === index ? 0.6 : 1,
                        }}
                      />
                      {removingIndex === index && (
                        <CircularProgress
                          size={24}
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                      )}
                      <IconButton
                        size="small"
                        onClick={() => removeExistingImage(index)}
                        disabled={removingIndex !== null}
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

              {(isEdit
                ? MAX_IMAGES - existingImageKeys.length - newImages.length > 0
                : true) && (
                <FileUploader
                  value={newImages}
                  onChange={setNewImages}
                  maxFiles={
                    isEdit
                      ? MAX_IMAGES -
                        existingImageKeys.length -
                        newImages.length
                      : MAX_IMAGES
                  }
                  maxFileSizeMb={MAX_FILE_SIZE_MB}
                  label={
                    isEdit
                      ? "Add more images"
                      : `Images (max ${MAX_IMAGES}, ${MAX_FILE_SIZE_MB}MB each)`
                  }
                  inputRef={fileInputRef}
                />
              )}
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} disabled={isSubmitting}>
          {isEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
