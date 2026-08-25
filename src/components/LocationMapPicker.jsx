import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";

// Paris center - both the map's initial view and, loosely, a hint that
// this is where clicks are expected to land (Paris-only delivery area is
// still enforced downstream by CheckoutSummary's own postal-code check on
// whatever address comes back, same as the text-search path).
const PARIS_CENTER = [48.8566, 2.3522];
const INITIAL_ZOOM = 13;

/**
 * Click-to-drop-a-pin address picker. Backed entirely by free, no-key
 * services: Leaflet + OpenStreetMap tiles for the map itself, and the same
 * BAN API CheckoutSummary's text search already uses - just its reverse
 * endpoint (coordinates -> address) instead of the forward one (query ->
 * addresses). onSelect gets called with the same
 * { addressLine1, city, postalCode } shape a text-search selection
 * produces, so the parent doesn't need to know which path was used.
 */
export default function LocationMapPicker({ onSelect }) {
  const { t } = useLanguage();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  // Effect below runs once (map creation is not something to redo on every
  // render); these refs let the click handler it registers always call the
  // *latest* onSelect/t without the map itself being torn down and rebuilt
  // whenever the parent re-renders with a new inline callback.
  const onSelectRef = useRef(onSelect);
  const tRef = useRef(t);
  const [resolving, setResolving] = useState(false);
  const [resolvedLabel, setResolvedLabel] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    onSelectRef.current = onSelect;
    tRef.current = t;
  }, [onSelect, t]);

  useEffect(() => {
    const map = L.map(mapContainerRef.current).setView(PARIS_CENTER, INITIAL_ZOOM);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng(e.latlng);
      } else {
        markerRef.current = L.marker(e.latlng).addTo(map);
      }

      setError("");
      setResolvedLabel("");
      setResolving(true);
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`);
        const data = await res.json();
        const feature = data.features?.[0];
        if (!feature) {
          setError(tRef.current("No address found at that point - try somewhere else on the map."));
          return;
        }
        const props = feature.properties;
        setResolvedLabel(props.label);
        onSelectRef.current({
          addressLine1: props.name || props.label,
          city: props.city || "Paris",
          postalCode: props.postcode || "",
        });
      } catch {
        setError(tRef.current("Could not look up that location. Please try again."));
      } finally {
        setResolving(false);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  return (
    <div className="location-map-picker">
      <div ref={mapContainerRef} className="location-map-picker__map" />
      <div className="location-map-picker__status" aria-live="polite">
        {resolving && <p className="checkout-summary__suggestions-status">{t("Looking up address...")}</p>}
        {resolvedLabel && !resolving && (
          <p className="checkout-summary__hint">{t("Selected: {label}", { label: resolvedLabel })}</p>
        )}
        {error && <p className="checkout-summary__field-error">{error}</p>}
      </div>
    </div>
  );
}
