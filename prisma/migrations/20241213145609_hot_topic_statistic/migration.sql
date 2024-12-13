-- CreateTable
CREATE TABLE "HotTopicStatistics" (
    "id" SERIAL NOT NULL,
    "topicId" INTEGER NOT NULL,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotTopicStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HotTopicStatistics_topicId_key" ON "HotTopicStatistics"("topicId");
