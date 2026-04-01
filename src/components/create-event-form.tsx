"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import Script from "next/script";
import { useActionState, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  LoaderCircle,
  LocateFixed,
  Map,
  MapPin,
  Image as ImageIcon,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";

import { createEvent } from "@/services/create-event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
};

const initialState: ActionState = {};
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Coordinates = {
  lat: string;
  lng: string;
};

type GoogleGeocodeResult = {
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
};

type GoogleMapsGeocoder = {
  geocode: (
    request: { address?: string; location?: { lat: number; lng: number } },
    callback: (results: GoogleGeocodeResult[] | null, status: string) => void
  ) => void;
};

export default function CreateEventForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createEvent, initialState);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates>({ lat: "", lng: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [locationMessage, setLocationMessage] = useState(
    "Search an address, use your current location, or click on the map to pick a place."
  );
  const googleMaps =
    typeof window !== "undefined"
      ? (window as Window & { google?: any }).google?.maps
      : undefined;

  useEffect(() => {
    if (state?.success) {
      router.push("/");
      router.refresh();
    }
  }, [router, state]);

  useEffect(() => {
    if (!isGoogleReady || !mapRef.current || !googleMaps?.Map || googleMapRef.current) {
      return;
    }

    const defaultCenter = { lat: 23.8103, lng: 90.4125 };
    const map = new googleMaps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      disableDefaultUI: false,
      clickableIcons: false,
    });
    const marker = new googleMaps.Marker({
      position: defaultCenter,
      map,
    });

    googleMapRef.current = map;
    markerRef.current = marker;

    map.addListener("click", (event: { latLng?: { lat: () => number; lng: () => number } }) => {
      const latLng = event.latLng;

      if (!latLng) {
        return;
      }

      const lat = latLng.lat();
      const lng = latLng.lng();

      setCoordinates({
        lat: String(lat),
        lng: String(lng),
      });
      marker.setPosition({ lat, lng });
      setLocationMessage("Location selected from the map.");
      void resolveAddressFromCoordinates(lat, lng, false);
    });
  }, [googleMaps, isGoogleReady]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const getFieldError = (fieldName: string) =>
    state?.errors?.find((error:any) => error.field === fieldName)?.message ?? null;

  const geocodeWithGoogle = (request: { address?: string; location?: { lat: number; lng: number } }) =>
    new Promise<GoogleGeocodeResult[]>((resolve, reject) => {
      if (!googleMaps?.Geocoder) {
        reject(new Error("Google Maps is not ready."));
        return;
      }

      const geocoder = new googleMaps.Geocoder() as GoogleMapsGeocoder;
      geocoder.geocode(request, (results, status) => {
        if (status === "OK" && results?.length) {
          resolve(results);
          return;
        }

        reject(new Error("Location not found."));
      });
    });

  const updateMapLocation = (lat: number, lng: number) => {
    const nextPoint = { lat, lng };

    googleMapRef.current?.setCenter(nextPoint);
    googleMapRef.current?.setZoom(15);
    markerRef.current?.setPosition(nextPoint);
  };

  const resolveAddressFromCoordinates = async (
    lat: number,
    lng: number,
    updateMessage = true
  ) => {
    if (!googleMapsApiKey || !isGoogleReady) {
      return;
    }

    try {
      const results = await geocodeWithGoogle({
        location: { lat, lng },
      });

      if (results[0]?.formatted_address) {
        setAddress(results[0].formatted_address);
      }

      if (updateMessage) {
        setLocationMessage("Location selected successfully.");
      }
    } catch {
      if (updateMessage) {
        setLocationMessage("Coordinates saved, but address could not be resolved.");
      }
    }
  };

  const handleFindAddress = async () => {
    if (!address.trim()) {
      setLocationMessage("Enter an address first.");
      return;
    }

    if (!googleMapsApiKey || !isGoogleReady) {
      setLocationMessage("Google location service is not ready yet.");
      return;
    }

    try {
      setIsResolvingAddress(true);
      setLocationMessage("Finding location from Google...");

      const results = await geocodeWithGoogle({ address: address.trim() });
      const firstResult = results[0];

      setCoordinates({
        lat: String(firstResult.geometry.location.lat()),
        lng: String(firstResult.geometry.location.lng()),
      });
      setAddress(firstResult.formatted_address);
      updateMapLocation(firstResult.geometry.location.lat(), firstResult.geometry.location.lng());
      setLocationMessage("Google location added successfully.");
    } catch {
      setCoordinates({ lat: "", lng: "" });
      setLocationMessage("Google could not resolve this address.");
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Browser geolocation is not available.");
      return;
    }

    setIsGettingLocation(true);
    setLocationMessage("Fetching your current location...");

    navigator.geolocation.getCurrentPosition(async (position) => {
      const nextCoordinates = {
        lat: String(position.coords.latitude),
        lng: String(position.coords.longitude),
      };

      setCoordinates(nextCoordinates);
      updateMapLocation(position.coords.latitude, position.coords.longitude);

      if (googleMapsApiKey && isGoogleReady) {
        try {
          await resolveAddressFromCoordinates(position.coords.latitude, position.coords.longitude, false);
          setLocationMessage("Current location added from Google.");
        } catch {
          setLocationMessage("Coordinates added, but Google could not detect the address.");
        }
      } else {
        setLocationMessage("Coordinates added from your browser location.");
      }

      setIsGettingLocation(false);
    }, () => {
      setIsGettingLocation(false);
      setLocationMessage("Unable to access your current location.");
    });
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setSelectedImageName(file?.name || "");

    setImagePreview((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }

      return file ? URL.createObjectURL(file) : null;
    });
  };

  return (
    <div className="overflow-hidden rounded-[2.25rem] border border-white/60 bg-white/82 shadow-[0_30px_90px_-48px_rgba(88,70,52,0.42)] backdrop-blur-md">
      {googleMapsApiKey ? (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`}
          strategy="afterInteractive"
          onLoad={() => setIsGoogleReady(true)}
        />
      ) : null}

      <div className="border-b border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(244,235,225,0.92),rgba(235,224,213,0.88))] px-6 py-8 sm:px-8 sm:py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/75">
              New event
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Create a standout community event
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              Add a bold cover image, set the time, write the story, and pin the exact event
              location directly on the map.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                Cover
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">Large event preview</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                Schedule
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">Date and time ready</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                Location
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">Google map selection</p>
            </div>
          </div>
        </div>
      </div>

      <form action={formAction} className="space-y-8 px-6 py-8 sm:px-8 sm:py-10">
        <FieldGroup>
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-7">
              <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,243,237,0.88))] p-5 shadow-[0_20px_60px_-44px_rgba(88,70,52,0.42)] sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Event cover</p>
                    <p className="text-xs text-muted-foreground">Make your event stand out in the feed</p>
                  </div>
                </div>
                <Field>
                  <FieldLabel>
                    Event image <span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-primary/25 bg-primary/5 px-6 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/10">
                      {imagePreview ? (
                        <div className="mb-4 w-full overflow-hidden rounded-[1.5rem] border border-white/70 shadow-sm">
                          <img
                            src={imagePreview}
                            alt="Selected event preview"
                            className="h-72 w-full object-cover sm:h-96"
                          />
                        </div>
                      ) : (
                        <div className="mb-4 flex h-72 w-full items-center justify-center rounded-[1.5rem] bg-primary/8 sm:h-96">
                          <Upload className="h-10 w-10 text-primary" />
                        </div>
                      )}
                      <span className="text-sm font-semibold text-foreground">Choose an image</span>
                      <span className="mt-1 text-sm text-muted-foreground">
                        JPG, PNG or WEBP image for your event cover
                      </span>
                      {selectedImageName ? (
                        <span className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                          {selectedImageName}
                        </span>
                      ) : null}
                      <Input
                        name="image"
                        type="file"
                        accept="image/*"
                        required
                        className="sr-only"
                        disabled={isPending}
                        onChange={handleImageChange}
                      />
                    </label>
                    <FieldDescription>Your event cover will be uploaded with the post.</FieldDescription>
                  </FieldContent>
                  <FieldError>{getFieldError("image")}</FieldError>
                </Field>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_-44px_rgba(88,70,52,0.4)] sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Event schedule</p>
                    <p className="text-xs text-muted-foreground">Choose the exact date and time</p>
                  </div>
                </div>
                <Field>
                  <FieldLabel>
                    Event time <span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      name="startedAt"
                      type="datetime-local"
                      required
                      disabled={isPending}
                      className="rounded-xl border-white/70 bg-muted/15"
                    />
                    <FieldDescription>Choose when the event is happening.</FieldDescription>
                  </FieldContent>
                  <FieldError>{getFieldError("startedAt")}</FieldError>
                </Field>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_-44px_rgba(88,70,52,0.4)] sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Event story</p>
                    <p className="text-xs text-muted-foreground">Tell people what this event is about</p>
                  </div>
                </div>
                <Field>
                  <FieldLabel>
                    Description <span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      name="description"
                      required
                      placeholder="Tell people about this event..."
                      className="min-h-40 rounded-[1.5rem] border-white/70 bg-muted/15"
                      disabled={isPending}
                    />
                    <FieldDescription>A short event description for the feed card.</FieldDescription>
                  </FieldContent>
                  <FieldError>{getFieldError("description")}</FieldError>
                </Field>
              </div>
            </div>

            <div className="space-y-7">
              <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_-44px_rgba(88,70,52,0.4)] sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Location</p>
                    <p className="text-xs text-muted-foreground">Search or pick the exact place</p>
                  </div>
                </div>

                <Field>
                  <FieldLabel>Address</FieldLabel>
                  <FieldContent>
                    <Input
                      name="address"
                      type="text"
                      placeholder="Search a place with Google"
                      className="rounded-xl border-white/70 bg-muted/15"
                      value={address}
                      onChange={(event) => {
                        setAddress(event.target.value);
                        setCoordinates({ lat: "", lng: "" });
                        setLocationMessage("Search the address again or pick a point on the map.");
                      }}
                      disabled={isPending}
                    />
                    <FieldDescription>Search a place to auto-fill latitude and longitude with Google.</FieldDescription>
                  </FieldContent>
                  <FieldError>{getFieldError("address")}</FieldError>
                </Field>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFindAddress}
                    disabled={isPending || isResolvingAddress || !address.trim() || !googleMapsApiKey}
                    className="rounded-full border-white/70 bg-white/80"
                  >
                    <Search className="h-4 w-4" />
                    {isResolvingAddress ? "Searching..." : "Use Google location"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseCurrentLocation}
                    disabled={isPending || isGettingLocation}
                    className="rounded-full border-white/70 bg-white/80"
                  >
                    <LocateFixed className="h-4 w-4" />
                    {isGettingLocation ? "Getting location..." : "Use current location"}
                  </Button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_-44px_rgba(88,70,52,0.4)] sm:p-6">
                <Field>
                  <FieldLabel>
                    Pick location on map <span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <div className="overflow-hidden rounded-[1.5rem] border border-primary/15 bg-white shadow-sm">
                      <div className="flex items-center gap-2 border-b border-border/70 bg-primary/5 px-4 py-3 text-sm font-medium text-foreground">
                        <Map className="h-4 w-4 text-primary" />
                        Google map picker
                      </div>
                      <div
                        ref={mapRef}
                        className="h-[380px] w-full bg-[linear-gradient(135deg,rgba(236,227,217,0.85),rgba(249,246,241,0.95))] sm:h-[460px]"
                      />
                    </div>
                    <FieldDescription>
                      Click anywhere on the map to select a location and save its latitude and longitude.
                    </FieldDescription>
                  </FieldContent>
                  <FieldError>{getFieldError("lat") || getFieldError("lng")}</FieldError>
                </Field>

                <div className="mt-5 rounded-[1.5rem] border border-primary/10 bg-primary/5 p-5">
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                    <div className="space-y-1">
                      <p>{locationMessage}</p>
                      <p className="text-xs">
                        {coordinates.lat && coordinates.lng
                          ? `Lat: ${coordinates.lat} | Lng: ${coordinates.lng}`
                          : "No coordinates selected yet."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <input type="hidden" name="lat" value={coordinates.lat} />
          <input type="hidden" name="lng" value={coordinates.lng} />
        </FieldGroup>

        {!googleMapsApiKey ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` not found. Add the key to load the live Google Map picker.
          </div>
        ) : null}

        {state?.message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(245,238,231,0.8))] p-5 shadow-[0_20px_60px_-44px_rgba(88,70,52,0.42)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Ready to publish this event?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your event needs an image and a selected map location before publishing.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              disabled={isPending || !coordinates.lat || !coordinates.lng}
              className="h-12 rounded-full px-6 text-sm font-semibold"
            >
              {isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Creating event...
                </>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4" />
                  Create event
                </>
              )}
            </Button>
            <Button asChild type="button" variant="ghost" className="h-12 rounded-full px-6">
              <Link href="/">Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
