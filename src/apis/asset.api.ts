import { axiosPrivate } from "@apis/clientAxios";
import { getS3UploadErrorMessage } from "@utils/index";

export type PresignedUploadPayload = {
  fileName: string;
  contentType: string;
  prefix?: string;
};

export type PresignedUploadResponse = {
  uploadUrl: string;
  key: string;
  expiresIn: number;
};

export async function getPresignedUploadUrl(
  payload: PresignedUploadPayload
): Promise<PresignedUploadResponse> {
  const res = await axiosPrivate.post<{
    data?: PresignedUploadResponse;
    uploadUrl?: string;
    key?: string;
    expiresIn?: number;
  }>("/assets/presigned-upload", payload);
  const data = res.data?.data ?? res.data;
  return {
    uploadUrl: data.uploadUrl || "",
    key: data.key || "",
    expiresIn: data.expiresIn ?? 0,
  };
}

/** Upload a file using presigned URL; returns the storage key to store in DB. */
export async function uploadFileViaPresigned(
  file: File,
  payload: { fileName: string; contentType: string; prefix?: string }
): Promise<string> {
  const { uploadUrl, key } = await getPresignedUploadUrl({
    fileName: payload.fileName,
    contentType: payload.contentType,
    prefix: payload.prefix ?? "products",
  });
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": payload.contentType,
    },
  });

  if (!putRes.ok) {
    // S3 often returns useful text/xml on error
    const errText = await putRes.text().catch(() => "");
    throw new Error(getS3UploadErrorMessage(errText));
  }
  return key;
}
