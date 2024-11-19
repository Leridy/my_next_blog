/*
  Warnings:

  - You are about to drop the column `hotCount` on the `HotNewsStatistics` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "HotNewsStatistics" DROP CONSTRAINT "HotNewsStatistics_newsId_fkey";

-- AlterTable
ALTER TABLE "HotNewsStatistics" DROP COLUMN "hotCount",
ADD COLUMN     "clickCount" INTEGER NOT NULL DEFAULT 0;
