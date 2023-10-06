/*
  Warnings:

  - Added the required column `numberOfRatings` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Course` ADD COLUMN `numberOfRatings` INTEGER NOT NULL;
