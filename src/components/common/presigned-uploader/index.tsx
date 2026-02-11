import * as React from "react";

import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import { uploadFileViaPresigned } from "@apis/asset.api";
import {
  DEFAULT_ACCEPT,
  DEFAULT_MAX_FILE_SIZE_MB,
  DEFAULT_MAX_FILES,
  DEFAULT_PREFIX,
} from "@constants";
import useToastStore from "@stores/toastStore";
import { getApiErrorMessage, getFileUploadErrorMessage } from "@utils";

export type PresignedUploaderProps = {
  /** Controlled list of storage keys (returned from presigned upload). */
  value: string[];
  /** Called when keys change (after successful upload or remove). */
  onChange: (keys: string[]) => void;
  /** Max number of files (default 10). */
  maxFiles?: number;
  /** Max size per file in MB (default 5). */
  maxFileSizeMb?: number;
  /** Accept attribute for the file input (default image types). */
  accept?: string;
  /** S3/storage prefix for presigned upload (default "products"). */
  prefix?: string;
  /** Label above the upload button. */
  label?: string;
  /** Helper text below the label. */
  helperText?: string;
  /** Error message to show below the button (internal or external). */
  error?: string | null;
  /** Disable the upload button and remove actions. */
  disabled?: boolean;
  /** Button label. */
  buttonLabel?: string;
  /** Size of each preview tile in px (default 88). */
  previewSize?: number;
  /** Optional ref to the underlying file input (e.g. to reset on dialog close). */
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

export default function PresignedUploader({
  value,
  onChange,
  maxFiles = DEFAULT_MAX_FILES,
  maxFileSizeMb = DEFAULT_MAX_FILE_SIZE_MB,
  accept = DEFAULT_ACCEPT,
  prefix = DEFAULT_PREFIX,
  label,
  helperText,
  error: externalError,
  disabled = false,
  buttonLabel = "Upload images",
  previewSize = 88,
  inputRef: externalInputRef,
}: PresignedUploaderProps) {
  const internalInputRef = React.useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef ?? internalInputRef;

  const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;
  const showToast = useToastStore(s => s.showToast);

  const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);
  const [uploadingIndex, setUploadingIndex] = React.useState<number | null>(
    null
  );

  const error = externalError;

  // Keep preview URLs in sync with value; clear when parent resets value
  React.useEffect(() => {
    if (value.length === 0) {
      setPreviewUrls([]);
    }
  }, [value.length]);

  React.useEffect(() => {
    return () => previewUrls.forEach(URL.revokeObjectURL);
  }, [previewUrls]);

  const validateAndUpload = async (files: FileList | null) => {
    if (!files?.length) return;

    let currentKeys = value;

    for (let i = 0; i < files.length; i++) {
      if (currentKeys.length >= maxFiles) {
        showToast(`Maximum ${maxFiles} files allowed.`, "error");
        break;
      }
      const file = files[i];
      const validationError = getFileUploadErrorMessage(
        file,
        maxFileSizeBytes,
        maxFileSizeMb,
        accept
      );
      if (validationError) {
        showToast(validationError, "error");
        break;
      }

      const idx = currentKeys.length;
      setUploadingIndex(idx);
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrls(prev => [
        ...prev.slice(0, idx),
        previewUrl,
        ...prev.slice(idx),
      ]);

      try {
        const key = await uploadFileViaPresigned(file, {
          fileName: file.name,
          contentType: file.type,
          prefix,
        });
        currentKeys = [...currentKeys, key];
        onChange(currentKeys);
      } catch (e) {
        // Axios errors are already shown by clientAxios interceptor; only toast non-axios errors (e.g. S3 upload failure)
        const isAxiosError = e && typeof e === "object" && "response" in e;
        if (!isAxiosError) {
          showToast(getApiErrorMessage(e), "error");
        }
        setPreviewUrls(prev => prev.filter((_, j) => j !== idx));
        URL.revokeObjectURL(previewUrl);
        break;
      } finally {
        setUploadingIndex(null);
      }
    }
  };

  const removeAt = (index: number) => {
    const url = previewUrls[index];
    if (url) URL.revokeObjectURL(url);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    onChange(value.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndUpload(e.target.files);
    e.target.value = "";
  };

  return (
    <Box>
      {label && (
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
          {label}
        </Typography>
      )}
      {helperText && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {helperText}
        </Typography>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={handleInputChange}
      />
      <Button
        variant="outlined"
        startIcon={<CloudUploadRoundedIcon />}
        onClick={() => inputRef.current?.click()}
        disabled={
          disabled || value.length >= maxFiles || uploadingIndex !== null
        }
        size="medium"
      >
        {uploadingIndex !== null ? "Uploading…" : buttonLabel}
      </Button>
      {error && (
        <Typography
          variant="caption"
          color="error"
          display="block"
          sx={{ mt: 0.5 }}
        >
          {error}
        </Typography>
      )}
      {(value.length > 0 || previewUrls.length > 0) && (
        <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 2 }}>
          {Array.from(
            { length: Math.max(value.length, previewUrls.length) },
            (_, index) => (
              <Box
                key={index < value.length ? value[index] : `uploading-${index}`}
                sx={{
                  position: "relative",
                  width: previewSize,
                  height: previewSize,
                  borderRadius: 1.5,
                  overflow: "hidden",
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "action.hover",
                }}
              >
                {uploadingIndex === index ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size={28} />
                  </Box>
                ) : (
                  previewUrls[index] && (
                    <img
                      src={previewUrls[index]}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )
                )}
                <IconButton
                  size="small"
                  onClick={() => removeAt(index)}
                  disabled={disabled || uploadingIndex === index}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    bgcolor: "background.paper",
                    "&:hover": { bgcolor: "action.selected" },
                    width: 28,
                    height: 28,
                  }}
                  aria-label="Remove"
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            )
          )}
        </Stack>
      )}
    </Box>
  );
}
