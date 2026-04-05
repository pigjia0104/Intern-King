/*
  Warnings:

  - You are about to drop the column `jobId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `jobId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,companyId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobDescription` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_jobId_fkey";

-- DropIndex
DROP INDEX "Favorite_userId_jobId_key";

-- DropIndex
DROP INDEX "Review_jobId_idx";

-- AlterTable
ALTER TABLE "Favorite" DROP COLUMN "jobId",
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "jobId",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "company" TEXT NOT NULL,
ADD COLUMN     "jobDescription" TEXT NOT NULL,
ADD COLUMN     "position" TEXT NOT NULL,
ADD COLUMN     "type" TEXT;

-- DropTable
DROP TABLE "Job";

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_companyId_key" ON "Favorite"("userId", "companyId");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
