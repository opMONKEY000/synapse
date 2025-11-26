import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload a PDF file to Supabase storage for a lesson
 */
export async function uploadLessonPDF(
  file: File,
  userId: string,
  lessonId: string
): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `${userId}/${lessonId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("lesson-documents")
    .upload(filePath, file);

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("lesson-documents").getPublicUrl(filePath);

  return publicUrl;
}
