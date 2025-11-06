CREATE UNIQUE INDEX `uq_awards_category_per_edition`
    ON `Award` (`event_edition_id`, `category_name`);