export type MapEntityType = "animal" | "hotel" | "park" | "experience";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeoPointFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: Record<string, unknown>;
}

export interface LocationEntity {
  id: string;
  label: string;
  zoneName: string;
  coordinates: LatLng;
}

export interface NearbyQuery {
  lat: number;
  lng: number;
  radiusKm?: number;
  type?: MapEntityType;
  distinctId?: string;
  page?: number;
  limit?: number;
}
