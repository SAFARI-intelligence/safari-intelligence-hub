CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION sync_location_geo_point()
RETURNS trigger AS $$
BEGIN
  NEW."geoPoint" := ST_SetSRID(ST_MakePoint(NEW."longitude"::double precision, NEW."latitude"::double precision), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS location_geo_point_trigger ON "Location";
CREATE TRIGGER location_geo_point_trigger
BEFORE INSERT OR UPDATE OF "longitude", "latitude"
ON "Location"
FOR EACH ROW
EXECUTE FUNCTION sync_location_geo_point();

UPDATE "Location"
SET "geoPoint" = ST_SetSRID(ST_MakePoint("longitude"::double precision, "latitude"::double precision), 4326)
WHERE "geoPoint" IS NULL;

CREATE INDEX IF NOT EXISTS idx_location_geo_point_gist ON "Location" USING GIST ("geoPoint");
CREATE INDEX IF NOT EXISTS idx_hotel_promoted_until ON "Hotel" ("promotedUntil");
CREATE INDEX IF NOT EXISTS idx_story_animal_created ON "Story" ("animalId", "createdAt" DESC);
