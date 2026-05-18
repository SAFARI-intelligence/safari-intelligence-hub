import { useEffect, useRef } from "react";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  type?: "animal" | "hotel" | "you";
  popupHtml?: string;
};

type Props = {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  routeLine?: Array<[number, number]>;
  className?: string;
  onMarkerClick?: (id: string) => void;
};

const DEFAULT_CENTER: [number, number] = [-1.4861, 35.1438]; // Maasai Mara

const ICON_COLORS: Record<NonNullable<MapMarker["type"]>, string> = {
  animal: "#D4870A", // gold
  hotel: "#1A5C3A", // forest
  you: "#8B2500", // maasai
};

function pinHtml(color: string) {
  return `
    <div style="position:relative;width:30px;height:42px;transform:translate(-50%,-100%);">
      <div style="position:absolute;inset:0;background:${color};-webkit-mask:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><path d=%22M12 2C7.6 2 4 5.6 4 10c0 5.5 7 12 8 12s8-6.5 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 100-6 3 3 0 000 6z%22/></svg>') center/contain no-repeat;mask:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><path d=%22M12 2C7.6 2 4 5.6 4 10c0 5.5 7 12 8 12s8-6.5 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 100-6 3 3 0 000 6z%22/></svg>') center/contain no-repeat;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.4));"></div>
    </div>
  `;
}

export function SafariMap({
  center = DEFAULT_CENTER,
  zoom = 8,
  markers = [],
  routeLine,
  className = "h-[60vh] w-full rounded-2xl overflow-hidden",
  onMarkerClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  // Init once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(containerRef.current, {
        center,
        zoom,
        scrollWheelZoom: true,
        zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers / route
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;
    layer.clearLayers();

    markers.forEach((m) => {
      const color = ICON_COLORS[m.type ?? "animal"];
      const icon = L.divIcon({
        html: pinHtml(color),
        className: "safari-pin",
        iconSize: [30, 42],
        iconAnchor: [15, 42],
      });
      const marker = L.marker([m.lat, m.lng], { icon }).addTo(layer);
      if (m.popupHtml) marker.bindPopup(m.popupHtml);
      else if (m.label) marker.bindPopup(`<strong>${m.label}</strong>`);
      if (onMarkerClick) marker.on("click", () => onMarkerClick(m.id));
    });

    if (routeLine && routeLine.length > 1) {
      L.polyline(routeLine, {
        color: "#D4870A",
        weight: 4,
        opacity: 0.85,
        dashArray: "8 6",
      }).addTo(layer);
    }
  }, [markers, routeLine, onMarkerClick]);

  // Re-center on prop change
  useEffect(() => {
    if (mapRef.current) mapRef.current.setView(center, zoom);
  }, [center[0], center[1], zoom]);

  return <div ref={containerRef} className={className} />;
}
