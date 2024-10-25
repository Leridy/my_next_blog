/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `HotTopic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[url]` on the table `HotTopic` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `newsList` on the `HotTopic` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "HotTopic" ALTER COLUMN "description" SET DEFAULT '',
ALTER COLUMN "image" SET DEFAULT '',
DROP COLUMN "newsList",
ADD COLUMN     "newsList" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HotTopic_name_key" ON "HotTopic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HotTopic_url_key" ON "HotTopic"("url");
