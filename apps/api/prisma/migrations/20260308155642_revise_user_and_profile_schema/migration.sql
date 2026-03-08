/*
  Warnings:

  - You are about to drop the column `accountNumber` on the `CreatorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `CreatorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `CreatorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `CreatorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `organizationName` on the `CreatorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `tinNumber` on the `CreatorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `LearnerProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LearnerProfile" DROP CONSTRAINT "LearnerProfile_userId_fkey";

-- DropIndex
DROP INDEX "CreatorProfile_tinNumber_key";

-- AlterTable
ALTER TABLE "CreatorProfile" DROP COLUMN "accountNumber",
DROP COLUMN "displayName",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "organizationName",
DROP COLUMN "tinNumber";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl";

-- DropTable
DROP TABLE "LearnerProfile";

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
