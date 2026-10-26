-- Anonymous entries are admin-only: they are never published.
UPDATE `donations` SET `is_published` = 0
WHERE `is_published` = 1
  AND (coalesce(`is_anonymous`, 0) = 1
       OR `contributor_id` IN (SELECT `id` FROM `contributors` WHERE `is_anonymous` = 1));
