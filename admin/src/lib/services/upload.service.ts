/**
 * Upload Service
 * Sends image files to the backend, which stores them in Cloudflare R2 and
 * returns the public URL that gets persisted in the database.
 *
 * Replaces the previous direct browser -> Cloudinary uploads.
 */

import apiClient from '../api/client';

export type UploadFolder =
  | 'products'
  | 'doctors'
  | 'blogs'
  | 'specializations'
  | 'hero'
  | 'misc';

interface SingleUploadResponse {
  success: boolean;
  url: string;
  key: string;
}

interface MultipleUploadResponse {
  success: boolean;
  urls: string[];
  items: { url: string; key: string }[];
}

/**
 * Upload a single image to R2 via the backend. Returns the public URL.
 */
export async function uploadImageToR2(
  file: File,
  folder: UploadFolder = 'misc'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  // Let the browser/axios set the multipart boundary; overriding the default
  // JSON content-type header is required here.
  const response = await apiClient.post<SingleUploadResponse>(
    '/api/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return response.data.url;
}

/**
 * Upload multiple images to R2 via the backend. Returns public URLs in order.
 */
export async function uploadMultipleImagesToR2(
  files: File[],
  folder: UploadFolder = 'misc'
): Promise<string[]> {
  if (files.length === 0) return [];

  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('folder', folder);

  const response = await apiClient.post<MultipleUploadResponse>(
    '/api/upload/multiple',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return response.data.urls;
}
