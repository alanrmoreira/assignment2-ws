ALTER TABLE `Award` ADD COLUMN `award_name` VARCHAR(120) NOT NULL DEFAULT '';
UPDATE `Award` SET `award_name` = `category_name` WHERE `award_name` = '';