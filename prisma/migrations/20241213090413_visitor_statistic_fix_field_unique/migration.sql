/*
  Warnings:

  - A unique constraint covering the columns `[browserSign]` on the table `visitor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "visitor_browserSign_key" ON "visitor"("browserSign");
