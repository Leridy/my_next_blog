/*
  Warnings:

  - You are about to drop the column `newsList` on the `HotTopic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HotTopic" DROP COLUMN "newsList",
ADD COLUMN     "spiderId" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "HotNews" (
    "id" SERIAL NOT NULL,
    "spiderId" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "image" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotNews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotSpider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotSpider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HotNews_url_key" ON "HotNews"("url");

-- CreateIndex
CREATE UNIQUE INDEX "HotSpider_name_key" ON "HotSpider"("name");
