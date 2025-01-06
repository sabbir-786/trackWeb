import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TrackerMap = ({ currentLocation, isOpen, onClose }) => {
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
          iconUrl: "/truck_vehicle_icon.svg", // Path to your truck icon
          iconSize: [32, 32], // Size of the icon
          iconAnchor: [16, 32], // Anchor point of the icon (centered at the bottom)
          popupAnchor: [0, -32], // Position of the popup relative to the icon
        });

    // Create marker
    markerRef.current = L.marker([currentLocation.lat, currentLocation.lng], {icon: truckIcon})
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

// Add styles
const styles = `
.tracker-map-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05),
    rgba(128, 128, 128, 0.1),
    rgba(0, 0, 0, 0.15)
  );
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(9px);
  -webkit-backdrop-filter: blur(9px);
}

.modal-content {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 16px;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  color: #000;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  padding-bottom: 10px;
}

.modal-header h3 {
  color: #000;
  font-weight: 600;
}

.modal-header button {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.8),
    rgba(32, 32, 32, 0.9)
  );
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  font-size: 1.3em;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 5px 12px;
}

.modal-header button:hover {
  background: linear-gradient(
    135deg,
    rgba(32, 32, 32, 0.9),
    rgba(0, 0, 0, 0.8)
  );
  transform: scale(1.05);
}

.location-info {
  margin-top: 20px;
  padding: 15px;
  background: rgba(245, 245, 245, 0.4);
  border-radius: 8px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.location-info > div {
  margin-bottom: 10px;
  color: #000;
}

.location-info strong {
  color: #000;
  font-weight: 600;
}

@media screen and (max-width: 768px) {
  .modal-content {
    width: 95%;
    height: 95vh;
    margin: 10px;
    padding: 15px;
  }
}

@media screen and (max-width: 480px) {
  .modal-content {
    width: 100%;
    height: 100vh;
    margin: 0;
    padding: 10px;
    border-radius: 0;
  }

  div[style*="height: 400px"] {
    height: 60vh !important;
  }
}
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default TrackerMap;
