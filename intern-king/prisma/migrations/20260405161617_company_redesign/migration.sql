-- Step 1: Add new columns to Review as NULLABLE first
ALTER TABLE "Review" ADD COLUMN "company" TEXT;
ALTER TABLE "Review" ADD COLUMN "position" TEXT;
ALTER TABLE "Review" ADD COLUMN "jobDescription" TEXT;
ALTER TABLE "Review" ADD COLUMN "category" TEXT;
ALTER TABLE "Review" ADD COLUMN "type" TEXT;

-- Step 2: Backfill from Job table
UPDATE "Review" SET
  "company" = "Job"."company",
  "position" = "Job"."title",
  "jobDescription" = "Job"."description"
FROM "Job"
WHERE "Review"."jobId" = "Job"."id";

-- Step 3: Fill any orphaned reviews (jobId points to deleted Job)
UPDATE "Review" SET
  "company" = '未知公司',
  "position" = '未知岗位',
  "jobDescription" = '无'
WHERE "company" IS NULL;

-- Step 4: Now make them NOT NULL
ALTER TABLE "Review" ALTER COLUMN "company" SET NOT NULL;
ALTER TABLE "Review" ALTER COLUMN "position" SET NOT NULL;
ALTER TABLE "Review" ALTER COLUMN "jobDescription" SET NOT NULL;

-- Step 5: Drop old Review foreign key and index
ALTER TABLE "Review" DROP CONSTRAINT "Review_jobId_fkey";
DROP INDEX "Review_jobId_idx";
ALTER TABLE "Review" DROP COLUMN "jobId";

-- Step 6: Drop old Favorite foreign key and recreate with companyId
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_jobId_fkey";
DROP INDEX "Favorite_userId_jobId_key";

-- Clear old favorites (they reference jobs, not companies)
DELETE FROM "Favorite";

ALTER TABLE "Favorite" DROP COLUMN "jobId";
ALTER TABLE "Favorite" ADD COLUMN "companyId" TEXT NOT NULL;

-- Step 7: Drop Job table
DROP TABLE "Job";

-- Step 8: Create Company table
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbr" TEXT NOT NULL,
    "categories" TEXT[],
    "locations" TEXT[],
    "types" TEXT[],
    "careerUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- Step 9: Create indexes and constraints
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");
CREATE INDEX "Company_name_idx" ON "Company"("name");
CREATE UNIQUE INDEX "Favorite_userId_companyId_key" ON "Favorite"("userId", "companyId");

-- Step 10: Add foreign key for Favorite -> Company
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
