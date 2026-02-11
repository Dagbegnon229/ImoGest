import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Supabase Storage helpers ─────────────────────────────────────────────────

/**
 * Upload a file to Supabase Storage.
 * @param bucket - The storage bucket name ('application-docs' | 'message-attachments' | 'documents')
 * @param path   - File path inside the bucket (e.g. 'APP-0001/piece_identite.pdf')
 * @param file   - The File object from <input type="file">
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
): Promise<{ url: string; size: number }> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return {
    url: urlData.publicUrl,
    size: file.size,
  };
}

/**
 * Upload multiple files to Supabase Storage.
 * @returns Array of { name, url, size, type }
 */
export async function uploadMultipleFiles(
  bucket: string,
  basePath: string,
  files: File[],
): Promise<{ name: string; url: string; size: number; type: string }[]> {
  const results: { name: string; url: string; size: number; type: string }[] = [];

  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${basePath}/${Date.now()}_${safeName}`;
    const { url, size } = await uploadFile(bucket, filePath, file);
    results.push({ name: file.name, url, size, type: file.type });
  }

  return results;
}

/**
 * Get the public URL of an existing file.
 */
export function getFilePublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
