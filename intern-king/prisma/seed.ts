import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const jobs = [
  {
    company: "腾讯",
    title: "前端开发实习生",
    type: "summer",
    location: "深圳,北京",
    category: "研发",
    description:
      "负责腾讯产品的前端开发工作，使用 React/Vue 技术栈。要求：熟悉 HTML/CSS/JavaScript，了解至少一种前端框架，有 TypeScript 经验加分。实习时间不少于 3 个月。",
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
    description:
      "参与阿里核心业务系统后端开发。要求：熟悉 Java 编程，了解 Spring Boot 框架，熟悉 MySQL 等关系型数据库，了解分布式系统基本概念。",
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
    description:
      "参与抖音/飞书等产品的需求分析和产品设计。要求：逻辑思维清晰，有用户思维，熟悉常用产品分析工具，有产品设计或运营相关经验优先。",
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
    description:
      "负责业务数据分析和报表搭建。要求：熟悉 SQL，了解 Python/R 等数据分析工具，有统计学基础，能独立完成数据分析项目。",
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
    description:
      "负责社区内容运营，包括话题策划、内容审核、数据复盘。要求：熟悉小红书平台，有内容创作或社区运营经验，对美妆/时尚/生活方式感兴趣。",
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
    description:
      "参与网易游戏的关卡设计和数值策划。要求：热爱游戏，有丰富的游戏经验，逻辑思维强，有游戏策划案或 Mod 制作经验优先。",
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
    description:
      "参与华为终端/云计算产品的 C++ 开发。要求：扎实的 C/C++ 基础，了解数据结构与算法，熟悉 Linux 开发环境，有系统编程经验优先。",
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
    description:
      "负责京东 App/Web 端的界面设计和交互优化。要求：熟练使用 Figma/Sketch，有完整的设计作品集，了解设计规范和组件化设计思维。",
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
    description:
      "参与搜索/推荐/NLP 等方向的算法研发。要求：扎实的数学和统计学基础，熟悉 Python 和深度学习框架（PyTorch/TensorFlow），有论文发表或竞赛经验优先。",
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
    description:
      "负责快手产品的自动化测试框架搭建和维护。要求：熟悉 Python/Java，了解自动化测试框架，有测试开发经验优先。",
    applyUrl: "https://zhaopin.kuaishou.cn",
    source: "manual",
    publishedAt: new Date(),
  },
];

async function main() {
  console.log("Seeding jobs...");

  for (const job of jobs) {
    const id = `seed-${job.company}-${job.title}`
      .replace(/\s+/g, "-")
      .toLowerCase();
    await prisma.job.upsert({
      where: { id },
      update: job,
      create: {
        id,
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
