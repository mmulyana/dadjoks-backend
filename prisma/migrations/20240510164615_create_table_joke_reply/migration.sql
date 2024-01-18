-- CreateTable
CREATE TABLE `jokeReplies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `typeReply` ENUM('likes', 'laugh', 'fire') NOT NULL,
    `jokeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jokeReplies` ADD CONSTRAINT `jokeReplies_jokeId_fkey` FOREIGN KEY (`jokeId`) REFERENCES `jokes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
