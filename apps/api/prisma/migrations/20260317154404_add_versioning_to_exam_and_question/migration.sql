-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;
