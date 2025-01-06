import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TrackerMap = ({ currentLocation, isOpen, onClose, truckIconUrl }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const containerRef = useRef(null);

  // Function to initialize map
  const initializeMap = () => {
    if (!containerRef.current) return;

    // If map already exists, remove it first
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }

    // Create new map
    const map = L.map("map").setView(
      [currentLocation.lat, currentLocation.lng],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    // Create custom icon for the marker
    const truckIcon = L.icon({
      iconUrl: truckIconUrl, // Path to your truck icon
      iconSize: [32, 32], // Size of the icon
      iconAnchor: [16, 32], // Anchor point of the icon (centered at the bottom)
      popupAnchor: [0, -32], // Position of the popup relative to the icon
    });

    // Create marker with custom icon
    markerRef.current = L.marker([currentLocation.lat, currentLocation.lng], { icon: truckIcon })
      .addTo(map)
      .bindPopup("Your location")
      .openPopup();

    // Force a resize after map is initialized
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);
  };

  useEffect(() => {
    if (isOpen) {
      // Initialize map when modal is opened
      setTimeout(() => {
        initializeMap();
      }, 100);
    }

    return () => {
      // Cleanup when component unmounts or modal closes
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  // Update marker position when location changes
  useEffect(() => {
    if (markerRef.current && isOpen) {
      markerRef.current.setLatLng([currentLocation.lat, currentLocation.lng]);
      if (mapRef.current) {
        mapRef.current.setView([currentLocation.lat, currentLocation.lng], 13);
      }
    }
  }, [currentLocation, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="tracker-map-modal">
      <div className="modal-content" ref={containerRef}>
        <div className="modal-header">
          <h3>Live Location Tracking</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <div
          id="map"
          style={{
            width: "100%",
            height: "400px",
            borderRadius: "12px",
            zIndex: 1,
          }}
        />
        <div className="location-info">
          <div>
            <strong>Current Location: </strong>
            {currentLocation.address ||
              `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add styles (same as before)
const styles = `
// (Insert existing styles here)
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default TrackerMap;
