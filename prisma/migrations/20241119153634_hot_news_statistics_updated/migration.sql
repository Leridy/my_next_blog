/*
  Warnings:

  - A unique constraint covering the columns `[newsId]` on the table `HotNewsStatistics` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HotNewsStatistics_newsId_key" ON "HotNewsStatistics"("newsId");
