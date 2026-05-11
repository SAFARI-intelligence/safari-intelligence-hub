import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { NearbyCluster, NearbyItem, NearbyResponse, RouteSuggestion } from "@safari/contracts";
import { AnalyticsService } from "../analytics/analytics.service";
import { CacheService } from "../cache/cache.service";
import { PrismaService } from "../prisma/prisma.service";
import { NearbyQueryDto } from "./nearby-query.dto";

interface NearbyRow {
  id: string;
  name: string;
  type: "animal" | "hotel" | "park" | "experience";
  zone_name: string;
  distance_km: number;
  latitude: number;
  longitude: number;
}

interface ClusterRow {
  cluster_id: string;
  count: bigint;
  center_lat: number;
  center_lng: number;
}

@Injectable()
export class MapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly analytics: AnalyticsService
  ) {}

  async getNearby(query: NearbyQueryDto): Promise<NearbyResponse> {
    const radiusKm = query.radiusKm ?? 50;
    const cacheKey = `map:nearby:${query.lat}:${query.lng}:${radiusKm}:${query.type ?? "all"}:${query.page}:${query.limit}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as NearbyResponse;
    }

    const offset = (query.page - 1) * query.limit;
    const typeSql = query.type ? Prisma.sql`WHERE type = ${query.type}` : Prisma.empty;

    const rows = await this.prisma.$queryRaw<NearbyRow[]>(Prisma.sql`
      WITH base_points AS (
        SELECT a.id::text AS id, a.name, 'animal'::text AS type, l."zoneName" AS zone_name, l."geoPoint" AS geom, l.latitude, l.longitude
        FROM "Animal" a
        JOIN "Location" l ON l.id = a."locationId"
        UNION ALL
        SELECT h.id::text AS id, h.name, 'hotel'::text AS type, l."zoneName" AS zone_name, l."geoPoint" AS geom, l.latitude, l.longitude
        FROM "Hotel" h
        JOIN "Location" l ON l.id = h."locationId"
        UNION ALL
        SELECT p.id::text AS id, p.name, 'park'::text AS type, l."zoneName" AS zone_name, l."geoPoint" AS geom, l.latitude, l.longitude
        FROM "Park" p
        JOIN "Location" l ON l.id = p."locationId"
        UNION ALL
        SELECT e.id::text AS id, e.title AS name, 'experience'::text AS type, l."zoneName" AS zone_name, l."geoPoint" AS geom, l.latitude, l.longitude
        FROM "Experience" e
        JOIN "Location" l ON l.id = e."locationId"
      ),
      filtered AS (
        SELECT
          id,
          name,
          type,
          zone_name,
          latitude::double precision AS latitude,
          longitude::double precision AS longitude,
          ST_DistanceSphere(
            COALESCE(geom, ST_SetSRID(ST_MakePoint(longitude::double precision, latitude::double precision), 4326)),
            ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)
          ) / 1000.0 AS distance_km
        FROM base_points
        ${typeSql}
      )
      SELECT id, name, type, zone_name, distance_km, latitude, longitude
      FROM filtered
      WHERE distance_km <= ${radiusKm}
      ORDER BY distance_km ASC
      LIMIT ${query.limit}
      OFFSET ${offset};
    `);

    const clusterRows = await this.prisma.$queryRaw<ClusterRow[]>(Prisma.sql`
      WITH base_points AS (
        SELECT 'animal'::text AS type, l."geoPoint" AS geom, l.latitude, l.longitude
        FROM "Animal" a
        JOIN "Location" l ON l.id = a."locationId"
        UNION ALL
        SELECT 'hotel'::text AS type, l."geoPoint" AS geom, l.latitude, l.longitude
        FROM "Hotel" h
        JOIN "Location" l ON l.id = h."locationId"
        UNION ALL
        SELECT 'park'::text AS type, l."geoPoint" AS geom, l.latitude, l.longitude
        FROM "Park" p
        JOIN "Location" l ON l.id = p."locationId"
        UNION ALL
        SELECT 'experience'::text AS type, l."geoPoint" AS geom, l.latitude, l.longitude
        FROM "Experience" e
        JOIN "Location" l ON l.id = e."locationId"
      ),
      filtered AS (
        SELECT
          type,
          latitude::double precision AS latitude,
          longitude::double precision AS longitude,
          ST_DistanceSphere(
            COALESCE(geom, ST_SetSRID(ST_MakePoint(longitude::double precision, latitude::double precision), 4326)),
            ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)
          ) / 1000.0 AS distance_km
        FROM base_points
        ${typeSql}
      )
      SELECT
        md5(concat(round(latitude::numeric, 1), ':', round(longitude::numeric, 1), ':', ${query.type ?? "all"})) AS cluster_id,
        count(*)::bigint AS count,
        avg(latitude)::double precision AS center_lat,
        avg(longitude)::double precision AS center_lng
      FROM filtered
      WHERE distance_km <= ${radiusKm}
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 20;
    `);

    const items: NearbyItem[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      zoneName: row.zone_name,
      distanceKm: Number(row.distance_km.toFixed(2)),
      location: {
        lat: Number(row.latitude),
        lng: Number(row.longitude)
      }
    }));

    const clusters: NearbyCluster[] = clusterRows.map((row) => ({
      clusterId: row.cluster_id,
      count: Number(row.count),
      center: {
        lat: Number(row.center_lat),
        lng: Number(row.center_lng)
      }
    }));

    const response: NearbyResponse = {
      center: { lat: query.lat, lng: query.lng },
      radiusKm,
      items,
      clusters
    };

    await this.cache.set(cacheKey, JSON.stringify(response), 90);

    if (query.distinctId) {
      await this.analytics.track({
        event: "map_interaction",
        distinctId: query.distinctId,
        properties: { type: query.type ?? "all", radiusKm }
      });
    }

    return response;
  }

  async getRouteSuggestions(limit = 5): Promise<RouteSuggestion[]> {
    const routes = await this.prisma.routeTemplate.findMany({
      take: Math.max(1, Math.min(20, limit)),
      orderBy: { updatedAt: "desc" }
    });

    return routes.map((route) => ({
      id: route.id,
      from: route.name.split(" ")[0] ?? "Park",
      stop: "Premium Lodge",
      destination: "Signature Experience",
      estimatedHours: route.estimatedHours
    }));
  }

  async getOfflinePacks() {
    return this.prisma.offlineMapPack.findMany({
      orderBy: { name: "asc" }
    });
  }
}
