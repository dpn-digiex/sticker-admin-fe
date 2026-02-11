export const slugify = (input: string): string => {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const getApiErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const res = (error as { response?: { data?: { message?: string } } })
      .response;
    if (res?.data?.message) return res.data.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};

export const getFileUploadErrorMessage = (
  file: File,
  maxFileSizeBytes: number,
  maxFileSizeMb: number,
  accept: string
): string | null => {
  if (!file.type.startsWith("image/") && accept.includes("image")) {
    return "Only image files (JPEG, PNG, GIF, WebP) are allowed.";
  }
  if (file.size > maxFileSizeBytes) {
    return `Each file must be under ${maxFileSizeMb}MB.`;
  }
  return null;
};

export const getS3UploadErrorMessage = (errText: string): string => {
  const raw = errText;
  const pick = (tag: string) =>
    raw.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"))?.[1]?.trim();

  const code = pick("Code");
  const msg = pick("Message");

  // Build a clean, short message
  let clean =
    msg ||
    raw
      .replace(/<[^>]*>/g, " ") // strip HTML/XML tags
      .replace(/\s+/g, " ")
      .trim() ||
    "Unknown error";

  if (code && !clean.startsWith("[")) clean = `[${code}] ${clean}`;
  if (clean.length > 220) clean = clean.slice(0, 219) + "…";
  return `S3 upload failed (${clean}`;
};
