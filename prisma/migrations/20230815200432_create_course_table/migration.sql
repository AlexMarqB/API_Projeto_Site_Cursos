-- CreateTable
CREATE TABLE `Course` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rating` DOUBLE NOT NULL,
    `photo` VARCHAR(191) NOT NULL,
    `enrollmentsNumber` BIGINT NOT NULL,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
