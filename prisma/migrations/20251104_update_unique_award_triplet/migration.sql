DROP INDEX `uq_awards_category_per_edition` ON `Award`;
CREATE UNIQUE INDEX `uq_awards_category_award_per_edition` ON `Award` (`event_edition_id`, `category_name`, `award_name`);