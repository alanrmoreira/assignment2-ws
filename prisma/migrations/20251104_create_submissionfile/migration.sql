CREATE TABLE `SubmissionFile` (
                                  `id` INT NOT NULL AUTO_INCREMENT,
                                  `submission_id` INT NOT NULL,
                                  `storage_key` VARCHAR(500) NOT NULL,
                                  `original_name` VARCHAR(255) NOT NULL,
                                  `mime_type` VARCHAR(150) NOT NULL,
                                  `size_bytes` INT NOT NULL,
                                  `uploaded_by_user_in_event_id` INT NOT NULL,
                                  PRIMARY KEY (`id`),
                                  INDEX `idx_sf_submission` (`submission_id`),
                                  INDEX `idx_sf_uploader` (`uploaded_by_user_in_event_id`),
                                  CONSTRAINT `SubmissionFile_submission_id_fkey`
                                      FOREIGN KEY (`submission_id`) REFERENCES `Submission`(`id`)
                                          ON DELETE CASCADE ON UPDATE CASCADE,
                                  CONSTRAINT `fk_sf_uploader`
                                      FOREIGN KEY (`uploaded_by_user_in_event_id`) REFERENCES `UsersInEvent`(`id`)
                                          ON DELETE RESTRICT ON UPDATE CASCADE
);