/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, MapPin, CalendarDays, X, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";

export type MapUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  distanceKm?: number;
  distanceInKm?: number;
};

export type MapEvent = {
  id: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  location?: string | null;
  lat?: number | null;
  lng?: number | null;
  distanceKm?: number;
  distanceInKm?: number;
};

type NearbyMapViewProps = {
  users: MapUser[];
  events: MapEvent[];
  isLoading: boolean;
  centerLat?: number;
  centerLng?: number;
};

type FilterType = "all" | "users" | "events";

const DEFAULT_CENTER = { lat: 23.8103, lng: 90.4125 }; // Dhaka

export default function NearbyMapView({
  users,
  events,
  isLoading,
  centerLat,
  centerLng,
}: NearbyMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedMarker, setSelectedMarker] = useState<{
    type: "user" | "event";
    data: MapUser | MapEvent;
    position: google.maps.LatLngLiteral;
  } | null>(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // Filtered data
  const filteredUsers = useMemo(() => 
    (filter === "all" || filter === "users" ? users : []), 
    [filter, users]
  );
  
  const filteredEvents = useMemo(() => 
    (filter === "all" || filter === "events" ? events : []), 
    [filter, events]
  );

  // Initialize map when Google Maps loads
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || googleMapRef.current) return;

    const center = {
      lat: centerLat || DEFAULT_CENTER.lat,
      lng: centerLng || DEFAULT_CENTER.lng,
    };

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      styles: [
        {
          featureType: "poi",
          stylers: [{ visibility: "off" }],
        },
      ],
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    googleMapRef.current = map;
  }, [googleMapsLoaded, centerLat, centerLng]);

  // Update markers when data or filter changes
  useEffect(() => {
    const map = googleMapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    const hasValidCoords =
      [...filteredUsers, ...filteredEvents].some(
        (item) => (item.lat && item.lng) || (item as any).lat !== undefined
      );

    // Add user markers
    filteredUsers.forEach((user) => {
      const lat = typeof user.lat === "number" ? user.lat : null;
      const lng = typeof user.lng === "number" ? user.lng : null;
      if (lat === null || lng === null) return;

      const position = { lat, lng };
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";

      // Create marker with user image or initial
      const iconUrl = user.profileImage
        ? `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
            <defs>
              <clipPath id="clip-${user.id}">
                <circle cx="32" cy="32" r="26"/>
              </clipPath>
            </defs>
            <circle cx="32" cy="32" r="30" fill="#8b5cf6" stroke="white" stroke-width="4"/>
            <image href="${user.profileImage}" x="6" y="6" width="52" height="52" clip-path="url(#clip-${user.id})"/>
          </svg>
        `)}`
        : `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="30" fill="#8b5cf6" stroke="white" stroke-width="4"/>
            <text x="32" y="40" text-anchor="middle" fill="white" font-size="24" font-weight="bold">${name.charAt(0)}</text>
          </svg>
        `)}`;

      const marker = new google.maps.Marker({
        position,
        map,
        title: name,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(64, 64),
          anchor: new google.maps.Point(32, 32),
        },
      });

      // Create custom label above marker
      const labelDiv = document.createElement("div");
      labelDiv.className = "map-label";
      labelDiv.style.cssText = `
        background: linear-gradient(135deg, #8b5cf6, #a78bfa);
        color: white;
        font-size: 11px;
        font-weight: 700;
        padding: 6px 14px;
        border-radius: 20px;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        pointer-events: none;
        position: absolute;
        z-index: 100;
      `;
      labelDiv.textContent = name.length > 20 ? name.substring(0, 18) + "..." : name;

      const overlay = new google.maps.OverlayView();
      overlay.onAdd = () => {
        const pane = overlay.getPanes()!.overlayMouseTarget;
        pane.appendChild(labelDiv);
      };
      overlay.draw = () => {
        const projection = overlay.getProjection();
        if (!projection) return;
        const pixel = projection.fromLatLngToDivPixel(position);
        if (pixel) {
          labelDiv.style.left = (pixel.x - 40) + "px";
          labelDiv.style.top = (pixel.y - 60) + "px";
        }
      };
      overlay.onRemove = () => {
        labelDiv.parentNode?.removeChild(labelDiv);
      };
      overlay.setMap(map);

      marker.addListener("click", () => {
        setSelectedMarker({ type: "user", data: user, position });
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Add event markers
    filteredEvents.forEach((event) => {
      const lat = typeof event.lat === "number" ? event.lat : null;
      const lng = typeof event.lng === "number" ? event.lng : null;
      if (lat === null || lng === null) return;

      const position = { lat, lng };
      const title = event.title || "Event";

      // Create marker with event image or default icon
      const iconUrl = event.image
        ? `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
            <defs>
              <clipPath id="clip-event-${event.id}">
                <rect x="6" y="6" width="52" height="52" rx="12"/>
              </clipPath>
            </defs>
            <rect x="2" y="2" width="60" height="60" rx="16" fill="#ec4899" stroke="white" stroke-width="4"/>
            <image href="${event.image}" x="6" y="6" width="52" height="52" clip-path="url(#clip-event-${event.id})"/>
          </svg>
        `)}`
        : `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
            <rect x="2" y="2" width="60" height="60" rx="16" fill="#ec4899" stroke="white" stroke-width="4"/>
            <text x="32" y="36" text-anchor="middle" font-size="24">📅</text>
          </svg>
        `)}`;

      const marker = new google.maps.Marker({
        position,
        map,
        title: title,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(64, 64),
          anchor: new google.maps.Point(32, 32),
        },
      });

      // Create custom label above marker
      const labelDiv = document.createElement("div");
      labelDiv.className = "map-label";
      labelDiv.style.cssText = `
        background: linear-gradient(135deg, #ec4899, #f472b6);
        color: white;
        font-size: 11px;
        font-weight: 700;
        padding: 6px 14px;
        border-radius: 20px;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4);
        pointer-events: none;
        position: absolute;
        z-index: 100;
      `;
      labelDiv.textContent = title.length > 20 ? title.substring(0, 18) + "..." : title;

      const overlay = new google.maps.OverlayView();
      overlay.onAdd = () => {
        const pane = overlay.getPanes()!.overlayMouseTarget;
        pane.appendChild(labelDiv);
      };
      overlay.draw = () => {
        const projection = overlay.getProjection();
        if (!projection) return;
        const pixel = projection.fromLatLngToDivPixel(position);
        if (pixel) {
          labelDiv.style.left = (pixel.x - 40) + "px";
          labelDiv.style.top = (pixel.y - 60) + "px";
        }
      };
      overlay.onRemove = () => {
        labelDiv.parentNode?.removeChild(labelDiv);
      };
      overlay.setMap(map);

      marker.addListener("click", () => {
        setSelectedMarker({ type: "event", data: event, position });
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Fit bounds if we have markers, with zoom constraints
    if (hasValidCoords && markersRef.current.length > 0) {
      map.fitBounds(bounds, { top: 80, bottom: 80, left: 80, right: 80 });
      
      // Limit max zoom to prevent over-zooming
      google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        const currentZoom = map.getZoom();
        if (currentZoom && currentZoom > 14) {
          map.setZoom(14);
        }
      });
    }
  }, [filteredUsers, filteredEvents, googleMapsLoaded]);

  const getUserName = (user: MapUser) =>
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "User";

  const getDistanceLabel = (item: MapUser | MapEvent) => {
    const distance =
      typeof item.distanceKm === "number"
        ? item.distanceKm
        : typeof item.distanceInKm === "number"
        ? item.distanceInKm
        : null;
    return typeof distance === "number" ? `${distance.toFixed(1)} km` : "Nearby";
  };

  if (!googleMapsApiKey) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-[2rem] border border-dashed border-border/70 bg-white/80 p-10 text-center">
        <MapPin className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">
          Map is not available. Please add your Google Maps API key.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Load Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`}
        onLoad={() => setGoogleMapsLoaded(true)}
        onError={() => console.error("Failed to load Google Maps")}
      />

      <div className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-2xl bg-white/60 p-1.5 shadow-sm border border-black/5">
            {(["all", "users", "events"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  filter === f
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-white hover:text-foreground"
                }`}
              >
                {f === "all" && <MapPin className="h-4 w-4" />}
                {f === "users" && <User className="h-4 w-4" />}
                {f === "events" && <CalendarDays className="h-4 w-4" />}
                {f === "all" ? "All" : f === "users" ? "People" : "Events"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
              People ({filteredUsers.length})
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
              Events ({filteredEvents.length})
            </span>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/88 shadow-[0_20px_50px_-35px_rgba(88,70,52,0.45)]">
          {isLoading ? (
            <div className="flex h-96 flex-col items-center justify-center gap-4">
              <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Loading map...</p>
            </div>
          ) : (
            <>
              <div ref={mapRef} className="h-96 w-full" />

              {/* Selected Marker Info Card */}
              {selectedMarker && (
                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 rounded-2xl border border-white/60 bg-white/95 p-4 shadow-xl backdrop-blur-md">
                  <button
                    onClick={() => setSelectedMarker(null)}
                    className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {selectedMarker.type === "user" ? (
                    <Link
                      href={`/profile/${(selectedMarker.data as MapUser).id}`}
                      className="flex items-start gap-3"
                    >
                      <div className="relative h-14 w-14 overflow-hidden rounded-full bg-primary/10">
                        {(selectedMarker.data as MapUser).profileImage ? (
                          <Image
                            src={(selectedMarker.data as MapUser).profileImage!}
                            alt={getUserName(selectedMarker.data as MapUser)}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-primary">
                            {getUserName(selectedMarker.data as MapUser).charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {getUserName(selectedMarker.data as MapUser)}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {(selectedMarker.data as MapUser).address || "Nearby"}
                        </p>
                        <p className="mt-1 text-xs font-medium text-primary">
                          {getDistanceLabel(selectedMarker.data as MapUser)}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-primary/10">
                        {(selectedMarker.data as MapEvent).image ? (
                          <Image
                            src={(selectedMarker.data as MapEvent).image!}
                            alt={(selectedMarker.data as MapEvent).title || "Event"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <CalendarDays className="h-6 w-6 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {(selectedMarker.data as MapEvent).title || "Event"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {(selectedMarker.data as MapEvent).location || "Nearby location"}
                        </p>
                        <p className="mt-1 text-xs font-medium text-primary">
                          {getDistanceLabel(selectedMarker.data as MapEvent)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
