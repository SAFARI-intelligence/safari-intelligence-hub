-- SAFARI production bootstrap SQL.
-- Primary schema should be managed through Prisma migrations in /apps/api/prisma/schema.prisma.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure PostGIS point sync + indexes for geo intelligence.
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

CREATE INDEX IF NOT EXISTS idx_location_geo_point_gist ON "Location" USING GIST ("geoPoint");
CREATE INDEX IF NOT EXISTS idx_hotel_promoted_until ON "Hotel" ("promotedUntil");
CREATE INDEX IF NOT EXISTS idx_analytics_event_created ON "AnalyticsEvent" ("eventName", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_created ON "ChatMessage" ("conversationId", "createdAt" DESC);
