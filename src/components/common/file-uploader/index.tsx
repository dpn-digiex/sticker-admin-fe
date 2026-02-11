import * as React from "react";

import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";

import {
  DEFAULT_ACCEPT,
  DEFAULT_MAX_FILE_SIZE_MB,
  DEFAULT_MAX_FILES,
} from "@constants";
import useToastStore from "@stores/toastStore";
import { getFileUploadErrorMessage } from "@utils/index";

export type FileUploaderProps = {
  /** Controlled list of files. */
  value: File[];
  /** Called when the user adds or removes files. */
  onChange: (files: File[]) => void;
  /** Max number of files (default 5). */
  maxFiles?: number;
  /** Max size per file in MB (default 5). */
  maxFileSizeMb?: number;
  /** Accept attribute for the file input (default image types). */
  accept?: string;
  /** Label above the upload button. */
  label?: string;
  /** Error message to show below the button. */
  error?: string | null;
  /** Disable the upload button and remove actions. */
  disabled?: boolean;
  /** Button label. */
  buttonLabel?: string;
  /** Size of each preview tile in px (default 72). */
  previewSize?: number;
  /** Optional ref to reset the underlying input (e.g. clear on dialog close). */
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

export default function FileUploader({
  value,
  onChange,
  maxFiles = DEFAULT_MAX_FILES,
  maxFileSizeMb = DEFAULT_MAX_FILE_SIZE_MB,
  accept = DEFAULT_ACCEPT,
  label,
  error: externalError,
  disabled = false,
  buttonLabel = "Upload images",
  previewSize = 72,
  inputRef: externalInputRef,
}: FileUploaderProps) {
  const internalInputRef = React.useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef ?? internalInputRef;

  const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;
  const showToast = useToastStore(s => s.showToast);
  const error = externalError;

  const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);

  React.useEffect(() => {
    const urls = value.map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [value]);

  const validateAndAddFiles = (files: FileList | null) => {
    if (!files?.length) return;

    const next = [...value];
    for (let i = 0; i < files.length; i++) {
      if (next.length >= maxFiles) {
        showToast(`Maximum ${maxFiles} files allowed.`, "error");
        break;
      }
      const file = files[i];
      const msg = getFileUploadErrorMessage(
        file,
        maxFileSizeBytes,
        maxFileSizeMb,
        accept
      );
      if (msg) {
        showToast(msg, "error");
        break;
      }
      next.push(file);
    }
    onChange(next.slice(0, maxFiles));
  };

  const removeFile = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={handleInputChange}
      />
      <Button
        variant="outlined"
        startIcon={<CloudUploadRoundedIcon />}
        onClick={() => inputRef.current?.click()}
        disabled={disabled || value.length >= maxFiles}
        size="medium"
      >
        {buttonLabel}
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
      {value.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
          {value.map((file, index) => (
            <Box
              key={`${file.name}-${index}-${file.size}`}
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
              <img
                src={previewUrls[index]}
                alt={file.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <IconButton
                size="small"
                onClick={() => removeFile(index)}
                disabled={disabled}
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "action.selected" },
                  width: 24,
                  height: 24,
                }}
                aria-label="Remove file"
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
