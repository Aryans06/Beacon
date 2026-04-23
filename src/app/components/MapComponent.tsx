"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Incident {
  id: number;
  type: string;
  location: string;
  time: string;
  severity: "critical" | "warning" | "info";
  desc?: string;
  lat?: number;
  lng?: number;
  aiData?: {
    translation?: string;
    summary?: string;
    protocol?: string[];
    threatType?: string;
  };
}

interface MapComponentProps {
  incidents: Incident[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  center?: [number, number];
}

function markerHtml(severity: string, isSelected: boolean): string {
  const colors: Record<string, { bg: string; ring: string }> = {
    critical: { bg: "#ef4444", ring: "rgba(239,68,68,0.4)" },
    warning:  { bg: "#f59e0b", ring: "rgba(245,158,11,0.4)" },
    info:     { bg: "#3b82f6", ring: "rgba(59,130,246,0.4)" },
  };
  const c = colors[severity] || colors.info;
  const dotSize = isSelected ? 14 : 10;

  return `<div style="
    width:${dotSize}px;
    height:${dotSize}px;
    background:${c.bg};
    border-radius:50%;
    border:2px solid #fff;
    box-shadow: 0 0 0 ${isSelected ? '6' : '4'}px ${c.ring}, 0 1px 4px rgba(0,0,0,0.3);
    transition: all 0.2s;
  "></div>`;
}

export default function MapComponent({ incidents, selectedId, onSelect, center }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: center || [28.6320, 77.2185],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean, professional map tiles (Stadia Alidade Smooth Dark)
    L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    L.control.attribution({ position: "bottomright", prefix: false })
      .addAttribution('© <a href="https://stadiamaps.com/">Stadia</a> © <a href="https://openmaptiles.org/">OpenMapTiles</a>')
      .addTo(map);

    mapRef.current = map;

    // Force a resize after mount to fix tile rendering
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers whenever incidents or selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set(incidents.map(i => i.id));

    // Remove stale markers
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Upsert markers
    incidents.forEach((incident) => {
      if (!incident.lat || !incident.lng) return;
      const isSelected = incident.id === selectedId;
      const icon = L.divIcon({
        html: markerHtml(incident.severity, isSelected),
        iconSize: [isSelected ? 14 : 10, isSelected ? 14 : 10],
        iconAnchor: [isSelected ? 7 : 5, isSelected ? 7 : 5],
        className: "beacon-marker",
      });

      const existing = markersRef.current.get(incident.id);
      if (existing) {
        existing.setIcon(icon);
      } else {
        const marker = L.marker([incident.lat, incident.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:'Inter',sans-serif;min-width:180px;padding:2px;">
              <div style="font-weight:700;font-size:13px;color:#f0f4ff;margin-bottom:4px;">${incident.type}</div>
              <div style="font-size:11px;color:#7b8db8;margin-bottom:6px;">📍 ${incident.location} · ${incident.time}</div>
              ${incident.aiData?.summary ? `<div style="font-size:12px;color:#c8d3e8;line-height:1.4;margin-bottom:4px;">${incident.aiData.summary}</div>` : ""}
              ${incident.aiData?.translation ? `<div style="font-size:11px;color:#00e5ff;font-style:italic;">🌐 ${incident.aiData.translation}</div>` : ""}
            </div>
          `, { className: "beacon-popup", maxWidth: 280 })
          .on("click", () => onSelectRef.current(incident.id));

        markersRef.current.set(incident.id, marker);

        // Fly to new critical incidents
        if (incident.severity === "critical") {
          map.flyTo([incident.lat, incident.lng], 17, { duration: 1 });
        }
      }
    });
  }, [incidents, selectedId]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%", borderRadius: "inherit" }} />;
}
