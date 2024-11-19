/*
  Warnings:

  - You are about to drop the `HotNewsStatstic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HotNewsStatstic" DROP CONSTRAINT "HotNewsStatstic_newsId_fkey";

-- DropTable
DROP TABLE "HotNewsStatstic";

-- CreateTable
CREATE TABLE "HotNewsStatistics" (
    "id" SERIAL NOT NULL,
    "newsId" INTEGER NOT NULL,
    "hotCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotNewsStatistics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HotNewsStatistics" ADD CONSTRAINT "HotNewsStatistics_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "HotNews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
