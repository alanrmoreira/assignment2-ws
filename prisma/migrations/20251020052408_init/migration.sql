-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventEdition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `submissions_start` DATETIME(3) NOT NULL,
    `submissions_end` DATETIME(3) NOT NULL,
    `votes_start` DATETIME(3) NOT NULL,
    `votes_end` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsersInEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_edition_id` INTEGER NOT NULL,
    `user_name` VARCHAR(120) NOT NULL,
    `user_email` VARCHAR(255) NOT NULL,
    `user_sait_id` VARCHAR(64) NULL,
    `user_permission` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_uie_event`(`event_edition_id`),
    UNIQUE INDEX `UsersInEvent_event_edition_id_user_email_key`(`event_edition_id`, `user_email`),
    UNIQUE INDEX `UsersInEvent_event_edition_id_user_sait_id_key`(`event_edition_id`, `user_sait_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Award` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_edition_id` INTEGER NOT NULL,
    `category_name` VARCHAR(120) NOT NULL,

    INDEX `idx_awards_event`(`event_edition_id`),
    UNIQUE INDEX `Award_event_edition_id_category_name_key`(`event_edition_id`, `category_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Nominee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_in_event_id` INTEGER NOT NULL,
    `award_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_nominees_award`(`award_id`),
    INDEX `idx_nominees_user`(`user_in_event_id`),
    UNIQUE INDEX `Nominee_award_id_user_in_event_id_key`(`award_id`, `user_in_event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Submission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `award_id` INTEGER NOT NULL,
    `user_in_event_id` INTEGER NOT NULL,
    `is_group_submission` BOOLEAN NOT NULL DEFAULT false,
    `contact_name` VARCHAR(120) NOT NULL,
    `contact_email` VARCHAR(255) NOT NULL,
    `project_title` VARCHAR(200) NOT NULL,
    `project_description` VARCHAR(191) NOT NULL,
    `project_cover_image` VARCHAR(500) NULL,
    `project_url` VARCHAR(500) NULL,
    `project_file` VARCHAR(500) NULL,
    `status` VARCHAR(20) NOT NULL,
    `winner` BOOLEAN NOT NULL DEFAULT false,
    `submission_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_sub_award_status`(`award_id`, `status`),
    INDEX `idx_sub_owner`(`user_in_event_id`),
    INDEX `idx_sub_award`(`award_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubmissionMember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `submission_id` INTEGER NOT NULL,
    `user_in_event_id` INTEGER NOT NULL,

    INDEX `idx_sm_sub`(`submission_id`),
    INDEX `idx_sm_uie`(`user_in_event_id`),
    UNIQUE INDEX `SubmissionMember_submission_id_user_in_event_id_key`(`submission_id`, `user_in_event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NomineeVote` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nominee_id` INTEGER NOT NULL,
    `voter_user_in_event_id` INTEGER NOT NULL,
    `vote_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_nv_nominee`(`nominee_id`),
    INDEX `idx_nv_voter`(`voter_user_in_event_id`),
    UNIQUE INDEX `NomineeVote_nominee_id_voter_user_in_event_id_key`(`nominee_id`, `voter_user_in_event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubmissionVote` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `submission_id` INTEGER NOT NULL,
    `voter_user_in_event_id` INTEGER NOT NULL,
    `vote_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_sv_submission`(`submission_id`),
    INDEX `idx_sv_voter`(`voter_user_in_event_id`),
    UNIQUE INDEX `SubmissionVote_submission_id_voter_user_in_event_id_key`(`submission_id`, `voter_user_in_event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsersInEvent` ADD CONSTRAINT `UsersInEvent_event_edition_id_fkey` FOREIGN KEY (`event_edition_id`) REFERENCES `EventEdition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Award` ADD CONSTRAINT `Award_event_edition_id_fkey` FOREIGN KEY (`event_edition_id`) REFERENCES `EventEdition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nominee` ADD CONSTRAINT `Nominee_user_in_event_id_fkey` FOREIGN KEY (`user_in_event_id`) REFERENCES `UsersInEvent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nominee` ADD CONSTRAINT `Nominee_award_id_fkey` FOREIGN KEY (`award_id`) REFERENCES `Award`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_award_id_fkey` FOREIGN KEY (`award_id`) REFERENCES `Award`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_user_in_event_id_fkey` FOREIGN KEY (`user_in_event_id`) REFERENCES `UsersInEvent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmissionMember` ADD CONSTRAINT `SubmissionMember_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `Submission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmissionMember` ADD CONSTRAINT `SubmissionMember_user_in_event_id_fkey` FOREIGN KEY (`user_in_event_id`) REFERENCES `UsersInEvent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NomineeVote` ADD CONSTRAINT `NomineeVote_nominee_id_fkey` FOREIGN KEY (`nominee_id`) REFERENCES `Nominee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NomineeVote` ADD CONSTRAINT `NomineeVote_voter_user_in_event_id_fkey` FOREIGN KEY (`voter_user_in_event_id`) REFERENCES `UsersInEvent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmissionVote` ADD CONSTRAINT `SubmissionVote_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `Submission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmissionVote` ADD CONSTRAINT `SubmissionVote_voter_user_in_event_id_fkey` FOREIGN KEY (`voter_user_in_event_id`) REFERENCES `UsersInEvent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
