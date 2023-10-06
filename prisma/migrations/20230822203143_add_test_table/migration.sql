-- CreateTable
CREATE TABLE `Test` (
    `id` VARCHAR(50) NOT NULL,
    `moduleId` VARCHAR(50) NOT NULL,
    `question` VARCHAR(255) NOT NULL,
    `answers` VARCHAR(1023) NOT NULL,
    `correctAnswer` VARCHAR(254) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Test` ADD CONSTRAINT `Test_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
