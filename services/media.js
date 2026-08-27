import { api } from './api';

function guessFileName(uri, fallbackExt) {
  const parts = uri.split('/');
  const last = parts[parts.length - 1];
  return last?.includes('.') ? last : `upload.${fallbackExt}`;
}

export async function uploadMedia({ uri, type, onProgress }) {
  const isVideo = type === 'video';
  const mimeType = isVideo ? 'video/mp4' : 'image/jpeg';

  const formData = new FormData();
  formData.append('file', {
    uri,
    name: guessFileName(uri, isVideo ? 'mp4' : 'jpg'),
    type: mimeType,
  });

  const { data } = await api.post('/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(event.loaded / event.total);
    },
  });

  return data.url;
}
