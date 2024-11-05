/*
  Warnings:

  - A unique constraint covering the columns `[uniqueId]` on the table `HotNews` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uniqueId` to the `HotNews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HotNews" ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "uniqueId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "HotNews_uniqueId_key" ON "HotNews"("uniqueId");
