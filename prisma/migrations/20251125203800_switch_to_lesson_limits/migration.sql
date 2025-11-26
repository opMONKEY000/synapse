/*
  Warnings:

  - You are about to drop the column `dailyTokenCount` on the `user_usage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_usage" DROP COLUMN "dailyTokenCount",
ADD COLUMN     "dailyLessonCount" INTEGER NOT NULL DEFAULT 0;
