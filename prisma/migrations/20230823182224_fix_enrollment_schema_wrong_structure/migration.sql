/*
  Warnings:

  - You are about to drop the `Enrolment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Enrolment`;

-- CreateTable
CREATE TABLE `Enrollment` (
    `id` VARCHAR(50) NOT NULL,
    `studentId` VARCHAR(50) NOT NULL,
    `courseId` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
