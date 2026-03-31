import { NextRequest } from "next/server";
import { requireUser } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage/supabase";
import { apiSuccess, apiError } from "@/lib/utils/api";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_RESUMES_PER_USER = 10;

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const count = await prisma.resume.count({ where: { userId: user.id } });
    if (count >= MAX_RESUMES_PER_USER) {
      return apiError("LIMIT", `最多上传 ${MAX_RESUMES_PER_USER} 份简历`, 400);
    }
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return apiError("VALIDATION", "请选择文件", 400);
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError("VALIDATION", "仅支持 PDF 和 Word 格式", 400);
    }
    if (file.size > MAX_FILE_SIZE) {
      return apiError("VALIDATION", "文件大小不能超过 10MB", 400);
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type.includes("pdf") ? "pdf" : "docx";
    const fileUrl = await uploadFile(user.id, file.name, buffer, file.type);
    const resume = await prisma.resume.create({
      data: { userId: user.id, fileName: file.name, fileUrl, fileType },
    });
    return apiSuccess(resume, 201);
  } catch {
    return apiError("INTERNAL", "上传失败", 500);
  }
}
