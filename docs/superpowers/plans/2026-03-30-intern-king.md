# 实习小霸王 (Intern King) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack internship job platform with job listings, AI resume review, and user management.

**Architecture:** Next.js 15+ App Router monolith with clean API/service/DB layering. Clerk for auth, Supabase PostgreSQL + Prisma ORM for data, Supabase Storage for file uploads, DeepSeek for AI review, Tavily for interview experience search.

**Tech Stack:** Next.js 15+, TypeScript, Prisma, Clerk, Supabase, DeepSeek API, Tavily API, shadcn/ui, Tailwind CSS

---

## File Structure

All paths relative to project root `intern-king/`.

### New Files to Create

**Config & Schema:**
- `prisma/schema.prisma` — Prisma data model (User, Resume, Job, Favorite, Review)
- `middleware.ts` — Clerk route protection
- `.env.local` — Environment variables (template)
- `tailwind.config.ts` — Dark theme + flame orange custom color
- `lib/prisma.ts` — Prisma client singleton

**Types & Utilities:**
- `types/index.ts` — Shared TypeScript types (API responses, domain models)
- `lib/utils/api.ts` — API response helpers (success, error, pagination)
- `lib/utils/auth.ts` — Get current DB user from Clerk session

**Services:**
- `lib/services/job.service.ts` — Job CRUD + list with filters
- `lib/services/favorite.service.ts` — Favorite toggle + list
- `lib/services/resume.service.ts` — Resume upload/delete/list + parsing
- `lib/services/search.service.ts` — Tavily search + DeepSeek relevance filter
- `lib/services/review.service.ts` — Full review workflow orchestrator

**AI & Storage:**
- `lib/ai/deepseek.ts` — DeepSeek API client
- `lib/ai/prompts.ts` — All prompt templates
- `lib/storage/supabase.ts` — Supabase Storage client

**API Routes:**
- `app/api/webhooks/clerk/route.ts` — Clerk webhook (user sync)
- `app/api/user/profile/route.ts` — User profile + stats
- `app/api/jobs/route.ts` — GET job list
- `app/api/jobs/[id]/route.ts` — GET job detail
- `app/api/admin/jobs/route.ts` — POST create job
- `app/api/admin/jobs/[id]/route.ts` — PUT update job
- `app/api/admin/jobs/[id]/toggle/route.ts` — PATCH toggle active
- `app/api/favorites/route.ts` — GET list, POST add
- `app/api/favorites/[jobId]/route.ts` — DELETE remove
- `app/api/resumes/route.ts` — GET list
- `app/api/resumes/upload/route.ts` — POST upload
- `app/api/resumes/[id]/route.ts` — DELETE remove
- `app/api/resumes/[id]/url/route.ts` — GET signed download URL
- `app/api/reviews/route.ts` — GET list, POST create
- `app/api/reviews/[id]/route.ts` — GET status/result

**Pages:**
- `app/page.tsx` — Landing page
- `app/layout.tsx` — Root layout (ClerkProvider, theme)
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx` — Clerk sign-in
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx` — Clerk sign-up
- `app/(auth)/layout.tsx` — Auth pages layout (centered)
- `app/(main)/layout.tsx` — Main app layout (sidebar + content)
- `app/(main)/jobs/page.tsx` — Jobs listing page
- `app/(main)/review/page.tsx` — AI review page
- `app/(main)/profile/page.tsx` — Profile page

**Components:**
- `components/layout/sidebar.tsx` — Main sidebar navigation
- `components/layout/mobile-nav.tsx` — Mobile bottom navigation
- `components/jobs/job-table.tsx` — Jobs data table
- `components/jobs/job-filters.tsx` — Search + filter controls
- `components/review/review-input.tsx` — Job info + resume selector + submit
- `components/review/review-result.tsx` — Score ring + roasts + suggestions + questions
- `components/review/score-ring.tsx` — Circular score display
- `components/profile/resume-card.tsx` — Resume file card
- `components/profile/review-history-item.tsx` — Review history list item
- `components/profile/upload-resume-dialog.tsx` — Upload dialog

**Scripts:**
- `prisma/seed.ts` — Seed job data for development

---

## Phase 1: Project Foundation (Tasks 1-4)

### Task 1: Project Scaffolding

**Files:**
- Create: `intern-king/` (via create-next-app)
- Create: `.env.local`
- Modify: `package.json` (add dependencies)

- [ ] **Step 1: Initialize git repository**

```bash
cd /d/Intern-King
git init
git add 产品PRD.md mockups/ docs/
git commit -m "docs: add PRD, wireframe mockup, and technical spec"
```

- [ ] **Step 2: Create Next.js project**

```bash
cd /d/Intern-King
npx create-next-app@latest intern-king --typescript --tailwind --eslint --app --src=false --import-alias "@/*" --use-npm
```

When prompted:
- Would you like to use Turbopack? → Yes

- [ ] **Step 3: Install core dependencies**

```bash
cd /d/Intern-King/intern-king
npm install @clerk/nextjs @prisma/client @supabase/supabase-js
npm install prisma --save-dev
```

- [ ] **Step 4: Install UI dependencies**

```bash
cd /d/Intern-King/intern-king
npx shadcn@latest init -d
npm install lucide-react
```

When shadcn init asks, choose:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

- [ ] **Step 5: Install utility dependencies**

```bash
cd /d/Intern-King/intern-king
npm install pdf-parse mammoth svix
npm install @types/pdf-parse --save-dev
```

- [ ] **Step 6: Create environment template**

Create `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/jobs
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/jobs

# Database (Supabase)
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# AI
DEEPSEEK_API_KEY=sk-xxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Search
TAVILY_API_KEY=tvly-xxxxx

# Admin
ADMIN_API_KEY=your-admin-secret-key
```

- [ ] **Step 7: Verify project runs**

```bash
cd /d/Intern-King/intern-king
npm run dev
```

Expected: Server starts at http://localhost:3000, default Next.js page loads.

- [ ] **Step 8: Commit**

```bash
cd /d/Intern-King
git add intern-king/
git commit -m "feat: scaffold Next.js project with core dependencies"
```

---

### Task 2: Prisma Schema & Database Setup

**Files:**
- Create: `intern-king/prisma/schema.prisma`
- Create: `intern-king/lib/prisma.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
cd /d/Intern-King/intern-king
npx prisma init
```

- [ ] **Step 2: Write the Prisma schema**

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  name      String?
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  resumes   Resume[]
  favorites Favorite[]
  reviews   Review[]
}

model Resume {
  id         String   @id @default(cuid())
  userId     String
  fileName   String
  fileUrl    String
  fileType   String
  parsedText String?  @db.Text
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  reviews Review[]

  @@index([userId])
}

model Job {
  id          String    @id @default(cuid())
  company     String
  title       String
  type        String
  location    String
  category    String
  description String    @db.Text
  applyUrl    String?
  source      String    @default("manual")
  publishedAt DateTime?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  favorites Favorite[]
  reviews   Review[]

  @@index([company])
  @@index([location])
  @@index([category])
  @@index([type])
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  jobId     String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  job  Job  @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@unique([userId, jobId])
}

model Review {
  id            String   @id @default(cuid())
  userId        String
  jobId         String
  resumeId      String
  status        String   @default("pending")
  score         Int?
  content       String?  @db.Text
  searchContext String?  @db.Text
  errorMessage  String?
  createdAt     DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  job    Job    @relation(fields: [jobId], references: [id], onDelete: Cascade)
  resume Resume @relation(fields: [resumeId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([jobId])
}
```

- [ ] **Step 3: Create Prisma singleton**

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Generate Prisma client and push schema**

```bash
cd /d/Intern-King/intern-king
npx prisma generate
npx prisma db push
```

Expected: Schema synced to Supabase PostgreSQL, Prisma client generated.

- [ ] **Step 5: Verify with Prisma Studio**

```bash
cd /d/Intern-King/intern-king
npx prisma studio
```

Expected: Opens browser showing all 5 tables (User, Resume, Job, Favorite, Review) with correct columns.

- [ ] **Step 6: Commit**

```bash
cd /d/Intern-King
git add intern-king/prisma/ intern-king/lib/prisma.ts
git commit -m "feat: add Prisma schema with all data models"
```

---

### Task 3: Shared Types & API Utilities

**Files:**
- Create: `intern-king/types/index.ts`
- Create: `intern-king/lib/utils/api.ts`

- [ ] **Step 1: Define shared TypeScript types**

Create `types/index.ts`:

```typescript
// ===== API Response Types =====

export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// ===== Domain Types =====

export interface JobItem {
  id: string;
  company: string;
  title: string;
  type: string;
  location: string;
  category: string;
  description: string;
  applyUrl: string | null;
  publishedAt: string | null;
  isFavorited: boolean;
}

export interface ResumeItem {
  id: string;
  fileName: string;
  fileType: string;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  score: number | null;
  jobTitle: string;
  jobCompany: string;
  resumeFileName: string;
  createdAt: string;
}

export interface ReviewResult {
  score: number;
  summary: string;
  roasts: Array<{
    point: string;
    detail: string;
    severity: "critical" | "warning" | "info";
  }>;
  suggestions: Array<{
    title: string;
    detail: string;
  }>;
  interviewQuestions: string[];
  sourcesUsed: string;
}

export interface ReviewDetail {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  score: number | null;
  content: ReviewResult | null;
  errorMessage: string | null;
  createdAt: string;
  job: { company: string; title: string; type: string; location: string };
  resume: { fileName: string };
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  stats: {
    resumeCount: number;
    reviewCount: number;
    favoriteCount: number;
  };
}

// ===== Filter Types =====

export interface JobFilters {
  search?: string;
  location?: string;
  type?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}
```

- [ ] **Step 2: Create API response helpers**

Create `lib/utils/api.ts`:

```typescript
import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function apiList<T>(data: T[], pagination: { page: number; pageSize: number; total: number }) {
  return NextResponse.json({ data, pagination });
}

export function apiError(code: string, message: string, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status });
}
```

- [ ] **Step 3: Commit**

```bash
cd /d/Intern-King
git add intern-king/types/ intern-king/lib/utils/
git commit -m "feat: add shared types and API response helpers"
```

---

### Task 4: Clerk Authentication & Middleware

**Files:**
- Create: `intern-king/middleware.ts`
- Modify: `intern-king/app/layout.tsx`
- Create: `intern-king/lib/utils/auth.ts`
- Create: `intern-king/app/api/webhooks/clerk/route.ts`

- [ ] **Step 1: Configure Clerk middleware**

Create `middleware.ts` at project root:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

- [ ] **Step 2: Wrap root layout with ClerkProvider**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { zhCN } from "@clerk/localizations";
import "./globals.css";

export const metadata: Metadata = {
  title: "实习小霸王 — 一站式实习求职平台",
  description: "实习岗位聚合 + AI 简历锐评，助你拿下心仪 Offer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={zhCN}>
      <html lang="zh-CN" className="dark">
        <body className="min-h-screen bg-background text-foreground antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 3: Install Clerk Chinese localization**

```bash
cd /d/Intern-King/intern-king
npm install @clerk/localizations
```

- [ ] **Step 4: Create auth utility to get DB user**

Create `lib/utils/auth.ts`:

```typescript
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  return user;
}
```

- [ ] **Step 5: Create Clerk webhook route**

Create `app/api/webhooks/clerk/route.ts`:

```typescript
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses[0]?.email_address;
    if (!email) return new Response("No email", { status: 400 });

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    await prisma.user.upsert({
      where: { clerkId: id },
      update: { email, name, avatarUrl: image_url },
      create: { clerkId: id, email, name, avatarUrl: image_url },
    });
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await prisma.user.deleteMany({ where: { clerkId: id } });
    }
  }

  return new Response("OK", { status: 200 });
}
```

- [ ] **Step 6: Verify middleware works**

```bash
cd /d/Intern-King/intern-king
npm run build
```

Expected: Build succeeds without errors. (Actual auth test requires Clerk keys configured.)

- [ ] **Step 7: Commit**

```bash
cd /d/Intern-King
git add intern-king/middleware.ts intern-king/app/layout.tsx intern-king/lib/utils/auth.ts intern-king/app/api/webhooks/
git commit -m "feat: add Clerk auth middleware, webhook, and auth helpers"
```

---

## Phase 2: Jobs Module Backend (Tasks 5-7)

### Task 5: Job Service Layer

**Files:**
- Create: `intern-king/lib/services/job.service.ts`

- [ ] **Step 1: Write the job service**

Create `lib/services/job.service.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { JobFilters } from "@/types";

export async function getJobs(filters: JobFilters, userId?: string) {
  const { search, location, type, category, page = 1, pageSize = 20 } = filters;

  const where: Record<string, unknown> = { isActive: true };

  if (search) {
    where.OR = [
      { company: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
    ];
  }
  if (location) where.location = { contains: location };
  if (type) where.type = type;
  if (category) where.category = category;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: userId
        ? { favorites: { where: { userId }, select: { id: true } } }
        : undefined,
    }),
    prisma.job.count({ where }),
  ]);

  const data = jobs.map((job) => {
    const { favorites, ...rest } = job as typeof job & { favorites?: { id: string }[] };
    return { ...rest, isFavorited: (favorites?.length ?? 0) > 0 };
  });

  return { data, pagination: { page, pageSize, total } };
}

export async function getJobById(id: string) {
  return prisma.job.findUnique({ where: { id, isActive: true } });
}

export async function createJob(data: {
  company: string;
  title: string;
  type: string;
  location: string;
  category: string;
  description: string;
  applyUrl?: string;
}) {
  return prisma.job.create({ data: { ...data, publishedAt: new Date() } });
}

export async function updateJob(
  id: string,
  data: Partial<{
    company: string;
    title: string;
    type: string;
    location: string;
    category: string;
    description: string;
    applyUrl: string;
  }>
) {
  return prisma.job.update({ where: { id }, data });
}

export async function toggleJobActive(id: string) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return null;
  return prisma.job.update({ where: { id }, data: { isActive: !job.isActive } });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /d/Intern-King/intern-king
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
cd /d/Intern-King
git add intern-king/lib/services/job.service.ts
git commit -m "feat: add job service layer with CRUD and filtering"
```

---

### Task 6: Jobs API Routes (User-Facing)

**Files:**
- Create: `intern-king/app/api/jobs/route.ts`
- Create: `intern-king/app/api/jobs/[id]/route.ts`

- [ ] **Step 1: Create GET /api/jobs route**

Create `app/api/jobs/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth";
import { getJobs } from "@/lib/services/job.service";
import { apiList, apiError } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const params = req.nextUrl.searchParams;

    const filters = {
      search: params.get("search") || undefined,
      location: params.get("location") || undefined,
      type: params.get("type") || undefined,
      category: params.get("category") || undefined,
      page: Number(params.get("page")) || 1,
      pageSize: Math.min(Number(params.get("pageSize")) || 20, 100),
    };

    const result = await getJobs(filters, user?.id);
    return apiList(result.data, result.pagination);
  } catch {
    return apiError("INTERNAL", "获取岗位列表失败", 500);
  }
}
```

- [ ] **Step 2: Create GET /api/jobs/:id route**

Create `app/api/jobs/[id]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { getJobById } from "@/lib/services/job.service";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await getJobById(id);
    if (!job) return apiError("NOT_FOUND", "岗位不存在", 404);
    return apiSuccess(job);
  } catch {
    return apiError("INTERNAL", "获取岗位详情失败", 500);
  }
}
```

- [ ] **Step 3: Verify build**

```bash
cd /d/Intern-King/intern-king
npm run build
```

- [ ] **Step 4: Commit**

```bash
cd /d/Intern-King
git add intern-king/app/api/jobs/
git commit -m "feat: add jobs API routes (list with filters, detail)"
```

---

### Task 7: Admin Jobs API Routes

**Files:**
- Create: `intern-king/app/api/admin/jobs/route.ts`
- Create: `intern-king/app/api/admin/jobs/[id]/route.ts`
- Create: `intern-king/app/api/admin/jobs/[id]/toggle/route.ts`

- [ ] **Step 1: Create POST /api/admin/jobs**

Create `app/api/admin/jobs/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { createJob } from "@/lib/services/job.service";
import { apiSuccess, apiError } from "@/lib/utils/api";

function isAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-key") === process.env.ADMIN_API_KEY;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return apiError("UNAUTHORIZED", "无权操作", 401);

  try {
    const body = await req.json();
    const { company, title, type, location, category, description, applyUrl } = body;

    if (!company || !title || !type || !location || !category || !description) {
      return apiError("VALIDATION", "缺少必填字段", 400);
    }

    const job = await createJob({ company, title, type, location, category, description, applyUrl });
    return apiSuccess(job, 201);
  } catch {
    return apiError("INTERNAL", "创建岗位失败", 500);
  }
}
```

- [ ] **Step 2: Create PUT /api/admin/jobs/:id**

Create `app/api/admin/jobs/[id]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { updateJob } from "@/lib/services/job.service";
import { apiSuccess, apiError } from "@/lib/utils/api";

function isAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-key") === process.env.ADMIN_API_KEY;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return apiError("UNAUTHORIZED", "无权操作", 401);

  try {
    const { id } = await params;
    const body = await req.json();
    const job = await updateJob(id, body);
    return apiSuccess(job);
  } catch {
    return apiError("INTERNAL", "更新岗位失败", 500);
  }
}
```

- [ ] **Step 3: Create PATCH /api/admin/jobs/:id/toggle**

Create `app/api/admin/jobs/[id]/toggle/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { toggleJobActive } from "@/lib/services/job.service";
import { apiSuccess, apiError } from "@/lib/utils/api";

function isAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-key") === process.env.ADMIN_API_KEY;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return apiError("UNAUTHORIZED", "无权操作", 401);

  try {
    const { id } = await params;
    const job = await toggleJobActive(id);
    if (!job) return apiError("NOT_FOUND", "岗位不存在", 404);
    return apiSuccess(job);
  } catch {
    return apiError("INTERNAL", "操作失败", 500);
  }
}
```

- [ ] **Step 4: Verify build**

```bash
cd /d/Intern-King/intern-king
npm run build
```

- [ ] **Step 5: Commit**

```bash
cd /d/Intern-King
git add intern-king/app/api/admin/
git commit -m "feat: add admin job management APIs (create, update, toggle)"
```

---

## Phase 3: Favorites & Resumes Backend (Tasks 8-11)

### Task 8: Favorites Service & API

**Files:**
- Create: `intern-king/lib/services/favorite.service.ts`
- Create: `intern-king/app/api/favorites/route.ts`
- Create: `intern-king/app/api/favorites/[jobId]/route.ts`

- [ ] **Step 1: Write favorites service**

Create `lib/services/favorite.service.ts`:

```typescript
import { prisma } from "@/lib/prisma";

export async function getFavorites(userId: string, page = 1, pageSize = 20) {
  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        job: {
          select: {
            id: true,
            company: true,
            title: true,
            type: true,
            location: true,
            category: true,
          },
        },
      },
    }),
    prisma.favorite.count({ where: { userId } }),
  ]);

  return {
    data: favorites.map((f) => ({ ...f.job, favoritedAt: f.createdAt })),
    pagination: { page, pageSize, total },
  };
}

export async function addFavorite(userId: string, jobId: string) {
  return prisma.favorite.create({ data: { userId, jobId } });
}

export async function removeFavorite(userId: string, jobId: string) {
  return prisma.favorite.deleteMany({ where: { userId, jobId } });
}
```

- [ ] **Step 2: Create favorites API routes**

Create `app/api/favorites/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/utils/auth";
import { getFavorites, addFavorite } from "@/lib/services/favorite.service";
import { apiList, apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const params = req.nextUrl.searchParams;
    const page = Number(params.get("page")) || 1;
    const pageSize = Math.min(Number(params.get("pageSize")) || 20, 100);

    const result = await getFavorites(user.id, page, pageSize);
    return apiList(result.data, result.pagination);
  } catch {
    return apiError("INTERNAL", "获取收藏列表失败", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { jobId } = await req.json();
    if (!jobId) return apiError("VALIDATION", "缺少 jobId", 400);

    const favorite = await addFavorite(user.id, jobId);
    return apiSuccess(favorite, 201);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return apiError("CONFLICT", "已收藏该岗位", 409);
    }
    return apiError("INTERNAL", "收藏失败", 500);
  }
}
```

Create `app/api/favorites/[jobId]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/utils/auth";
import { removeFavorite } from "@/lib/services/favorite.service";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const user = await requireUser();
    const { jobId } = await params;
    await removeFavorite(user.id, jobId);
    return apiSuccess({ success: true });
  } catch {
    return apiError("INTERNAL", "取消收藏失败", 500);
  }
}
```

- [ ] **Step 3: Verify build**

```bash
cd /d/Intern-King/intern-king
npm run build
```

- [ ] **Step 4: Commit**

```bash
cd /d/Intern-King
git add intern-king/lib/services/favorite.service.ts intern-king/app/api/favorites/
git commit -m "feat: add favorites service and API routes"
```

---

### Task 9: Supabase Storage Client & Resume Upload API

**Files:**
- Create: `intern-king/lib/storage/supabase.ts`
- Create: `intern-king/app/api/resumes/upload/route.ts`

- [ ] **Step 1: Create Supabase storage client**

Create `lib/storage/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = "resumes";

export async function uploadFile(
  userId: string,
  fileName: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const path = `${userId}/${Date.now()}-${fileName}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
}

export async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 600); // 10 minutes

  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
```

- [ ] **Step 2: Create resume upload route**

Create `app/api/resumes/upload/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage/supabase";
import { apiSuccess, apiError } from "@/lib/utils/api";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_RESUMES_PER_USER = 10;

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    // Check resume count limit
    const count = await prisma.resume.count({ where: { userId: user.id } });
    if (count >= MAX_RESUMES_PER_USER) {
      return apiError("LIMIT", `最多上传 ${MAX_RESUMES_PER_USER} 份简历`, 400);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return apiError("VALIDATION", "请选择文件", 400);

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError("VALIDATION", "仅支持 PDF 和 Word 格式", 400);
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return apiError("VALIDATION", "文件大小不能超过 10MB", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type.includes("pdf") ? "pdf" : "docx";

    // Upload to Supabase Storage
    const fileUrl = await uploadFile(user.id, file.name, buffer, file.type);

    // Create DB record
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        fileName: file.name,
        fileUrl,
        fileType,
      },
    });

    return apiSuccess(resume, 201);
  } catch {
    return apiError("INTERNAL", "上传失败", 500);
  }
}
```

- [ ] **Step 3: Commit**

```bash
cd /d/Intern-King
git add intern-king/lib/storage/ intern-king/app/api/resumes/upload/
git commit -m "feat: add Supabase storage client and resume upload API"
```

---

### Task 10: Resume List, Delete, Download APIs

**Files:**
- Create: `intern-king/app/api/resumes/route.ts`
- Create: `intern-king/app/api/resumes/[id]/route.ts`
- Create: `intern-king/app/api/resumes/[id]/url/route.ts`

- [ ] **Step 1: Create GET /api/resumes**

Create `app/api/resumes/route.ts`:

```typescript
import { requireUser } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET() {
  try {
    const user = await requireUser();
    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, fileName: true, fileType: true, createdAt: true },
    });
    return apiSuccess(resumes);
  } catch {
    return apiError("INTERNAL", "获取简历列表失败", 500);
  }
}
```

- [ ] **Step 2: Create DELETE /api/resumes/:id**

Create `app/api/resumes/[id]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage/supabase";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const resume = await prisma.resume.findFirst({
      where: { id, userId: user.id },
    });
    if (!resume) return apiError("NOT_FOUND", "简历不存在", 404);

    // Delete from storage + DB
    await deleteFile(resume.fileUrl);
    await prisma.resume.delete({ where: { id } });

    return apiSuccess({ success: true });
  } catch {
    return apiError("INTERNAL", "删除失败", 500);
  }
}
```

- [ ] **Step 3: Create GET /api/resumes/:id/url**

Create `app/api/resumes/[id]/url/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@/lib/storage/supabase";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const resume = await prisma.resume.findFirst({
      where: { id, userId: user.id },
    });
    if (!resume) return apiError("NOT_FOUND", "简历不存在", 404);

    const url = await getSignedUrl(resume.fileUrl);
    return apiSuccess({ url });
  } catch {
    return apiError("INTERNAL", "获取下载链接失败", 500);
  }
}
```

- [ ] **Step 4: Verify build**

```bash
cd /d/Intern-King/intern-king
npm run build
```

- [ ] **Step 5: Commit**

```bash
cd /d/Intern-King
git add intern-king/app/api/resumes/
git commit -m "feat: add resume list, delete, and signed download URL APIs"
```

---

### Task 11: Resume Parsing Service

**Files:**
- Create: `intern-king/lib/services/resume.service.ts`

- [ ] **Step 1: Write resume parsing service**

Create `lib/services/resume.service.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/storage/supabase";

const MAX_TEXT_LENGTH = 3000;

export async function getResumeText(resumeId: string): Promise<string> {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new Error("Resume not found");

  // Return cached text if available
  if (resume.parsedText) {
    return resume.parsedText.slice(0, MAX_TEXT_LENGTH);
  }

  // Download file from storage
  const { data, error } = await supabase.storage
    .from("resumes")
    .download(resume.fileUrl);
  if (error || !data) throw new Error("Failed to download resume file");

  const buffer = Buffer.from(await data.arrayBuffer());

  let text: string;

  if (resume.fileType === "pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    text = result.text;
  } else if (resume.fileType === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new Error(`Unsupported file type: ${resume.fileType}`);
  }

  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim();

  // Cache parsed text
  await prisma.resume.update({
    where: { id: resumeId },
    data: { parsedText: text },
  });

  return text.slice(0, MAX_TEXT_LENGTH);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /d/Intern-King/intern-king
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /d/Intern-King
git add intern-king/lib/services/resume.service.ts
git commit -m "feat: add resume parsing service (PDF + DOCX)"
```

---

## Phase 4: AI Review Pipeline (Tasks 12-16)

### Task 12: DeepSeek AI Client

**Files:**
- Create: `intern-king/lib/ai/deepseek.ts`

- [ ] **Step 1: Write DeepSeek client**

Create `lib/ai/deepseek.ts`:

```typescript
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: { content: string };
  }>;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const { temperature = 0.7, maxTokens = 4096 } = options;

  const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${err}`);
  }

  const data: DeepSeekResponse = await response.json();
  return data.choices[0].message.content;
}

export function parseJsonResponse<T>(raw: string): T {
  // Strip markdown code fences if present
  let cleaned = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  cleaned = cleaned.trim();
  return JSON.parse(cleaned);
}
```

- [ ] **Step 2: Commit**

```bash
cd /d/Intern-King
git add intern-king/lib/ai/deepseek.ts
git commit -m "feat: add DeepSeek API client with JSON response parser"
```

---

### Task 13: Prompt Templates

**Files:**
- Create: `intern-king/lib/ai/prompts.ts`

- [ ] **Step 1: Write all prompt templates**

Create `lib/ai/prompts.ts`:

```typescript
export function buildRelevanceFilterPrompt(
  job: { company: string; title: string; type: string; category: string },
  candidates: Array<{ index: number; title: string; url: string; snippet: string }>
): { system: string; user: string } {
  const candidateList = candidates
    .map(
      (c) =>
        `${c.index}. 标题：${c.title}\n   来源：${c.url}\n   摘要：${c.snippet}`
    )
    .join("\n---\n");

  return {
    system: `你是一个面经相关度评估助手。你的任务是判断每条面经与目标岗位的相关程度。

评分标准（1-5分）：
5分：完全匹配 — 同公司、同岗位、同类型（实习），且内容详实
4分：高度相关 — 同公司同方向，或同岗位不同公司但内容有参考价值
3分：有参考价值 — 相关方向的面经，部分内容可参考
2分：弱相关 — 公司或方向只沾边，参考价值有限
1分：不相关 — 完全不同的岗位/方向，或内容过于陈旧/空洞

请对每条面经打分，仅输出 JSON 数组，不要添加其他内容：
[{ "index": 1, "score": 5, "reason": "简短理由" }, ...]`,
    user: `【目标岗位】
公司：${job.company}
岗位：${job.title}
类型：${job.type}（暑期实习/日常实习）
方向：${job.category}

【候选面经列表】
${candidateList}`,
  };
}

export function buildReviewPrompt(
  job: {
    company: string;
    title: string;
    type: string;
    location: string;
    description: string;
  },
  searchContext: string,
  resumeText: string
): { system: string; user: string } {
  return {
    system: `你是「实习小霸王」平台的 AI 简历顾问。你的风格是毒舌但专业 ——
不说废话、不拍马屁，直击简历的硬伤和自嗨成分。你的目标是让用户
看完之后知道自己的简历到底哪里有问题、该怎么改。

## 你的工作原则

1. **基于事实，不编造**：分析必须严格基于下方提供的【岗位 JD】和
   【面经参考】。引用面经时注明来源。如果面经参考为空，仅基于 JD 分析，
   并明确告知"本次评估未找到高相关度面经，仅基于岗位 JD 分析"。

2. **对标岗位要求**：逐条对比 JD 要求与简历内容。JD 要求但简历没体现 →
   指出缺失。简历写了但 JD 不关心 → 指出浪费版面。

3. **面经交叉验证**：面经中反复提到的考察重点，若简历中无体现，必须重点
   指出。这比 JD 中的要求更有实战参考价值。

4. **给出可执行建议**：每条建议必须具体到"改成什么样"，用 STAR 法则
   (Situation-Task-Action-Result) 示范如何重写。

5. **严格 JSON 输出**：回复必须是且仅是一个合法 JSON 对象，不要在 JSON
   前后添加任何文字、解释或 markdown 标记。

## 评分标准
- 90-100：简历与岗位高度匹配，面经考点覆盖全面
- 70-89：基本匹配但有明显短板
- 50-69：匹配度一般，需大幅修改
- 30-49：方向偏差较大，核心技能缺失严重
- 0-29：简历与岗位几乎不匹配`,
    user: `===== 【岗位信息】 =====
公司：${job.company}
岗位：${job.title}
类型：${job.type}
地点：${job.location}
岗位详情（JD）：
${job.description}

===== 【面经参考】 =====
${searchContext || "（本次未找到高相关度面经）"}

===== 【用户简历】 =====
${resumeText}

===== 【输出要求】 =====
输出以下 JSON（不要添加 JSON 以外的内容）：
{
  "score": <0-100整数>,
  "summary": "<一句话总评，20字以内，毒舌风格>",
  "roasts": [
    { "point": "<10字以内>", "detail": "<结合JD和面经的具体分析>", "severity": "critical|warning|info" }
  ],
  "suggestions": [
    { "title": "<10字以内>", "detail": "<含 STAR 法则改写示例>" }
  ],
  "interviewQuestions": ["<基于面经的高频面试题>"],
  "sourcesUsed": "<引用的面经来源列表，无则写'无'>"
}`,
  };
}
```

- [ ] **Step 2: Commit**

```bash
cd /d/Intern-King
git add intern-king/lib/ai/prompts.ts
git commit -m "feat: add prompt templates for relevance filter and review"
```

---

### Task 14: Tavily Search & Relevance Filter Service

**Files:**
- Create: `intern-king/lib/services/search.service.ts`

- [ ] **Step 1: Write search + filter service**

Create `lib/services/search.service.ts`:

```typescript
import { chatCompletion, parseJsonResponse } from "@/lib/ai/deepseek";
import { buildRelevanceFilterPrompt } from "@/lib/ai/prompts";

const TAVILY_API_KEY = process.env.TAVILY_API_KEY!;
const MAX_CONTEXT_LENGTH = 4000;

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

interface TavilyResponse {
  results: TavilyResult[];
}

async function tavilySearch(query: string): Promise<TavilyResult[]> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      search_depth: "basic",
      max_results: 5,
      include_answer: false,
    }),
  });

  if (!response.ok) return [];
  const data: TavilyResponse = await response.json();
  return data.results || [];
}

function generateQueries(company: string, title: string, category: string): string[] {
  return [
    `${company} ${title} 实习面经`,
    `${company} ${category} 实习面试经验`,
    `${title} 实习面经 面试题`,
  ];
}

export async function searchAndFilterExperiences(job: {
  company: string;
  title: string;
  type: string;
  category: string;
}): Promise<string> {
  // Step 2: Search with 3 queries in parallel
  const queries = generateQueries(job.company, job.title, job.category);
  const results = await Promise.allSettled(queries.map(tavilySearch));

  // Collect successful results, deduplicate by URL
  const urlSet = new Set<string>();
  const candidates: Array<{ index: number; title: string; url: string; snippet: string }> = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const item of result.value) {
        if (!urlSet.has(item.url)) {
          urlSet.add(item.url);
          candidates.push({
            index: candidates.length + 1,
            title: item.title,
            url: item.url,
            snippet: item.content.slice(0, 300),
          });
        }
      }
    }
  }

  // No results at all — return empty
  if (candidates.length === 0) return "";

  // Step 2.5: Relevance filtering via DeepSeek
  try {
    const prompt = buildRelevanceFilterPrompt(job, candidates);
    const raw = await chatCompletion(
      [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
      { temperature: 0.1, maxTokens: 1024 }
    );

    const scores = parseJsonResponse<Array<{ index: number; score: number; reason: string }>>(raw);

    // Keep score >= 3, take top 5
    const relevant = scores
      .filter((s) => s.score >= 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (relevant.length === 0) return "";

    // Build context string from relevant candidates
    const contextParts = relevant.map((r) => {
      const c = candidates.find((c) => c.index === r.index);
      if (!c) return "";
      return `【${c.title}】(${c.url})\n${c.snippet}`;
    });

    const context = contextParts.join("\n\n---\n\n");
    return context.slice(0, MAX_CONTEXT_LENGTH);
  } catch {
    // If filtering fails, use raw top 5
    const fallback = candidates
      .slice(0, 5)
      .map((c) => `【${c.title}】(${c.url})\n${c.snippet}`)
      .join("\n\n---\n\n");
    return fallback.slice(0, MAX_CONTEXT_LENGTH);
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /d/Intern-King/intern-king
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /d/Intern-King
git add intern-king/lib/services/search.service.ts
git commit -m "feat: add Tavily search and DeepSeek relevance filter service"
```

---

### Task 15: Review Service (Full Async Workflow)

**Files:**
- Create: `intern-king/lib/services/review.service.ts`

- [ ] **Step 1: Write review service**

Create `lib/services/review.service.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { getResumeText } from "@/lib/services/resume.service";
import { searchAndFilterExperiences } from "@/lib/services/search.service";
import { chatCompletion, parseJsonResponse } from "@/lib/ai/deepseek";
import { buildReviewPrompt } from "@/lib/ai/prompts";
import { ReviewResult } from "@/types";

const STALE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

export async function checkConcurrencyLock(userId: string): Promise<boolean> {
  // Clean up stale processing reviews first
  await prisma.review.updateMany({
    where: {
      userId,
      status: { in: ["pending", "processing"] },
      createdAt: { lt: new Date(Date.now() - STALE_TIMEOUT_MS) },
    },
    data: { status: "failed", errorMessage: "处理超时，请重新提交" },
  });

  const active = await prisma.review.findFirst({
    where: {
      userId,
      status: { in: ["pending", "processing"] },
    },
  });

  return active !== null;
}

export async function createReview(userId: string, jobId: string, resumeId: string) {
  // Validate job and resume exist
  const [job, resume] = await Promise.all([
    prisma.job.findUnique({ where: { id: jobId } }),
    prisma.resume.findFirst({ where: { id: resumeId, userId } }),
  ]);

  if (!job) throw new Error("JOB_NOT_FOUND");
  if (!resume) throw new Error("RESUME_NOT_FOUND");

  return prisma.review.create({
    data: { userId, jobId, resumeId, status: "pending" },
  });
}

export async function processReview(reviewId: string): Promise<void> {
  try {
    // Mark as processing
    await prisma.review.update({
      where: { id: reviewId },
      data: { status: "processing" },
    });

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { job: true, resume: true },
    });
    if (!review) throw new Error("Review not found");

    // Step 1: Parse resume
    let resumeText: string;
    try {
      resumeText = await getResumeText(review.resumeId);
    } catch {
      throw new Error("简历格式无法识别，请上传标准 PDF/Word");
    }

    // Step 2 + 2.5: Search + filter interview experiences
    const searchContext = await searchAndFilterExperiences({
      company: review.job.company,
      title: review.job.title,
      type: review.job.type,
      category: review.job.category,
    });

    // Save search context for traceability
    await prisma.review.update({
      where: { id: reviewId },
      data: { searchContext: searchContext || null },
    });

    // Step 3: Build prompt and call DeepSeek
    const prompt = buildReviewPrompt(
      {
        company: review.job.company,
        title: review.job.title,
        type: review.job.type,
        location: review.job.location,
        description: review.job.description,
      },
      searchContext,
      resumeText
    );

    let result: ReviewResult;
    let retries = 0;

    while (retries < 2) {
      try {
        const raw = await chatCompletion(
          [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user },
          ],
          { temperature: 0.7, maxTokens: 4096 }
        );
        result = parseJsonResponse<ReviewResult>(raw);
        break;
      } catch {
        retries++;
        if (retries >= 2) throw new Error("AI 生成异常，请重试");
      }
    }

    // Step 4: Save result
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: "completed",
        score: result!.score,
        content: JSON.stringify(result!),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "未知错误";
    await prisma.review.update({
      where: { id: reviewId },
      data: { status: "failed", errorMessage: message },
    });
  }
}

export async function getReviewById(id: string, userId: string) {
  const review = await prisma.review.findFirst({
    where: { id, userId },
    include: {
      job: { select: { company: true, title: true, type: true, location: true } },
      resume: { select: { fileName: true } },
    },
  });

  if (!review) return null;

  return {
    id: review.id,
    status: review.status,
    score: review.score,
    content: review.content ? JSON.parse(review.content) : null,
    errorMessage: review.errorMessage,
    createdAt: review.createdAt.toISOString(),
    job: review.job,
    resume: review.resume,
  };
}

export async function getReviewList(
  userId: string,
  page = 1,
  pageSize = 20,
  jobId?: string
) {
  const where: Record<string, unknown> = { userId };
  if (jobId) where.jobId = jobId;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        job: { select: { company: true, title: true } },
        resume: { select: { fileName: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  const data = reviews.map((r) => ({
    id: r.id,
    status: r.status,
    score: r.score,
    jobTitle: r.job.title,
    jobCompany: r.job.company,
    resumeFileName: r.resume.fileName,
    createdAt: r.createdAt.toISOString(),
  }));

  return { data, pagination: { page, pageSize, total } };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /d/Intern-King/intern-king
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /d/Intern-King
git add intern-king/lib/services/review.service.ts
git commit -m "feat: add review service with full async workflow"
```

---

### Task 16: Review API Routes

**Files:**
- Create: `intern-king/app/api/reviews/route.ts`
- Create: `intern-king/app/api/reviews/[id]/route.ts`
- Create: `intern-king/app/api/user/profile/route.ts`

- [ ] **Step 1: Create POST + GET /api/reviews**

Create `app/api/reviews/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { after } from "next/server";
import { requireUser } from "@/lib/utils/auth";
import {
  checkConcurrencyLock,
  createReview,
  processReview,
  getReviewList,
} from "@/lib/services/review.service";
import { apiSuccess, apiList, apiError } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { jobId, resumeId } = await req.json();

    if (!jobId || !resumeId) {
      return apiError("VALIDATION", "缺少 jobId 或 resumeId", 400);
    }

    // Concurrency lock check
    const isLocked = await checkConcurrencyLock(user.id);
    if (isLocked) {
      return apiError("CONFLICT", "有简历正在锐评中，请等待完成", 409);
    }

    const review = await createReview(user.id, jobId, resumeId);

    // Trigger background processing via next/after
    after(async () => {
      await processReview(review.id);
    });

    return apiSuccess({ reviewId: review.id }, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "创建锐评失败";
    if (message === "JOB_NOT_FOUND") return apiError("NOT_FOUND", "岗位不存在", 404);
    if (message === "RESUME_NOT_FOUND") return apiError("NOT_FOUND", "简历不存在", 404);
    return apiError("INTERNAL", message, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const params = req.nextUrl.searchParams;

    const page = Number(params.get("page")) || 1;
    const pageSize = Math.min(Number(params.get("pageSize")) || 20, 100);
    const jobId = params.get("jobId") || undefined;

    const result = await getReviewList(user.id, page, pageSize, jobId);
    return apiList(result.data, result.pagination);
  } catch {
    return apiError("INTERNAL", "获取锐评列表失败", 500);
  }
}
```

- [ ] **Step 2: Create GET /api/reviews/:id (polling endpoint)**

Create `app/api/reviews/[id]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/utils/auth";
import { getReviewById } from "@/lib/services/review.service";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const review = await getReviewById(id, user.id);
    if (!review) return apiError("NOT_FOUND", "锐评记录不存在", 404);

    return apiSuccess(review);
  } catch {
    return apiError("INTERNAL", "获取锐评结果失败", 500);
  }
}
```

- [ ] **Step 3: Create GET /api/user/profile**

Create `app/api/user/profile/route.ts`:

```typescript
import { requireUser } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET() {
  try {
    const user = await requireUser();

    const [resumeCount, reviewCount, favoriteCount] = await Promise.all([
      prisma.resume.count({ where: { userId: user.id } }),
      prisma.review.count({ where: { userId: user.id } }),
      prisma.favorite.count({ where: { userId: user.id } }),
    ]);

    return apiSuccess({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      stats: { resumeCount, reviewCount, favoriteCount },
    });
  } catch {
    return apiError("INTERNAL", "获取用户信息失败", 500);
  }
}
```

- [ ] **Step 4: Verify full build**

```bash
cd /d/Intern-King/intern-king
npm run build
```

Expected: Build succeeds — all backend code compiles correctly.

- [ ] **Step 5: Commit**

```bash
cd /d/Intern-King
git add intern-king/app/api/reviews/ intern-king/app/api/user/
git commit -m "feat: add review API routes (create, poll, list) and user profile"
```

---

## Phase 5: UI Foundation & Layout (Tasks 17-18)

### Task 17: Dark Theme & shadcn/ui Components

**Files:**
- Modify: `intern-king/tailwind.config.ts`
- Modify: `intern-king/app/globals.css`

- [ ] **Step 1: Configure dark theme with flame orange**

Update `tailwind.config.ts` — add the custom color palette. The exact content depends on the generated config, but add this to the `extend` section:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        flame: {
          DEFAULT: "#FF4D00",
          50: "#FFF2EB",
          100: "#FFE0CC",
          200: "#FFBE99",
          300: "#FF9B66",
          400: "#FF7733",
          500: "#FF4D00",
          600: "#CC3E00",
          700: "#992E00",
          800: "#661F00",
          900: "#331000",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

- [ ] **Step 2: Update globals.css for dark theme**

Replace the CSS variables section in `app/globals.css` with dark-first theme using flame orange as primary:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 18 100% 50%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 18 100% 50%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 0 0% 6%;
    --foreground: 0 0% 95%;
    --card: 0 0% 9%;
    --card-foreground: 0 0% 95%;
    --popover: 0 0% 9%;
    --popover-foreground: 0 0% 95%;
    --primary: 18 100% 50%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 15%;
    --secondary-foreground: 0 0% 95%;
    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 64%;
    --accent: 0 0% 15%;
    --accent-foreground: 0 0% 95%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 95%;
    --border: 0 0% 18%;
    --input: 0 0% 18%;
    --ring: 18 100% 50%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 3: Install required shadcn/ui components**

```bash
cd /d/Intern-King/intern-king
npx shadcn@latest add button input select badge table card tabs dialog dropdown-menu avatar separator scroll-area toast
```

- [ ] **Step 4: Verify dev server renders dark theme**

```bash
cd /d/Intern-King/intern-king
npm run dev
```

Open http://localhost:3000 — page should have dark background.

- [ ] **Step 5: Commit**

```bash
cd /d/Intern-King
git add intern-king/tailwind.config.ts intern-king/app/globals.css intern-king/components/ui/
git commit -m "feat: configure dark theme with flame orange and install shadcn/ui components"
```

---

### Task 18: App Shell Layout (Sidebar + Navigation)

**Files:**
- Create: `intern-king/components/layout/sidebar.tsx`
- Create: `intern-king/components/layout/mobile-nav.tsx`
- Create: `intern-king/app/(main)/layout.tsx`
- Create: `intern-king/app/(auth)/layout.tsx`

- [ ] **Step 1: Create sidebar component**

Create `components/layout/sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Briefcase, FileSearch, User, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/jobs", label: "实习广场", icon: Briefcase },
  { href: "/review", label: "AI 锐评", icon: FileSearch },
  { href: "/profile", label: "个人中心", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Flame className="h-7 w-7 text-flame" />
        <span className="text-lg font-bold">实习小霸王</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-flame/10 text-flame"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User button */}
      <div className="px-6 py-4 border-t border-border">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: { avatarBox: "h-8 w-8" },
          }}
        />
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create mobile navigation**

Create `components/layout/mobile-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FileSearch, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/jobs", label: "实习广场", icon: Briefcase },
  { href: "/review", label: "AI 锐评", icon: FileSearch },
  { href: "/profile", label: "我的", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-xs",
                isActive ? "text-flame" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Create main app layout**

Create `app/(main)/layout.tsx`:

```tsx
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="md:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
```

- [ ] **Step 4: Create auth layout**

Create `app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Verify layout renders**

```bash
cd /d/Intern-King/intern-king
npm run dev
```

Navigate to http://localhost:3000/jobs (will redirect to sign-in without Clerk keys, but layout structure should be in place).

- [ ] **Step 6: Commit**

```bash
cd /d/Intern-King
git add intern-king/components/layout/ intern-king/app/\(main\)/layout.tsx intern-king/app/\(auth\)/layout.tsx
git commit -m "feat: add sidebar, mobile nav, and app shell layouts"
```

---

## Phase 6: Feature Pages (Tasks 19-23)

### Task 19: Landing Page & Auth Pages

**Files:**
- Modify: `intern-king/app/page.tsx`
- Create: `intern-king/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Create: `intern-king/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

- [ ] **Step 1: Create landing page**

Replace `app/page.tsx`:

```tsx
import Link from "next/link";
import { Flame, Briefcase, FileSearch, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Briefcase,
    title: "实习广场",
    desc: "一站聚合大厂实习岗位，多维筛选精准匹配",
  },
  {
    icon: FileSearch,
    title: "AI 简历锐评",
    desc: "联网搜索真实面经，毒舌 AI 直击简历硬伤",
  },
  {
    icon: Target,
    title: "精准匹配",
    desc: "基于 JD + 面经双维度分析，告诉你差在哪里",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-7 w-7 text-flame" />
            <span className="text-lg font-bold">实习小霸王</span>
          </div>
          <div className="flex gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">登录</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-flame hover:bg-flame-600">注册</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          不做实习<span className="text-flame">小透明</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          实习岗位一站聚合，AI 毒舌锐评简历硬伤，让你的每次投递都有备而来
        </p>
        <Link href="/sign-up">
          <Button size="lg" className="bg-flame hover:bg-flame-600 text-lg px-8">
            立即开始
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="bg-card border-border">
              <CardContent className="pt-6">
                <f.icon className="h-10 w-10 text-flame mb-4" />
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Create sign-in page**

Create `app/(auth)/sign-in/[[...sign-in]]/page.tsx`:

```tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

- [ ] **Step 3: Create sign-up page**

Create `app/(auth)/sign-up/[[...sign-up]]/page.tsx`:

```tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <SignUp />;
}
```

- [ ] **Step 4: Verify landing page renders**

```bash
cd /d/Intern-King/intern-king
npm run dev
```

Open http://localhost:3000 — landing page with hero, features, and header should display.

- [ ] **Step 5: Commit**

```bash
cd /d/Intern-King
git add intern-king/app/page.tsx intern-king/app/\(auth\)/
git commit -m "feat: add landing page and Clerk auth pages"
```

---

### Task 20: Jobs Page (Table + Filters + Pagination)

**Files:**
- Create: `intern-king/components/jobs/job-filters.tsx`
- Create: `intern-king/components/jobs/job-table.tsx`
- Create: `intern-king/app/(main)/jobs/page.tsx`

- [ ] **Step 1: Create job filters component**

Create `components/jobs/job-filters.tsx`:

```tsx
"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { JobFilters } from "@/types";

const LOCATIONS = ["全部", "北京", "上海", "深圳", "杭州", "广州", "成都", "南京"];
const TYPES = [
  { value: "", label: "全部类型" },
  { value: "summer", label: "暑期实习" },
  { value: "daily", label: "日常实习" },
];
const CATEGORIES = [
  { value: "", label: "全部方向" },
  { value: "研发", label: "研发" },
  { value: "产品", label: "产品" },
  { value: "运营", label: "运营" },
  { value: "设计", label: "设计" },
];

interface Props {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
}

export function JobFiltersBar({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索公司或岗位..."
          className="pl-9"
          value={filters.search || ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
        />
      </div>

      <Select
        value={filters.location || ""}
        onValueChange={(v) => onChange({ ...filters, location: v === "全部" ? "" : v, page: 1 })}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="地点" />
        </SelectTrigger>
        <SelectContent>
          {LOCATIONS.map((loc) => (
            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.type || ""}
        onValueChange={(v) => onChange({ ...filters, type: v, page: 1 })}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="类型" />
        </SelectTrigger>
        <SelectContent>
          {TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.category || ""}
        onValueChange={(v) => onChange({ ...filters, category: v, page: 1 })}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="方向" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((c) => (
            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 2: Create job table component**

Create `components/jobs/job-table.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Star, ExternalLink, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobItem } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  jobs: JobItem[];
  onToggleFavorite: (jobId: string, isFavorited: boolean) => void;
}

export function JobTable({ jobs, onToggleFavorite }: Props) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">公司</TableHead>
            <TableHead>岗位</TableHead>
            <TableHead className="w-[100px]">类型</TableHead>
            <TableHead className="w-[160px]">地点</TableHead>
            <TableHead className="w-[200px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                暂无岗位数据
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.company}</TableCell>
                <TableCell>{job.title}</TableCell>
                <TableCell>
                  <Badge variant={job.type === "summer" ? "default" : "secondary"}>
                    {job.type === "summer" ? "暑期" : "日常"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {job.location.split(",").map((loc) => (
                      <Badge key={loc} variant="outline" className="text-xs">
                        {loc}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/review?jobId=${job.id}`}>
                      <Button size="sm" className="bg-flame hover:bg-flame-600">
                        <FileSearch className="h-3.5 w-3.5 mr-1" />
                        测简历
                      </Button>
                    </Link>
                    {job.applyUrl && (
                      <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleFavorite(job.id, job.isFavorited)}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          job.isFavorited ? "fill-flame text-flame" : "text-muted-foreground"
                        )}
                      />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 3: Create jobs page with data fetching**

Create `app/(main)/jobs/page.tsx`:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { JobFiltersBar } from "@/components/jobs/job-filters";
import { JobTable } from "@/components/jobs/job-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { JobItem, JobFilters } from "@/types";

export default function JobsPage() {
  const [filters, setFilters] = useState<JobFilters>({ page: 1, pageSize: 20 });
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.location) params.set("location", filters.location);
    if (filters.type) params.set("type", filters.type);
    if (filters.category) params.set("category", filters.category);
    params.set("page", String(filters.page || 1));
    params.set("pageSize", String(filters.pageSize || 20));

    const res = await fetch(`/api/jobs?${params}`);
    const json = await res.json();
    setJobs(json.data || []);
    setTotal(json.pagination?.total || 0);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Debounce search input
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout>();
  const handleFilterChange = (newFilters: JobFilters) => {
    if (newFilters.search !== filters.search) {
      clearTimeout(searchTimer);
      const timer = setTimeout(() => setFilters(newFilters), 300);
      setSearchTimer(timer);
    } else {
      setFilters(newFilters);
    }
  };

  const toggleFavorite = async (jobId: string, isFavorited: boolean) => {
    if (isFavorited) {
      await fetch(`/api/favorites/${jobId}`, { method: "DELETE" });
    } else {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
    }
    fetchJobs();
  };

  const totalPages = Math.ceil(total / (filters.pageSize || 20));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">实习广场</h1>

      <JobFiltersBar filters={filters} onChange={handleFilterChange} />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : (
        <>
          <JobTable jobs={jobs} onToggleFavorite={toggleFavorite} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={(filters.page || 1) <= 1}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {filters.page || 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={(filters.page || 1) >= totalPages}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
cd /d/Intern-King/intern-king
npm run build
```

- [ ] **Step 5: Commit**

```bash
cd /d/Intern-King
git add intern-king/components/jobs/ intern-king/app/\(main\)/jobs/
git commit -m "feat: add jobs page with table, filters, pagination, and favorites"
```

---

### Task 21: AI Review Page (Input + Result + Polling)

**Files:**
- Create: `intern-king/components/review/review-input.tsx`
- Create: `intern-king/components/review/score-ring.tsx`
- Create: `intern-king/components/review/review-result.tsx`
- Create: `intern-king/app/(main)/review/page.tsx`

- [ ] **Step 1: Create score ring component**

Create `components/review/score-ring.tsx`:

```tsx
interface Props {
  score: number;
  size?: number;
}

export function ScoreRing({ score, size = 120 }: Props) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const color =
    score >= 70 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${color}`}>{score}</span>
        <span className="text-xs text-muted-foreground">匹配度</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create review input panel**

Create `components/review/review-input.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Loader2, Upload } from "lucide-react";
import { ResumeItem } from "@/types";

interface JobInfo {
  id: string;
  company: string;
  title: string;
  type: string;
  location: string;
}

interface Props {
  job: JobInfo | null;
  onSubmit: (jobId: string, resumeId: string) => void;
  isProcessing: boolean;
}

export function ReviewInput({ job, onSubmit, isProcessing }: Props) {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResume, setSelectedResume] = useState("");

  useEffect(() => {
    fetch("/api/resumes")
      .then((r) => r.json())
      .then((json) => setResumes(json.data || []));
  }, []);

  const handleSubmit = () => {
    if (job && selectedResume) {
      onSubmit(job.id, selectedResume);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">锐评设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Job */}
        {job ? (
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">目标岗位</p>
            <p className="font-medium">{job.company} · {job.title}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {job.type === "summer" ? "暑期实习" : "日常实习"} · {job.location}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-muted/50 text-center text-muted-foreground">
            请从实习广场选择目标岗位
          </div>
        )}

        {/* Resume Select */}
        <div>
          <label className="text-sm font-medium mb-2 block">选择简历</label>
          {resumes.length > 0 ? (
            <Select value={selectedResume} onValueChange={setSelectedResume}>
              <SelectTrigger>
                <SelectValue placeholder="选择一份简历" />
              </SelectTrigger>
              <SelectContent>
                {resumes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.fileName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-muted-foreground p-3 rounded bg-muted/50">
              暂无简历，请先在<a href="/profile" className="text-flame hover:underline mx-1">个人中心</a>上传
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          className="w-full bg-flame hover:bg-flame-600"
          size="lg"
          disabled={!job || !selectedResume || isProcessing}
          onClick={handleSubmit}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              AI 正在锐评中...
            </>
          ) : (
            <>
              <Flame className="h-4 w-4 mr-2" />
              开始锐评
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create review result display**

Create `components/review/review-result.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/review/score-ring";
import { ReviewResult } from "@/types";
import { AlertTriangle, Info, XCircle, Lightbulb, MessageSquare } from "lucide-react";

interface Props {
  result: ReviewResult;
}

const severityConfig = {
  critical: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "严重" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "注意" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", label: "建议" },
};

export function ReviewResultDisplay({ result }: Props) {
  return (
    <div className="space-y-6">
      {/* Score + Summary */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <ScoreRing score={result.score} />
          <p className="mt-4 text-lg font-medium">{result.summary}</p>
        </CardContent>
      </Card>

      {/* Roasts */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-flame" />
            毒舌锐评
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.roasts.map((roast, i) => {
            const config = severityConfig[roast.severity];
            const Icon = config.icon;
            return (
              <div key={i} className={`p-3 rounded-lg ${config.bg}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <Badge variant="outline" className={config.color}>
                    {config.label}
                  </Badge>
                  <span className="font-medium text-sm">{roast.point}</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">{roast.detail}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-flame" />
            修改建议
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.suggestions.map((s, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium text-sm mb-1">{s.title}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{s.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Interview Questions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-flame" />
            高频面试题
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            {result.interviewQuestions.map((q, i) => (
              <li key={i} className="text-sm text-muted-foreground">{q}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Sources */}
      {result.sourcesUsed && result.sourcesUsed !== "无" && (
        <p className="text-xs text-muted-foreground">面经来源：{result.sourcesUsed}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create review page with polling**

Create `app/(main)/review/page.tsx`:

```tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ReviewInput } from "@/components/review/review-input";
import { ReviewResultDisplay } from "@/components/review/review-result";
import { ReviewDetail } from "@/types";
import { Loader2 } from "lucide-react";

const POLL_INTERVAL = 2000;
const MAX_POLLS = 60;

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const reviewId = searchParams.get("reviewId");

  const [job, setJob] = useState<{ id: string; company: string; title: string; type: string; location: string } | null>(null);
  const [reviewData, setReviewData] = useState<ReviewDetail | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const pollCount = useRef(0);
  const pollTimer = useRef<NodeJS.Timeout>();

  // Load job info (for new review)
  useEffect(() => {
    if (jobId) {
      fetch(`/api/jobs/${jobId}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.data) setJob(json.data);
        });
    }
  }, [jobId]);

  // Load existing review (from history)
  useEffect(() => {
    if (reviewId) {
      fetch(`/api/reviews/${reviewId}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.data) {
            setReviewData(json.data);
            if (json.data.job) setJob({ id: "", ...json.data.job });
          }
        });
    }
  }, [reviewId]);

  // Polling logic
  const pollReview = useCallback((reviewId: string) => {
    pollTimer.current = setInterval(async () => {
      pollCount.current++;

      if (pollCount.current > MAX_POLLS) {
        clearInterval(pollTimer.current);
        setIsProcessing(false);
        setError("处理超时，请刷新页面查看结果");
        return;
      }

      const res = await fetch(`/api/reviews/${reviewId}`);
      const json = await res.json();
      const review = json.data as ReviewDetail;

      if (review.status === "completed" || review.status === "failed") {
        clearInterval(pollTimer.current);
        setIsProcessing(false);
        setReviewData(review);
        if (review.status === "failed") {
          setError(review.errorMessage || "锐评失败，请重试");
        }
      }
    }, POLL_INTERVAL);
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  const handleSubmit = async (jobId: string, resumeId: string) => {
    setError("");
    setReviewData(null);
    setIsProcessing(true);
    pollCount.current = 0;

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, resumeId }),
      });

      const json = await res.json();

      if (!res.ok) {
        setIsProcessing(false);
        setError(json.error?.message || "提交失败");
        return;
      }

      pollReview(json.data.reviewId);
    } catch {
      setIsProcessing(false);
      setError("网络错误，请重试");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">AI 简历锐评</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Input Panel */}
        <div>
          <ReviewInput job={job} onSubmit={handleSubmit} isProcessing={isProcessing} />
        </div>

        {/* Right: Result Panel */}
        <div>
          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-flame mb-4" />
              <p className="text-lg font-medium">AI 正在疯狂吐槽你的简历...</p>
              <p className="text-sm mt-2">联网搜索面经 → 相关度筛选 → 生成锐评</p>
            </div>
          )}

          {error && !isProcessing && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {reviewData?.status === "completed" && reviewData.content && (
            <ReviewResultDisplay result={reviewData.content} />
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
cd /d/Intern-King/intern-king
npm run build
```

- [ ] **Step 6: Commit**

```bash
cd /d/Intern-King
git add intern-king/components/review/ intern-king/app/\(main\)/review/
git commit -m "feat: add AI review page with input, score ring, result display, and polling"
```

---

### Task 22: Profile Page (User Card + Tabs)

**Files:**
- Create: `intern-king/components/profile/resume-card.tsx`
- Create: `intern-king/components/profile/review-history-item.tsx`
- Create: `intern-king/components/profile/upload-resume-dialog.tsx`
- Create: `intern-king/app/(main)/profile/page.tsx`

- [ ] **Step 1: Create resume card component**

Create `components/profile/resume-card.tsx`:

```tsx
"use client";

import { FileText, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResumeItem } from "@/types";

interface Props {
  resume: ResumeItem;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

export function ResumeCard({ resume, onDelete, onDownload }: Props) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-4 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-flame/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-flame" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{resume.fileName}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{resume.fileType.toUpperCase()}</Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(resume.createdAt).toLocaleDateString("zh-CN")}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => onDownload(resume.id)}>
            <Download className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(resume.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create review history item component**

Create `components/profile/review-history-item.tsx`:

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ReviewItem } from "@/types";

interface Props {
  review: ReviewItem;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  completed: { label: "已完成", variant: "default" },
  processing: { label: "处理中", variant: "secondary" },
  pending: { label: "排队中", variant: "outline" },
  failed: { label: "失败", variant: "destructive" },
};

export function ReviewHistoryItem({ review }: Props) {
  const status = statusConfig[review.status] || statusConfig.pending;

  return (
    <Link
      href={`/review?reviewId=${review.id}`}
      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
    >
      {/* Score badge */}
      {review.score !== null ? (
        <div className="h-12 w-12 rounded-full bg-flame/10 flex items-center justify-center">
          <span className="text-lg font-bold text-flame">{review.score}</span>
        </div>
      ) : (
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <span className="text-sm text-muted-foreground">--</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {review.jobCompany} · {review.jobTitle}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {review.resumeFileName} · {new Date(review.createdAt).toLocaleDateString("zh-CN")}
        </p>
      </div>

      <Badge variant={status.variant}>{status.label}</Badge>
    </Link>
  );
}
```

- [ ] **Step 3: Create upload resume dialog**

Create `components/profile/upload-resume-dialog.tsx`:

```tsx
"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface Props {
  onUploaded: () => void;
}

export function UploadResumeDialog({ onUploaded }: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || "上传失败");
      } else {
        setOpen(false);
        onUploaded();
      }
    } catch {
      setError("网络错误");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-flame hover:bg-flame-600">
          <Upload className="h-4 w-4 mr-2" />
          上传简历
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>上传简历</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-flame transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">点击选择文件</p>
            <p className="text-xs text-muted-foreground mt-1">支持 PDF / Word，最大 10MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {uploading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              上传中...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Create profile page**

Create `app/(main)/profile/page.tsx`:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ResumeCard } from "@/components/profile/resume-card";
import { ReviewHistoryItem } from "@/components/profile/review-history-item";
import { UploadResumeDialog } from "@/components/profile/upload-resume-dialog";
import { ResumeItem, ReviewItem, UserProfile } from "@/types";
import { FileText, Star, FileSearch } from "lucide-react";

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [favorites, setFavorites] = useState<Array<{ id: string; company: string; title: string }>>([]);

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/user/profile");
    const json = await res.json();
    if (json.data) setProfile(json.data);
  }, []);

  const loadResumes = useCallback(async () => {
    const res = await fetch("/api/resumes");
    const json = await res.json();
    setResumes(json.data || []);
  }, []);

  const loadReviews = useCallback(async () => {
    const res = await fetch("/api/reviews?pageSize=50");
    const json = await res.json();
    setReviews(json.data || []);
  }, []);

  const loadFavorites = useCallback(async () => {
    const res = await fetch("/api/favorites?pageSize=50");
    const json = await res.json();
    setFavorites(json.data || []);
  }, []);

  useEffect(() => {
    loadProfile();
    loadResumes();
    loadReviews();
    loadFavorites();
  }, [loadProfile, loadResumes, loadReviews, loadFavorites]);

  const handleDeleteResume = async (id: string) => {
    await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    loadResumes();
    loadProfile();
  };

  const handleDownloadResume = async (id: string) => {
    const res = await fetch(`/api/resumes/${id}/url`);
    const json = await res.json();
    if (json.data?.url) window.open(json.data.url, "_blank");
  };

  return (
    <div>
      {/* User Card */}
      <Card className="bg-card border-border mb-6">
        <CardContent className="pt-6 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={clerkUser?.imageUrl} />
            <AvatarFallback className="bg-flame/10 text-flame text-lg">
              {profile?.name?.[0] || profile?.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{profile?.name || profile?.email}</h2>
            <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" /> {profile?.stats.resumeCount || 0} 份简历
              </span>
              <span className="flex items-center gap-1">
                <FileSearch className="h-4 w-4" /> {profile?.stats.reviewCount || 0} 次锐评
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" /> {profile?.stats.favoriteCount || 0} 个收藏
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="resumes">
        <TabsList className="mb-4">
          <TabsTrigger value="resumes">简历库</TabsTrigger>
          <TabsTrigger value="reviews">锐评记录</TabsTrigger>
          <TabsTrigger value="favorites">收藏夹</TabsTrigger>
        </TabsList>

        <TabsContent value="resumes">
          <div className="mb-4">
            <UploadResumeDialog onUploaded={() => { loadResumes(); loadProfile(); }} />
          </div>
          <div className="grid gap-3">
            {resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">还没有上传简历</p>
            ) : (
              resumes.map((r) => (
                <ResumeCard
                  key={r.id}
                  resume={r}
                  onDelete={handleDeleteResume}
                  onDownload={handleDownloadResume}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="grid gap-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">还没有锐评记录</p>
            ) : (
              reviews.map((r) => <ReviewHistoryItem key={r.id} review={r} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="grid gap-3">
            {favorites.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">还没有收藏岗位</p>
            ) : (
              favorites.map((f) => (
                <div key={f.id} className="p-4 rounded-lg border border-border">
                  <p className="text-sm font-medium">{f.company} · {f.title}</p>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
cd /d/Intern-King/intern-king
npm run build
```

- [ ] **Step 6: Commit**

```bash
cd /d/Intern-King
git add intern-king/components/profile/ intern-king/app/\(main\)/profile/
git commit -m "feat: add profile page with resume library, review history, and favorites"
```

---

## Phase 7: Seed Data & Final Verification (Tasks 23-24)

### Task 23: Seed Data Script

**Files:**
- Create: `intern-king/prisma/seed.ts`
- Modify: `intern-king/package.json` (add seed script)

- [ ] **Step 1: Write seed script with mock job data**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const jobs = [
  {
    company: "腾讯",
    title: "前端开发实习生",
    type: "summer",
    location: "深圳,北京",
    category: "研发",
    description: "负责腾讯产品的前端开发工作，使用 React/Vue 技术栈。要求：熟悉 HTML/CSS/JavaScript，了解至少一种前端框架，有 TypeScript 经验加分。实习时间不少于 3 个月。",
    applyUrl: "https://join.qq.com",
    source: "manual",
    publishedAt: new Date(),
  },
  {
    company: "阿里巴巴",
    title: "Java 后端开发实习生",
    type: "summer",
    location: "杭州,北京",
    category: "研发",
    description: "参与阿里核心业务系统后端开发。要求：熟悉 Java 编程，了解 Spring Boot 框架，熟悉 MySQL 等关系型数据库，了解分布式系统基本概念。",
    applyUrl: "https://talent.alibaba.com",
    source: "manual",
    publishedAt: new Date(),
  },
  {
    company: "字节跳动",
    title: "产品经理实习生",
    type: "summer",
    location: "北京,上海",
    category: "产品",
    description: "参与抖音/飞书等产品的需求分析和产品设计。要求：逻辑思维清晰，有用户思维，熟悉常用产品分析工具，有产品设计或运营相关经验优先。",
    applyUrl: "https://jobs.bytedance.com",
    source: "manual",
    publishedAt: new Date(),
  },
  {
    company: "美团",
    title: "数据分析实习生",
    type: "daily",
    location: "北京,上海",
    category: "研发",
    description: "负责业务数据分析和报表搭建。要求：熟悉 SQL，了解 Python/R 等数据分析工具，有统计学基础，能独立完成数据分析项目。",
    applyUrl: "https://zhaopin.meituan.com",
    source: "manual",
    publishedAt: new Date(),
  },
  {
    company: "小红书",
    title: "运营实习生",
    type: "daily",
    location: "上海",
    category: "运营",
    description: "负责社区内容运营，包括话题策划、内容审核、数据复盘。要求：熟悉小红书平台，有内容创作或社区运营经验，对美妆/时尚/生活方式感兴趣。",
    applyUrl: "https://job.xiaohongshu.com",
    source: "manual",
    publishedAt: new Date(),
  },
  {
    company: "网易",
    title: "游戏策划实习生",
    type: "summer",
    location: "广州,杭州",
    category: "产品",
    description: "参与网易游戏的关卡设计和数值策划。要求：热爱游戏，有丰富的游戏经验，逻辑思维强，有游戏策划案或 Mod 制作经验优先。",
    applyUrl: "https://hr.163.com",
    source: "manual",
    publishedAt: new Date(),
  },
  {
    company: "华为",
    title: "C++ 开发实习生",
    type: "summer",
    location: "深圳,成都,南京",
    category: "研发",
    description: "参与华为终端/云计算产品的 C++ 开发。要求：扎实的 C/C++ 基础，了解数据结构与算法，熟悉 Linux 开发环境，有系统编程经验优先。",
    applyUrl: "https://career.huawei.com",
    source: "manual",
    publishedAt: new Date(),
  },
  {
    company: "京东",
    title: "UI 设计实习生",
    type: "daily",
    location: "北京",
    category: "设计",
    description: "负责京东 App/Web 端的界面设计和交互优化。要求：熟练使用 Figma/Sketch，有完整的设计作品集，了解设计规范和组件化设计思维。",
    applyUrl: "https://zhaopin.jd.com",
    source: "manual",
    publishedAt: new Date(),
  },
  {
    company: "百度",
    title: "算法工程师实习生",
    type: "summer",
    location: "北京,深圳",
    category: "研发",
    description: "参与搜索/推荐/NLP 等方向的算法研发。要求：扎实的数学和统计学基础，熟悉 Python 和深度学习框架（PyTorch/TensorFlow），有论文发表或竞赛经验优先。",
    applyUrl: "https://talent.baidu.com",
    source: "manual",
    publishedAt: new Date(),
  },
  {
    company: "快手",
    title: "测试开发实习生",
    type: "daily",
    location: "北京",
    category: "研发",
    description: "负责快手产品的自动化测试框架搭建和维护。要求：熟悉 Python/Java，了解自动化测试框架，有测试开发经验优先。",
    applyUrl: "https://zhaopin.kuaishou.cn",
    source: "manual",
    publishedAt: new Date(),
  },
];

async function main() {
  console.log("Seeding jobs...");

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { id: `seed-${job.company}-${job.title}`.replace(/\s+/g, "-").toLowerCase() },
      update: job,
      create: {
        id: `seed-${job.company}-${job.title}`.replace(/\s+/g, "-").toLowerCase(),
        ...job,
      },
    });
  }

  console.log(`Seeded ${jobs.length} jobs`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
```

- [ ] **Step 2: Add seed script to package.json**

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

Also install tsx:

```bash
cd /d/Intern-King/intern-king
npm install tsx --save-dev
```

- [ ] **Step 3: Run seed**

```bash
cd /d/Intern-King/intern-king
npx prisma db seed
```

Expected: "Seeded 10 jobs"

- [ ] **Step 4: Commit**

```bash
cd /d/Intern-King
git add intern-king/prisma/seed.ts intern-king/package.json
git commit -m "feat: add seed script with 10 sample job postings"
```

---

### Task 24: Full Build Verification & Final Commit

- [ ] **Step 1: Run full build**

```bash
cd /d/Intern-King/intern-king
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run dev server and smoke test**

```bash
cd /d/Intern-King/intern-king
npm run dev
```

Manual verification checklist:
1. http://localhost:3000 — Landing page renders with hero + features
2. Click "注册" — Redirects to Clerk sign-up (requires Clerk keys)
3. After login — Sidebar with 实习广场/AI锐评/个人中心
4. /jobs — Table shows seeded jobs with filters
5. /review — Left-right split layout with input panel
6. /profile — User card + three tabs

- [ ] **Step 3: Final commit**

```bash
cd /d/Intern-King
git add -A
git status
git commit -m "chore: final build verification pass"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1. Foundation | 1-4 | Project scaffold, Prisma, types, Clerk auth |
| 2. Jobs Backend | 5-7 | Job service, user APIs, admin APIs |
| 3. Favorites & Resumes | 8-11 | Favorites, Supabase storage, resume upload/parse |
| 4. AI Pipeline | 12-16 | DeepSeek client, prompts, Tavily search, review workflow, APIs |
| 5. UI Foundation | 17-18 | Dark theme, shadcn/ui, sidebar layout |
| 6. Feature Pages | 19-22 | Landing, auth, jobs table, AI review, profile |
| 7. Finalization | 23-24 | Seed data, full verification |

**Total: 24 tasks, ~100 steps**
