"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem',
};

const defaultCenter = {
    lat: 40.7128, // New York default
    lng: -74.0060,
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
        {
            elementType: "geometry",
            stylers: [{ color: "#242f3e" }],
        },
        {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#242f3e" }],
        },
        {
            elementType: "labels.text.fill",
            stylers: [{ color: "#746855" }],
        },
        {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
        },
        {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
        },
        {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
        },
        {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
        },
        {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
        },
        {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
        },
        {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
        },
    ],
};

interface MapViewProps {
    onDoctorsFound: (doctors: any[]) => void;
}

export function MapView({ onDoctorsFound }: MapViewProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: ["places"],
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [center, setCenter] = useState(defaultCenter);
    const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    // Get User Location
    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCenter(pos);
                    setUserLocation(pos);
                    setError(null);
                },
                () => {
                    setError("Location access denied. Using default location.");
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    };

    // Search Nearby Doctors
    useEffect(() => {
        if (map && userLocation && window.google) {
            const service = new window.google.maps.places.PlacesService(map);
            const request = {
                location: userLocation,
                radius: 5000, // 5km radius
                type: 'doctor', // 'hospital', 'health'
                keyword: 'doctor',
            };

            service.nearbySearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                    const mappedDoctors = results.map((place) => ({
                        id: place.place_id,
                        name: place.name || "Unknown Doctor",
                        specialty: "General Practitioner", // Places API doesn't always give specialty
                        hospital: place.vicinity || "Unknown Location",
                        rating: place.rating || 0,
                        reviews: place.user_ratings_total || 0,
                        distance: "Calculating...", // Would need Distance Matrix API for real distance
                        image: place.photos?.[0]?.getUrl() || null,
                        available: place.opening_hours?.isOpen() || false,
                        location: place.geometry?.location,
                    }));
                    onDoctorsFound(mappedDoctors);

                    // Fit bounds to show all markers
                    const bounds = new window.google.maps.LatLngBounds();
                    bounds.extend(userLocation);
                    results.forEach((place) => {
                        if (place.geometry?.location) {
                            bounds.extend(place.geometry.location);
                        }
                    });
                    map.fitBounds(bounds);
                }
            });
        }
    }, [map, userLocation, onDoctorsFound]);

    if (loadError) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f172a] rounded-2xl border border-white/10 text-white">
                <p>Error loading Google Maps</p>
                <p className="text-xs text-red-400 mt-2">{loadError.message}</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f172a] rounded-2xl border border-white/10 text-white gap-4">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm font-medium text-blue-200/60">Loading Map...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[500px] lg:h-full rounded-2xl overflow-hidden border border-white/10 relative">
            {!userLocation && !error && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm">
                    <MapPin className="w-10 h-10 text-blue-500 mb-4 animate-bounce" />
                    <h3 className="text-white font-bold mb-2">Locate Nearby Doctors</h3>
                    <Button onClick={getUserLocation} className="bg-blue-600 hover:bg-blue-500">
                        Enable Location Access
                    </Button>
                </div>
            )}

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
            >
                {/* User Location Marker */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "#3b82f6",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                        }}
                    />
                )}
            </GoogleMap>
        </div>
    );
}
