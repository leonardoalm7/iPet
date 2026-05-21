"use client";

import { useMemo, useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, MarkerClusterer, Marker, InfoWindow } from "@react-google-maps/api";
import { ClinicaCredenciada } from "@/data/clinicas-credenciadas";
import { X } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: -15.8267,
  lng: -47.8822,
};

interface ClinicasMapProps {
  clinicas: ClinicaCredenciada[];
  userLat: number | null;
  userLng: number | null;
}

export function ClinicasMap({ clinicas, userLat, userLng }: ClinicasMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [selectedMarker, setSelectedMarker] = useState<ClinicaCredenciada | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const handleLoad = useCallback((map: google.maps.Map) => {
    setMap(map);

    // Fit bounds to include all markers
    if (clinicas.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      clinicas.forEach((c) => bounds.extend(new window.google.maps.LatLng(c.lat, c.lng)));
      if (userLat && userLng) {
        bounds.extend(new window.google.maps.LatLng(userLat, userLng));
      }
      map.fitBounds(bounds);
    }
  }, [clinicas, userLat, userLng]);

  const mapCenter = useMemo(() => {
    if (userLat && userLng) {
      return { lat: userLat, lng: userLng };
    }
    if (clinicas.length > 0) {
      const avgLat = clinicas.reduce((sum, c) => sum + c.lat, 0) / clinicas.length;
      const avgLng = clinicas.reduce((sum, c) => sum + c.lng, 0) / clinicas.length;
      return { lat: avgLat, lng: avgLng };
    }
    return defaultCenter;
  }, [clinicas, userLat, userLng]);

  if (!isLoaded) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
        <p className="text-gray-400 text-sm">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={12}
        onLoad={handleLoad}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* User location marker */}
        {userLat && userLng && (
          <Marker
            position={{ lat: userLat, lng: userLng }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#0d9488",
              fillOpacity: 0.8,
              strokeColor: "#fff",
              strokeWeight: 2,
            }}
            title="Sua localização"
          />
        )}

        {/* Clinic markers */}
        {clinicas.map((clinica) => (
          <Marker
            key={clinica.id}
            position={{ lat: clinica.lat, lng: clinica.lng }}
            onClick={() => setSelectedMarker(clinica)}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: clinica.tipo.includes("HABILITADO_MAPA")
                ? "#059669"
                : clinica.tipo.includes("LAB_SOROLOGIA")
                ? "#a855f7"
                : "#0891b2",
              fillOpacity: 0.9,
              strokeColor: "#fff",
              strokeWeight: 2,
            }}
            title={clinica.nome}
          />
        ))}

        {/* Info window for selected clinic */}
        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
            options={{ maxWidth: 250 }}
          >
            <div className="p-3 text-xs">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <p className="font-semibold text-navy">{selectedMarker.nome}</p>
                  <p className="text-gray-500 text-[10px]">
                    {selectedMarker.cidade}, {selectedMarker.estado}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMarker(null)}
                  className="p-0 hover:opacity-60"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-gray-600 text-[10px] mb-2">{selectedMarker.endereco}</p>
              <a
                href={`tel:${selectedMarker.telefone.replace(/\D/g, "")}`}
                className="text-teal font-semibold hover:underline"
              >
                {selectedMarker.telefone}
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
