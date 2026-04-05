import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const companies = [
  { name: "腾讯", abbr: "TX", categories: ["后端", "前端", "算法", "产品", "数据", "测试", "游戏", "运营"], locations: ["深圳", "北京", "上海", "成都", "广州"], types: ["暑期实习", "日常实习"], careerUrl: "https://join.qq.com" },
  { name: "阿里巴巴", abbr: "AL", categories: ["后端", "前端", "算法", "产品", "数据", "设计", "运营"], locations: ["杭州", "北京", "上海", "深圳", "广州"], types: ["暑期实习", "日常实习"], careerUrl: "https://talent.alibaba.com" },
  { name: "字节跳动", abbr: "BD", categories: ["后端", "前端", "算法", "产品", "数据", "测试", "运营", "设计"], locations: ["北京", "上海", "深圳", "杭州", "成都", "广州"], types: ["暑期实习", "日常实习"], careerUrl: "https://jobs.bytedance.com" },
  { name: "美团", abbr: "MT", categories: ["后端", "前端", "算法", "产品", "数据", "测试"], locations: ["北京", "上海", "成都"], types: ["暑期实习", "日常实习"], careerUrl: "https://zhaopin.meituan.com" },
  { name: "京东", abbr: "JD", categories: ["后端", "前端", "算法", "产品", "数据", "测试", "运营"], locations: ["北京", "上海", "深圳", "成都", "武汉"], types: ["暑期实习", "日常实习"], careerUrl: "https://campus.jd.com" },
  { name: "百度", abbr: "Bd", categories: ["后端", "前端", "算法", "产品", "数据", "测试"], locations: ["北京", "上海", "深圳"], types: ["暑期实习", "日常实习"], careerUrl: "https://talent.baidu.com" },
  { name: "网易", abbr: "WY", categories: ["后端", "前端", "游戏", "产品", "设计", "运营"], locations: ["杭州", "广州", "北京", "上海"], types: ["暑期实习", "日常实习"], careerUrl: "https://campus.163.com" },
  { name: "小红书", abbr: "XH", categories: ["后端", "前端", "算法", "产品", "数据", "设计", "运营"], locations: ["上海", "北京", "武汉"], types: ["暑期实习", "日常实习"], careerUrl: "https://job.xiaohongshu.com" },
  { name: "快手", abbr: "KS", categories: ["后端", "前端", "算法", "产品", "数据", "测试"], locations: ["北京", "上海", "深圳", "杭州"], types: ["暑期实习", "日常实习"], careerUrl: "https://zhaopin.kuaishou.cn" },
  { name: "华为", abbr: "HW", categories: ["后端", "算法", "硬件", "测试", "数据"], locations: ["深圳", "北京", "上海", "成都", "武汉", "西安", "南京"], types: ["暑期实习"], careerUrl: "https://career.huawei.com" },
  { name: "bilibili", abbr: "B站", categories: ["后端", "前端", "算法", "产品", "运营", "设计", "游戏"], locations: ["上海", "北京", "杭州", "武汉", "成都"], types: ["暑期实习", "日常实习"], careerUrl: "https://jobs.bilibili.com" },
  { name: "拼多多", abbr: "PD", categories: ["后端", "前端", "算法", "产品", "数据"], locations: ["上海", "北京", "广州"], types: ["暑期实习", "日常实习"], careerUrl: "https://careers.pinduoduo.com" },
  { name: "滴滴", abbr: "DD", categories: ["后端", "前端", "算法", "产品", "数据", "测试"], locations: ["北京", "杭州", "上海"], types: ["暑期实习", "日常实习"], careerUrl: "https://talent.didiglobal.com" },
  { name: "携程", abbr: "CT", categories: ["后端", "前端", "产品", "数据", "测试", "运营"], locations: ["上海", "北京", "南京", "成都"], types: ["暑期实习", "日常实习"], careerUrl: "https://campus.ctrip.com" },
  { name: "商汤科技", abbr: "ST", categories: ["算法", "后端", "数据", "产品"], locations: ["北京", "上海", "深圳", "杭州"], types: ["暑期实习", "日常实习"], careerUrl: "https://hr.sensetime.com" },
  { name: "大疆", abbr: "DJ", categories: ["算法", "后端", "硬件", "测试", "产品"], locations: ["深圳", "上海", "北京"], types: ["暑期实习", "日常实习"], careerUrl: "https://we.dji.com" },
  { name: "蚂蚁集团", abbr: "MY", categories: ["后端", "前端", "算法", "产品", "数据", "测试"], locations: ["杭州", "北京", "上海", "成都"], types: ["暑期实习"], careerUrl: "https://talent.antgroup.com" },
  { name: "微软中国", abbr: "MS", categories: ["后端", "前端", "算法", "产品", "数据", "测试"], locations: ["北京", "上海", "深圳", "苏州"], types: ["暑期实习", "日常实习"], careerUrl: "https://careers.microsoft.com" },
  { name: "谷歌中国", abbr: "GG", categories: ["后端", "算法", "前端", "产品"], locations: ["北京", "上海"], types: ["暑期实习"], careerUrl: "https://careers.google.com" },
  { name: "亚马逊中国", abbr: "AZ", categories: ["后端", "算法", "数据", "产品", "运营"], locations: ["北京", "上海", "深圳"], types: ["暑期实习", "日常实习"], careerUrl: "https://www.amazon.jobs" },
  { name: "苹果中国", abbr: "AP", categories: ["后端", "算法", "硬件", "设计", "产品"], locations: ["北京", "上海", "深圳"], types: ["暑期实习"], careerUrl: "https://jobs.apple.com" },
  { name: "英伟达中国", abbr: "NV", categories: ["算法", "后端", "硬件", "数据"], locations: ["北京", "上海", "深圳"], types: ["暑期实习", "日常实习"], careerUrl: "https://nvidia.wd5.myworkdayjobs.com" },
  { name: "Intel中国", abbr: "IN", categories: ["后端", "算法", "硬件", "测试", "数据"], locations: ["北京", "上海", "成都", "大连"], types: ["暑期实习"], careerUrl: "https://jobs.intel.com" },
  { name: "三星中国", abbr: "SS", categories: ["后端", "算法", "硬件", "测试"], locations: ["北京", "上海", "深圳", "西安"], types: ["暑期实习"], careerUrl: "https://www.samsung.com/cn/about-us/careers/" },
  { name: "OPPO", abbr: "OP", categories: ["后端", "前端", "算法", "硬件", "测试", "设计"], locations: ["深圳", "北京", "上海", "成都"], types: ["暑期实习", "日常实习"], careerUrl: "https://careers.oppo.com" },
  { name: "vivo", abbr: "Vi", categories: ["后端", "前端", "算法", "硬件", "测试"], locations: ["深圳", "北京", "上海", "南京", "东莞"], types: ["暑期实习", "日常实习"], careerUrl: "https://hr.vivo.com" },
  { name: "小米", abbr: "Mi", categories: ["后端", "前端", "算法", "产品", "硬件", "测试", "设计"], locations: ["北京", "上海", "深圳", "南京", "武汉"], types: ["暑期实习", "日常实习"], careerUrl: "https://hr.xiaomi.com" },
  { name: "联想", abbr: "LX", categories: ["后端", "算法", "硬件", "产品", "测试", "数据"], locations: ["北京", "上海", "深圳", "成都", "武汉"], types: ["暑期实习"], careerUrl: "https://talent.lenovo.com.cn" },
  { name: "荣耀", abbr: "HR", categories: ["后端", "算法", "硬件", "测试", "产品"], locations: ["深圳", "北京", "上海", "西安", "成都"], types: ["暑期实习", "日常实习"], careerUrl: "https://career.hihonor.com" },
  { name: "中兴", abbr: "ZX", categories: ["后端", "算法", "硬件", "测试"], locations: ["深圳", "上海", "南京", "西安", "成都"], types: ["暑期实习"], careerUrl: "https://job.zte.com.cn" },
  { name: "米哈游", abbr: "MH", categories: ["后端", "前端", "游戏", "算法", "设计", "产品"], locations: ["上海", "北京", "深圳", "蒙特利尔"], types: ["暑期实习", "日常实习"], careerUrl: "https://join.mihoyo.com" },
  { name: "蔚来", abbr: "NI", categories: ["后端", "算法", "硬件", "数据", "产品", "测试"], locations: ["上海", "北京", "合肥", "深圳"], types: ["暑期实习", "日常实习"], careerUrl: "https://nio.jobs.feishu.cn" },
  { name: "理想汽车", abbr: "理", categories: ["后端", "算法", "硬件", "数据", "测试"], locations: ["北京", "上海", "成都", "常州"], types: ["暑期实习", "日常实习"], careerUrl: "https://www.lixiang.com/employ" },
  { name: "小鹏汽车", abbr: "XP", categories: ["后端", "算法", "硬件", "数据", "测试", "产品"], locations: ["广州", "北京", "上海", "深圳"], types: ["暑期实习", "日常实习"], careerUrl: "https://job.xpeng.com" },
  { name: "度小满", abbr: "DX", categories: ["后端", "前端", "算法", "数据", "产品", "测试"], locations: ["北京", "上海", "深圳"], types: ["暑期实习", "日常实习"], careerUrl: "https://campus.duxiaoman.com" },
  { name: "旷视科技", abbr: "旷", categories: ["算法", "后端", "数据", "产品"], locations: ["北京", "上海", "南京"], types: ["暑期实习", "日常实习"], careerUrl: "https://job.megvii.com" },
  { name: "深信服", abbr: "SF", categories: ["后端", "前端", "算法", "测试", "产品"], locations: ["深圳", "北京", "上海", "成都", "长沙"], types: ["暑期实习", "日常实习"], careerUrl: "https://hr.sangfor.com" },
  { name: "海康威视", abbr: "HK", categories: ["后端", "算法", "硬件", "测试", "数据"], locations: ["杭州", "北京", "上海", "深圳", "武汉"], types: ["暑期实习"], careerUrl: "https://campushr.hikvision.com" },
  { name: "科大讯飞", abbr: "KD", categories: ["算法", "后端", "数据", "产品", "测试"], locations: ["合肥", "北京", "上海", "深圳"], types: ["暑期实习", "日常实习"], careerUrl: "https://campus.iflytek.com" },
  { name: "汇量科技", abbr: "MB", categories: ["后端", "前端", "数据", "算法", "产品"], locations: ["广州", "北京", "上海"], types: ["暑期实习", "日常实习"], careerUrl: "https://www.mobvista.com/cn/career/" },
];

async function main() {
  console.log("Seeding companies...");

  for (const company of companies) {
    await prisma.company.upsert({
      where: { name: company.name },
      update: company,
      create: company,
    });
  }

  console.log(`Seeded ${companies.length} companies`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
