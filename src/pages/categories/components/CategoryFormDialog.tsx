import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";

import FileUploader from "@components/common/file-uploader";
import { slugify } from "@utils";

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
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CategoryFormSubmitPayload) => Promise<void> | void;
};

export default function CategoryFormDialog({ open, onClose, onSubmit }: Props) {
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
  const [images, setImages] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-generate slug from name until user edits slug manually
  React.useEffect(() => {
    if (!slugTouched)
      setValue("slug", slugify(name || ""), {
        shouldValidate: (name || "").length > 0,
      });
  }, [name, setValue, slugTouched]);

  React.useEffect(() => {
    if (!open) {
      reset();
      setSlugTouched(false);
      setImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open, reset]);

  const submit = handleSubmit(async values => {
    try {
      await onSubmit({ ...values, images });
      onClose();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Category</DialogTitle>

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

          <FileUploader
            value={images}
            onChange={setImages}
            maxFiles={MAX_IMAGES}
            maxFileSizeMb={MAX_FILE_SIZE_MB}
            label={`Images (max ${MAX_IMAGES}, ${MAX_FILE_SIZE_MB}MB each)`}
            inputRef={fileInputRef}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} disabled={isSubmitting}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
