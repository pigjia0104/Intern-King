# 实习小霸王 (Intern King) — 技术设计文档

> 日期：2026-03-30
> 状态：已审核通过

---

## 1. 产品概述

**实习小霸王**是一站式大学生实习求职平台，核心功能：

- **实习广场**：聚合中大型公司在招的暑期/日常实习岗位，表格化展示 + 多维筛选
- **AI 简历锐评**：用户选择目标岗位 + 上传简历，AI 联网搜索真实面经后生成毒舌锐评
- **用户系统**：账号体系、简历库、收藏夹、锐评记录，数据按用户隔离

目标用户：在校大学生及应届毕业生。

---

## 2. 技术选型

| 维度 | 选择 | 说明 |
|------|------|------|
| 框架 | Next.js 15+ (App Router) | 全栈单体，前后端 TypeScript 统一 |
| 认证 | Clerk | 托管认证，支持邮箱/Google/GitHub 登录，后续可加微信 |
| 数据库 | Supabase PostgreSQL + Prisma ORM | 云端托管，免费层够用 |
| 文件存储 | Supabase Storage | 简历 PDF/Word 存储 |
| AI 模型 | DeepSeek / 智谱 | 国内访问方便，中文能力强，性价比高 |
| 面经搜索 | Tavily Search API | AI 专用搜索，搜索+内容提取一体，免费 1000 次/月 |
| UI 组件 | shadcn/ui + Tailwind CSS | 高质量组件库，深度可定制 |
| 部署 | Vercel | Next.js 原生支持，CI/CD 自动化 |

---

## 3. 架构设计

### 3.1 单体分层架构

MVP 阶段采用 Next.js 单体架构，通过代码分层保证后续可扩展性：

- `app/api/` — HTTP 接口层：参数校验 + 响应格式化，未来移动端直接复用
- `lib/services/` — 业务逻辑层：框架无关，可被任何客户端调用
- `lib/prisma.ts` — 数据访问层：Prisma 单例
- `components/` — UI 展示层：纯组件，不含业务逻辑

扩展路径：

```
MVP:        浏览器 → Next.js Pages → API Routes → DB
加移动端:   App (React Native) ──→ 同一套 API Routes → DB
规模化:     拆出独立 API 服务
```

### 3.2 项目结构

```
intern-king/
├── app/
│   ├── (auth)/sign-in/[[...sign-in]]/    # Clerk 登录
│   ├── (auth)/sign-up/[[...sign-up]]/    # Clerk 注册
│   ├── (main)/                            # 需登录的页面
│   │   ├── dashboard/                     # 首页仪表盘
│   │   ├── jobs/                          # 实习广场
│   │   ├── review/                        # AI 锐评
│   │   └── profile/                       # 个人中心
│   ├── api/                               # REST API
│   │   ├── jobs/                          # 岗位相关
│   │   ├── resumes/                       # 简历相关
│   │   ├── reviews/                       # 锐评相关
│   │   ├── favorites/                     # 收藏相关
│   │   ├── user/                          # 用户信息
│   │   ├── admin/                         # 管理端
│   │   └── webhooks/                      # Clerk Webhook
│   ├── layout.tsx                         # 根布局 (ClerkProvider)
│   └── page.tsx                           # Landing Page
├── lib/
│   ├── services/                          # 核心业务逻辑
│   │   ├── job.service.ts
│   │   ├── resume.service.ts
│   │   ├── review.service.ts
│   │   └── search.service.ts
│   ├── ai/                                # DeepSeek API 封装
│   ├── storage/                           # Supabase Storage 封装
│   ├── prisma.ts                          # Prisma 单例
│   └── utils/
├── types/                                 # 共享 TypeScript 类型
├── components/
│   ├── ui/                                # shadcn/ui 基础组件
│   ├── jobs/                              # 实习广场组件
│   ├── review/                            # 锐评组件
│   └── layout/                            # 导航/侧栏
├── prisma/schema.prisma
├── middleware.ts                           # Clerk 路由保护
└── .env.local                             # 环境变量
```

---

## 4. 数据模型

```prisma
model User {
  id            String     @id @default(cuid())
  clerkId       String     @unique
  email         String     @unique
  name          String?
  avatarUrl     String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  resumes       Resume[]
  favorites     Favorite[]
  reviews       Review[]
}

model Resume {
  id            String     @id @default(cuid())
  userId        String
  fileName      String
  fileUrl       String
  fileType      String                      // "pdf" | "docx"
  parsedText    String?    @db.Text
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  reviews       Review[]

  @@index([userId])
}

model Job {
  id            String     @id @default(cuid())
  company       String
  title         String
  type          String                      // "summer" | "daily"
  location      String                      // 逗号分隔: "北京,上海,深圳"
  category      String                      // 研发/产品/运营/设计
  description   String     @db.Text
  applyUrl      String?
  source        String     @default("manual") // "manual" | "crawler" | "api"
  publishedAt   DateTime?
  isActive      Boolean    @default(true)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  favorites     Favorite[]
  reviews       Review[]

  @@index([company])
  @@index([location])
  @@index([category])
  @@index([type])
}

model Favorite {
  id            String     @id @default(cuid())
  userId        String
  jobId         String
  createdAt     DateTime   @default(now())

  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  job           Job        @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@unique([userId, jobId])
}

model Review {
  id            String     @id @default(cuid())
  userId        String
  jobId         String
  resumeId      String
  status        String     @default("pending") // "pending"|"processing"|"completed"|"failed"
  score         Int?
  content       String?    @db.Text
  searchContext String?    @db.Text
  errorMessage  String?
  createdAt     DateTime   @default(now())

  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  job           Job        @relation(fields: [jobId], references: [id], onDelete: Cascade)
  resume        Resume     @relation(fields: [resumeId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([jobId])
}
```

### 设计要点

- **User ↔ Clerk**：本地不存密码，`clerkId` 关联 Clerk，首次登录通过 Webhook 自动建记录
- **Resume.parsedText**：上传后异步解析缓存，避免每次锐评重复解析。重新上传时清空重新解析
- **Review.status**：支持异步工作流的状态机 (pending → processing → completed/failed)
- **Review.content**：存储 DeepSeek 返回的完整 JSON 字符串（含 roasts/suggestions/questions 等），前端取到后解析渲染
- **Review.score**：从 AI 响应中提取后冗余存储，便于列表页快速展示分数无需反序列化 content
- **Review.searchContext**：保存面经搜索结果，留痕可追溯
- **所有子表 onDelete: Cascade**：删用户级联删除关联数据
- **Favorite 联合唯一约束**：防止重复收藏

---

## 5. 页面设计

线框图文件：项目根目录 `mockups/wireframe.html`（浏览器直接打开）

### 5.1 设计风格

- 暗色主题，火焰橙 (#FF4D00) 为主色调，呼应"小霸王"品牌
- 面向大学生的现代简洁风格，能量感但不浮夸
- shadcn/ui 组件库 + 自定义主题色

### 5.2 页面清单

**Landing Page**
- Hero 区：slogan "不做实习小透明" + CTA 按钮
- 三张特性卡片（实习广场 / AI 锐评 / 精准匹配）
- 底部数据统计

**实习广场 (需登录)**
- 左侧固定导航栏 + 右侧主内容区
- 筛选栏：搜索框 + 地点/类型/方向下拉筛选
- 数据表格：公司(带头像)、岗位、类型 tag、地点 tag、操作按钮
- 每行操作：「去测简历」(主按钮) / 「官网投递」/ 「收藏」
- 底部分页

**AI 简历锐评 (需登录)**
- 左右分栏布局
- 左栏：目标岗位信息（从实习广场携带）+ 选择/上传简历 + 开始锐评按钮
- 右栏：结果展示 — 匹配度环形分数 → 毒舌锐评(带严重程度标签) → 修改建议(STAR 法则示例) → 高频面试题

**个人中心 (需登录)**
- 顶部用户卡片 + 统计数据（简历数/锐评数/收藏数）
- Tab 切换：简历库(卡片网格+上传入口) / 锐评记录(列表+分数徽章) / 收藏夹

---

## 6. AI 锐评工作流

### 6.1 完整流程

```
Step 0: 前置校验
  ├─ 校验 jobId、resumeId 有效性
  ├─ 并发锁：查询用户是否有 pending/processing 的 Review
  │  ├─ 有 → 409 Conflict，提示"有简历正在锐评中"
  │  └─ 无 → 继续
  ├─ 创建 Review (status: "pending")
  ├─ 返回 { reviewId }
  └─ 通过 next/after 触发后台流程

Step 1: 简历解析 (status → "processing")
  ├─ parsedText 有缓存 → 直接使用
  └─ 无缓存 → PDF(pdf-parse) / DOCX(mammoth) 提取
  截断至 ~3000 字

Step 2: 联网搜索面经 (Tavily)
  ├─ 生成 3 个 Query 并发调用
  ├─ 每个取前 5 条结果
  ├─ 部分失败时降级（≥1 个成功即可）
  └─ 合并去重得候选池 (~15 条)

Step 2.5: 面经相关度筛选 (DeepSeek)
  ├─ 输入：岗位信息 + 候选面经(标题+摘要)
  ├─ 对每条打相关度 1-5 分
  ├─ 保留 ≥3 分，取 Top 5
  ├─ 全部 <3 → 标记"未找到高相关面经"
  └─ 截断至 ~4000 字，写入 searchContext

Step 3: 构造 Prompt + 调用 DeepSeek
  ├─ 输入：JD(~1500字) + 面经(~4000字) + 简历(~3000字)
  ├─ 要求输出结构化 JSON
  └─ 解析：正则去除 markdown 包裹，JSON.parse 失败重试 1 次

Step 4: 保存结果
  ├─ 成功 → score + content, status → "completed"
  └─ 失败 → errorMessage, status → "failed"

超时兜底：processing 超过 3 分钟自动标记 failed，释放并发锁
```

### 6.2 并发控制

- 同一用户同一时间只能有一个进行中的锐评
- 不限每日次数
- 后续接入付费系统时改为扣费校验（检查余额/次数包）
- 前端配合：进行中时按钮置灰 + 显示进度

### 6.3 Prompt 设计

**面经筛选 Prompt (Step 2.5)：**

```
System:
你是一个面经相关度评估助手。你的任务是判断每条面经与目标岗位的相关程度。

评分标准（1-5分）：
5分：完全匹配 — 同公司、同岗位、同类型（实习），且内容详实
4分：高度相关 — 同公司同方向，或同岗位不同公司但内容有参考价值
3分：有参考价值 — 相关方向的面经，部分内容可参考
2分：弱相关 — 公司或方向只沾边，参考价值有限
1分：不相关 — 完全不同的岗位/方向，或内容过于陈旧/空洞

User:
【目标岗位】
公司：{company}
岗位：{title}
类型：{type}（暑期实习/日常实习）
方向：{category}

【候选面经列表】
{编号}. 标题：{title}
   来源：{url}
   摘要：{snippet}
---

请对每条面经打分，输出 JSON 数组：
[{ "index": 1, "score": 5, "reason": "同公司同岗位实习面经" }, ...]
```

**核心锐评 Prompt (Step 3)：**

```
System:
你是「实习小霸王」平台的 AI 简历顾问。你的风格是毒舌但专业 ——
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
- 0-29：简历与岗位几乎不匹配

User:
===== 【岗位信息】 =====
公司：{company}
岗位：{title}
类型：{type}
地点：{location}
岗位详情（JD）：
{description}

===== 【面经参考】 =====
{searchContext}

===== 【用户简历】 =====
{parsedText}

===== 【输出要求】 =====
输出以下 JSON（不要添加 JSON 以外的内容）：
{
  "score": <0-100>,
  "summary": "<一句话总评，20字以内，毒舌风格>",
  "roasts": [
    { "point": "<10字以内>", "detail": "<结合JD和面经>", "severity": "critical|warning|info" }
  ],
  "suggestions": [
    { "title": "<10字以内>", "detail": "<含改写示例>" }
  ],
  "interviewQuestions": ["<面经高频题>"],
  "sourcesUsed": "<引用的面经来源>"
}
```

### 6.4 错误处理

| 失败点 | 处理 | 用户提示 |
|--------|------|---------|
| 简历解析失败 | status → failed | "简历格式无法识别，请上传标准 PDF/Word" |
| Tavily 全部失败 | 跳过面经，降级执行 | 结果标注"本次未引用面经" |
| 面经筛选后全部低相关 | 跳过面经，降级执行 | 结果标注"未找到高相关面经" |
| DeepSeek JSON 解析失败 | 重试 1 次 | 仍失败："AI 生成异常，请重试" |
| DeepSeek 超时/限流 | status → failed | "AI 服务繁忙，请稍后重试" |
| 并发锁冲突 | 409 Conflict | "有简历正在锐评中，请等待完成" |

---

## 7. API 设计

### 认证策略

- Clerk middleware 保护所有 `/api/*`，排除 `/api/webhooks/*`
- `/api/admin/*` 使用独立密钥鉴权
- `/api/webhooks/clerk` 验证 Clerk 签名（svix 库）

### 完整接口清单

**岗位（用户端）**

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/jobs` | 岗位列表+筛选+收藏状态 | `?search=&location=&type=&category=&page=&pageSize=` |
| GET | `/api/jobs/:id` | 岗位详情 | - |

**岗位（管理端）**

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/jobs` | 新增岗位 |
| PUT | `/api/admin/jobs/:id` | 编辑岗位 |
| PATCH | `/api/admin/jobs/:id/toggle` | 上架/下架 |

**收藏**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/favorites` | 收藏列表（分页） |
| POST | `/api/favorites` | 添加收藏 `{ jobId }` |
| DELETE | `/api/favorites/:jobId` | 取消收藏 |

**简历**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/resumes` | 简历列表 |
| POST | `/api/resumes/upload` | 上传简历（≤10MB, pdf/docx, ≤10份/用户） |
| GET | `/api/resumes/:id/url` | 签名下载链接（10分钟有效） |
| DELETE | `/api/resumes/:id` | 删除简历 |

**锐评**

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/reviews` | 发起锐评 `{ jobId, resumeId }`（并发锁） |
| GET | `/api/reviews/:id` | 查询状态/结果（轮询：每2秒，最多60次） |
| GET | `/api/reviews` | 锐评记录列表 `?page=&pageSize=&jobId=` |

**用户**

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/webhooks/clerk` | Clerk Webhook（签名验证，不走 Clerk 认证） |
| GET | `/api/user/profile` | 当前用户信息 + 统计数据 |

### 响应格式

```json
// 成功 - 列表
{ "data": [...], "pagination": { "page": 1, "pageSize": 20, "total": 128 } }

// 成功 - 单项
{ "data": { ... } }

// 错误
{ "error": { "code": "CONFLICT", "message": "有简历正在锐评中" } }
```

---

## 8. 前端轮询策略

锐评异步结果的前端获取方式：

- 发起锐评后获得 `reviewId`
- 每 **2 秒**调用 `GET /api/reviews/:id`
- 状态为 `completed` 或 `failed` → 停止轮询，渲染结果
- 最多轮询 **60 次**（2 分钟）→ 超时提示刷新查看
- MVP 用轮询，后续可升级为 SSE / WebSocket
