ALTER TABLE `Submission`
    ADD COLUMN `reviewed_at` DATETIME(3) NULL,
  ADD COLUMN `review_note` VARCHAR(500) NULL;