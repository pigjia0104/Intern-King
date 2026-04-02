import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = "resumes";

export async function uploadFile(
  userId: string, fileName: string, file: Buffer, contentType: string
): Promise<string> {
  const ext = fileName.split(".").pop() || "";
  const safeName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const path = `${userId}/${safeName}`;
  const { error } = await supabase.storage
    .from(BUCKET).upload(path, file, { contentType, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
}

export async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET).createSignedUrl(path, 600);
  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
