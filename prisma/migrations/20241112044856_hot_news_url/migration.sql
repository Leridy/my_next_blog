-- DropIndex
DROP INDEX "HotNews_url_key";

-- AlterTable
ALTER TABLE "HotNews" ALTER COLUMN "url" SET DEFAULT '';
