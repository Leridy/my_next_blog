/*
  Warnings:

  - You are about to drop the column `visitorCount` on the `visitor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "visitor" DROP COLUMN "visitorCount",
ADD COLUMN     "visitedCount" INTEGER NOT NULL DEFAULT 0;
