-- CreateTable
CREATE TABLE `users` (
    `email` VARCHAR(100) NOT NULL,
    `username` VARCHAR(20) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `image` INTEGER NOT NULL DEFAULT 1,
    `refreshToken` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
