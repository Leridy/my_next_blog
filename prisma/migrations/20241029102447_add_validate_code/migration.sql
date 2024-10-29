-- CreateTable
CREATE TABLE "validateCode" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "validate" TEXT NOT NULL DEFAULT '',
    "requestTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validateCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "validateCode_id_key" ON "validateCode"("id");

-- CreateIndex
CREATE UNIQUE INDEX "validateCode_sessionId_key" ON "validateCode"("sessionId");
