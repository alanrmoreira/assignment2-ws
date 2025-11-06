ALTER TABLE `Submission` ADD COLUMN `reviewed_by_user_id` INT NULL;

CREATE INDEX `idx_sub_reviewer` ON `Submission`(`reviewed_by_user_id`);

ALTER TABLE `Submission`
    ADD CONSTRAINT `fk_submission_reviewer`
        FOREIGN KEY (`reviewed_by_user_id`)
            REFERENCES `UsersInEvent`(`id`)
            ON DELETE SET NULL
            ON UPDATE CASCADE;