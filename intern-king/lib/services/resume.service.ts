import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/storage/supabase";

const MAX_TEXT_LENGTH = 3000;

export async function getResumeText(resumeId: string): Promise<string> {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new Error("Resume not found");

  if (resume.parsedText) {
    return resume.parsedText.slice(0, MAX_TEXT_LENGTH);
  }

  const { data, error } = await supabase.storage
    .from("resumes").download(resume.fileUrl);
  if (error || !data) throw new Error("Failed to download resume file");

  const buffer = Buffer.from(await data.arrayBuffer());
  let text: string;

  if (resume.fileType === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    text = result.text;
  } else if (resume.fileType === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new Error(`Unsupported file type: ${resume.fileType}`);
  }

  text = text.replace(/\s+/g, " ").trim();

  await prisma.resume.update({
    where: { id: resumeId },
    data: { parsedText: text },
  });

  return text.slice(0, MAX_TEXT_LENGTH);
}
