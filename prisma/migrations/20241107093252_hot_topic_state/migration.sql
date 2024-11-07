-- AlterTable
ALTER TABLE "HotTopic" ADD COLUMN     "enable" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "friendLink" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "image" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "friendLink_id_key" ON "friendLink"("id");

-- CreateIndex
CREATE UNIQUE INDEX "friendLink_name_key" ON "friendLink"("name");

-- CreateIndex
CREATE UNIQUE INDEX "friendLink_url_key" ON "friendLink"("url");
