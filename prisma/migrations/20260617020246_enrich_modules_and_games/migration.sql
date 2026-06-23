-- AlterTable
ALTER TABLE `modules` DROP COLUMN `connections`,
    DROP COLUMN `has_connections`,
    DROP COLUMN `has_quiz`,
    DROP COLUMN `has_wordle`,
    DROP COLUMN `quiz`,
    DROP COLUMN `wordle`,
    ADD COLUMN `journey_milestone` VARCHAR(191) NULL,
    ADD COLUMN `order_index` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `games` (
    `id` VARCHAR(191) NOT NULL,
    `module_id` VARCHAR(191) NOT NULL,
    `type` ENUM('quiz', 'wordle', 'connections') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `difficulty` ENUM('easy', 'moderate', 'hard') NOT NULL DEFAULT 'easy',
    `points_value` INTEGER NOT NULL DEFAULT 0,
    `estimated_mins` INTEGER NOT NULL DEFAULT 0,
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `config` JSON NOT NULL,

    INDEX `games_module_id_idx`(`module_id`),
    UNIQUE INDEX `games_module_id_type_key`(`module_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `modules_slug_key` ON `modules`(`slug`);

-- AddForeignKey
ALTER TABLE `games` ADD CONSTRAINT `games_module_id_fkey` FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

