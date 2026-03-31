"use client";

import Link from "next/link";
import Script from "next/script";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Search,
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

declare global {
  interface Window {
    google?: {
      maps?: {
        Geocoder: new () => GoogleMapsGeocoder;
      };
    };
  }
}

export default function CreateEventForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createEvent, initialState);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates>({ lat: "", lng: "" });
  const [locationMessage, setLocationMessage] = useState(
    "Search an address with Google or use your current location."
  );

  useEffect(() => {
    if (state?.success) {
      router.push("/");
      router.refresh();
    }
  }, [router, state]);

  const getFieldError = (fieldName: string) =>
    state?.errors?.find((error) => error.field === fieldName)?.message ?? null;

  const geocodeWithGoogle = (request: { address?: string; location?: { lat: number; lng: number } }) =>
    new Promise<GoogleGeocodeResult[]>((resolve, reject) => {
      if (!window.google?.maps?.Geocoder) {
        reject(new Error("Google Maps is not ready."));
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(request, (results, status) => {
        if (status === "OK" && results?.length) {
          resolve(results);
          return;
        }

        reject(new Error("Location not found."));
      });
    });

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

      if (googleMapsApiKey && isGoogleReady) {
        try {
          const results = await geocodeWithGoogle({
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });

          if (results[0]?.formatted_address) {
            setAddress(results[0].formatted_address);
          }

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

  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_24px_80px_-44px_rgba(88,70,52,0.38)] backdrop-blur-md sm:p-8">
      {googleMapsApiKey ? (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`}
          strategy="afterInteractive"
          onLoad={() => setIsGoogleReady(true)}
        />
      ) : null}

      <div className="flex flex-col gap-4 border-b border-border/70 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/75">
            New event
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Create an event for your community
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Upload an event image, set the event time, write a short description, and attach a location.
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-8 space-y-7">
        <FieldGroup>
          <Field>
            <FieldLabel>
              Event image <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-primary/25 bg-primary/5 px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-primary/10">
                <Upload className="mb-3 h-8 w-8 text-primary" />
                <span className="text-sm font-semibold text-foreground">Choose an image</span>
                <span className="mt-1 text-sm text-muted-foreground">
                  JPG, PNG or WEBP image for your event cover
                </span>
                <Input
                  name="image"
                  type="file"
                  accept="image/*"
                  required
                  className="sr-only"
                  disabled={isPending}
                />
              </label>
              <FieldDescription>Your event cover will be uploaded with the post.</FieldDescription>
            </FieldContent>
            <FieldError>{getFieldError("image")}</FieldError>
          </Field>

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
              />
              <FieldDescription>Choose when the event is happening.</FieldDescription>
            </FieldContent>
            <FieldError>{getFieldError("startedAt")}</FieldError>
          </Field>

          <Field>
            <FieldLabel>
              Description <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Textarea
                name="description"
                required
                placeholder="Tell people about this event..."
                className="min-h-32 rounded-2xl"
                disabled={isPending}
              />
              <FieldDescription>A short event description for the feed card.</FieldDescription>
            </FieldContent>
            <FieldError>{getFieldError("description")}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Address</FieldLabel>
            <FieldContent>
              <Input
                name="address"
                type="text"
                placeholder="Search a place with Google"
                className="rounded-xl"
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value);
                  setCoordinates({ lat: "", lng: "" });
                  setLocationMessage("Search the address again to update coordinates.");
                }}
                disabled={isPending}
              />
              <FieldDescription>Search a place to auto-fill latitude and longitude with Google.</FieldDescription>
            </FieldContent>
            <FieldError>{getFieldError("address")}</FieldError>
          </Field>

          <input type="hidden" name="lat" value={coordinates.lat} />
          <input type="hidden" name="lng" value={coordinates.lng} />
        </FieldGroup>

        <div className="flex flex-col gap-4 rounded-[1.5rem] border border-primary/10 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleFindAddress}
              disabled={isPending || isResolvingAddress || !address.trim() || !googleMapsApiKey}
              className="rounded-full"
            >
              <Search className="h-4 w-4" />
              {isResolvingAddress ? "Searching..." : "Use Google location"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleUseCurrentLocation}
              disabled={isPending || isGettingLocation}
              className="rounded-full"
            >
              <LocateFixed className="h-4 w-4" />
              {isGettingLocation ? "Getting location..." : "Use current location"}
            </Button>
          </div>
        </div>

        {state?.message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}
          >
            {state.message}
          </div>
        ) : null}

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
      </form>
    </div>
  );
}
