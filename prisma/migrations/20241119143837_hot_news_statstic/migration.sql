-- CreateTable
CREATE TABLE "HotNewsStatstic" (
    "id" SERIAL NOT NULL,
    "newsId" INTEGER NOT NULL,
    "hotCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotNewsStatstic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HotNewsStatstic" ADD CONSTRAINT "HotNewsStatstic_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "HotNews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
