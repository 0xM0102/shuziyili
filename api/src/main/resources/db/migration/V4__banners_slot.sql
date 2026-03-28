ALTER TABLE banners
  ADD COLUMN slot VARCHAR(32) NULL;

UPDATE banners
SET slot = 'home_main'
WHERE slot IS NULL OR slot = '';

CREATE INDEX idx_banners_slot ON banners(slot);

