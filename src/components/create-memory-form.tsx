/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import Script from "next/script";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  Map,
  MapPin,
  ImagePlus,
  Upload,
  X,
  CheckCircle2,
  Navigation,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { createMemory } from "@/services/create-memory";
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

export default function CreateMemoryForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createMemory, initialState);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(() =>
    typeof window !== "undefined" && !!window.google?.maps
  );
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates>({ lat: "", lng: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [locationMessage, setLocationMessage] = useState(
    "Search an address, use your current location, or click on the map to pick a place."
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Memory created successfully!", {
        description: "Your moment has been shared to your feed.",
      });
      router.push("/");
      router.refresh();
    } else if (state?.errors && state.errors.length > 0) {
      const errorMessage = state.errors
        .map((err: any) => err.message)
        .join(", ");
      toast.error("Failed to create memory", {
        description: errorMessage,
      });
    } else if (state?.message && !state.success) {
      toast.error("Failed to create memory", {
        description: state.message,
      });
    }
  }, [router, state]);

  const geocodeWithGoogle = useCallback((request: { address?: string; location?: { lat: number; lng: number } }) =>
    new Promise<GoogleGeocodeResult[]>((resolve, reject) => {
      if (!google.maps?.Geocoder) {
        reject(new Error("Google Maps is not ready."));
        return;
      }

      const geocoder = new google.maps.Geocoder() as GoogleMapsGeocoder;
      geocoder.geocode(request, (results, status) => {
        if (status === "OK" && results?.length) {
          resolve(results);
          return;
        }

        reject(new Error("Location not found."));
      });
    }), []);

  const resolveAddressFromCoordinates = useCallback(async (
    lat: number,
    lng: number,
    updateMessage = true
  ) => {
    if (!isGoogleReady) {
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
  }, [isGoogleReady, geocodeWithGoogle]);

  const updateMapLocation = useCallback((lat: number, lng: number) => {
    const nextPoint = { lat, lng };

    googleMapRef.current?.setCenter(nextPoint);
    googleMapRef.current?.setZoom(15);
    markerRef.current?.setPosition(nextPoint);
  }, []);

  useEffect(() => {
    if (!isGoogleReady || !mapRef.current || !google.maps.Map || googleMapRef.current) {
      return;
    }

    const defaultCenter = { lat: 23.8103, lng: 90.4125 };
    const map = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      disableDefaultUI: false,
      clickableIcons: false,
    });
    const marker = new google.maps.Marker({
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
  }, [isGoogleReady, resolveAddressFromCoordinates]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const getFieldError = (fieldName: string) =>
    state?.errors?.find((error: any) => error.field === fieldName)?.message ?? null;

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

  const isFormValid = coordinates.lat && coordinates.lng && imagePreview;

  return (
    <div className="mx-auto max-w-6xl">
      {googleMapsApiKey ? (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`}
          strategy="afterInteractive"
          onLoad={() => setIsGoogleReady(true)}
        />
      ) : null}

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="group mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                New Memory
              </p>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Capture a moment
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Share your story with an image, description, and location.
            </p>
          </div>
        </div>
      </div>

      <form action={formAction}>
        <FieldGroup>
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Left Column - Main Details */}
            <div className="space-y-6 lg:col-span-3">
              {/* Image Upload */}
              <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Cover Image</h2>
                    <p className="text-xs text-muted-foreground">Upload a captivating image for your memory</p>
                  </div>
                </div>

                <Field>
                  <FieldContent>
                    <label className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center transition-all hover:border-primary/40 hover:bg-primary/5">
                      {imagePreview ? (
                        <div className="relative h-64 w-full sm:h-72">
                          <img
                            src={imagePreview}
                            alt="Memory cover preview"
                            className="h-full w-full rounded-lg object-cover"
                          />
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setImagePreview(null);
                              setSelectedImageName("");
                            }}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {/* Success indicator */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-green-600/90 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Image uploaded
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                            <Upload className="h-7 w-7 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              Click to upload your cover image
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              JPG, PNG or WEBP — Recommended: 1200×630px
                            </p>
                          </div>
                        </div>
                      )}
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
                  </FieldContent>
                  <FieldError>{getFieldError("image")}</FieldError>
                </Field>
              </section>

              {/* Description */}
              <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Your Story</h2>
                    <p className="text-xs text-muted-foreground">Tell people about this memory</p>
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
                      placeholder="Write something about this moment..."
                      className="min-h-40 rounded-lg"
                      disabled={isPending}
                    />
                    <FieldDescription>Share the story behind this memory.</FieldDescription>
                  </FieldContent>
                  <FieldError>{getFieldError("description")}</FieldError>
                </Field>
              </section>
            </div>

            {/* Right Column - Map */}
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Map className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Location</h2>
                    <p className="text-xs text-muted-foreground">Where did this memory happen?</p>
                  </div>
                </div>

                {/* Map Container */}
                <div className="mb-4 overflow-hidden rounded-xl border border-border/60">
                  <div
                    ref={mapRef}
                    className="h-80 w-full bg-muted sm:h-95"
                  />
                </div>

                {/* Location Controls */}
                <div className="mb-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseCurrentLocation}
                    disabled={isGettingLocation || isPending}
                    className="flex-1 rounded-lg text-xs"
                  >
                    {isGettingLocation ? (
                      <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Navigation className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    My Location
                  </Button>
                </div>

                {/* Location Status */}
                <div className={`rounded-xl border p-4 transition-colors ${
                  coordinates.lat && coordinates.lng
                    ? "border-green-200 bg-green-50/50"
                    : "border-border/60 bg-muted/30"
                }`}>
                  <div className="flex items-start gap-3">
                    <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${
                      coordinates.lat && coordinates.lng ? "text-green-600" : "text-muted-foreground"
                    }`} />
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-foreground">{locationMessage}</p>
                      {coordinates.lat && coordinates.lng ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                          <span className="rounded-md bg-white/80 px-2 py-1 font-mono">
                            {parseFloat(coordinates.lat).toFixed(4)}
                          </span>
                          <span className="text-muted-foreground/40">,</span>
                          <span className="rounded-md bg-white/80 px-2 py-1 font-mono">
                            {parseFloat(coordinates.lng).toFixed(4)}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground/70">
                          Click on the map or use your current location
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Tips */}
              <section className="rounded-2xl border border-amber-200/50 bg-amber-50/50 p-5">
                <h3 className="mb-3 text-sm font-semibold text-amber-800">Quick Tips</h3>
                <ul className="space-y-2 text-xs text-amber-700/80">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200/60 text-[10px] font-bold text-amber-700">1</span>
                    Use a high-quality image that tells your story
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200/60 text-[10px] font-bold text-amber-700">2</span>
                    Write a descriptive caption for context
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200/60 text-[10px] font-bold text-amber-700">3</span>
                    Pin the exact location on the map
                  </li>
                </ul>
              </section>
            </div>
          </div>

          <input type="hidden" name="lat" value={coordinates.lat} />
          <input type="hidden" name="lng" value={coordinates.lng} />
        </FieldGroup>

        {!googleMapsApiKey ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` not found. Add the key to load the live Google Map picker.
          </div>
        ) : null}

        {state?.message ? (
          <div
            className={`mt-6 rounded-xl px-4 py-3 text-sm ${
              state.success ? "border border-green-200 bg-green-50 text-green-700" : "border border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        {/* Sticky Bottom Bar */}
        <div className="sticky bottom-0 z-20 -mx-4 border-t border-border/40 bg-background/80 px-6 py-4 backdrop-blur-xl sm:-mx-6 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {isFormValid ? (
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Ready to share
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Complete all fields to publish
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild type="button" variant="outline" className="rounded-lg">
                <Link href="/">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-lg px-6"
              >
                {isPending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Share Memory
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
