"use client";

import { useEffect, useRef } from "react";
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

// Pulsing marker HTML for different severities
function markerHtml(severity: string, selected: boolean): string {
  const colors: Record<string, string> = {
    critical: "#ff3b5c",
    warning: "#ffb020",
    info: "#448aff",
  };
  const color = colors[severity] || colors.info;
  const size = selected ? 22 : 16;
  const ringSize = selected ? 44 : 32;

  return `
    <div style="position:relative;width:${ringSize}px;height:${ringSize}px;display:flex;align-items:center;justify-content:center;">
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        border-radius:50%;
        border:2px solid rgba(255,255,255,0.9);
        box-shadow:0 0 16px ${color}80, 0 0 32px ${color}40;
        z-index:2;
      "></div>
      <div style="
        position:absolute;
        width:${ringSize}px;height:${ringSize}px;
        border-radius:50%;
        border:2px solid ${color};
        opacity:0.5;
        animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;
      "></div>
    </div>
    <style>
      @keyframes ping {
        0% { transform:scale(1); opacity:0.5; }
        100% { transform:scale(2.2); opacity:0; }
      }
    </style>
  `;
}

export default function MapComponent({ incidents, selectedId, onSelect, center }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: center || [28.6139, 77.2090], // Default: New Delhi
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark map tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
    }).addTo(map);

    // Add zoom control to top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Attribution bottom-right
    L.control.attribution({ position: "bottomright", prefix: false })
      .addAttribution('© <a href="https://carto.com">CARTO</a>')
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center]);

  // Sync markers with incidents
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set(incidents.map(i => i.id));

    // Remove markers for incidents that no longer exist
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    incidents.forEach((incident) => {
      if (!incident.lat || !incident.lng) return;

      const isSelected = incident.id === selectedId;
      const existing = markersRef.current.get(incident.id);

      if (existing) {
        // Update icon if selection changed
        existing.setIcon(L.divIcon({
          html: markerHtml(incident.severity, isSelected),
          iconSize: [isSelected ? 44 : 32, isSelected ? 44 : 32],
          iconAnchor: [isSelected ? 22 : 16, isSelected ? 22 : 16],
          className: "",
        }));
      } else {
        // Create new marker
        const icon = L.divIcon({
          html: markerHtml(incident.severity, isSelected),
          iconSize: [isSelected ? 44 : 32, isSelected ? 44 : 32],
          iconAnchor: [isSelected ? 22 : 16, isSelected ? 22 : 16],
          className: "",
        });

        const marker = L.marker([incident.lat, incident.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:'Inter',sans-serif;min-width:200px;">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${incident.type}</div>
              <div style="font-size:11px;color:#888;margin-bottom:8px;">📍 ${incident.location} • ${incident.time}</div>
              ${incident.aiData?.summary ? `<div style="font-size:12px;line-height:1.4;margin-bottom:6px;">${incident.aiData.summary}</div>` : ""}
              ${incident.aiData?.translation ? `<div style="font-size:11px;color:#00e5ff;font-style:italic;">🌐 ${incident.aiData.translation}</div>` : ""}
            </div>
          `, { className: "beacon-popup" })
          .on("click", () => onSelect(incident.id));

        markersRef.current.set(incident.id, marker);

        // Fly to new incident if it's critical
        if (incident.severity === "critical") {
          map.flyTo([incident.lat, incident.lng], 17, { duration: 1.2 });
        }
      }
    });
  }, [incidents, selectedId, onSelect]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", borderRadius: "inherit" }} />
  );
}
