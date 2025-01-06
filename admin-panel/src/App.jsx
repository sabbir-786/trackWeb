import { useState, useEffect } from "react";
import io from "socket.io-client";
import "leaflet/dist/leaflet.css"; // Add this import
import TrackerMap from "./components/TrackerMap";

// Replace with your local or public server IP address
const socket = io("http://localhost:4000", {
  reconnectionAttempts: 5,
  timeout: 10000,
});

// Log socket connection status
socket.on("connect", () => {
  console.log("Socket connected successfully");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

const App = () => {
  const [location, setLocation] = useState(null);
  const [serverLocation, setServerLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Function to get the user's location
    const getLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setLocation(loc);
            console.log("Location obtained:", loc); // Debug log

            // Emit location to the server
            try {
              socket.emit("share-location", loc);
              console.log("Location shared successfully");
            } catch (socketError) {
              console.error("Error sharing location:", socketError);
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            setErrorMsg("Failed to get location");
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setErrorMsg("Geolocation is not supported by this browser.");
      }
    };

    getLocation();

    // Listen for location updates from the server
    socket.on("location-update", (data) => {
      console.log("Location received from server:", data);
      setServerLocation(data.location); // Update server location in real-time
    });

    // Clean up socket listeners on unmount
    return () => {
      socket.off("location-update");
    };
  }, []);

  const sendLocation = async () => {
    try {
      if (!location) {
        console.log("No location available to send");
        return;
      }

      const locationData = {
        deviceId: "unique-device-id",
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      };

      socket.emit("updateLocation", locationData);
      console.log("Location update sent:", locationData);
      
      // Open the map modal when location is sent
      setIsMapOpen(true);
      console.log("Map modal opened"); // Debug log
    } catch (error) {
      console.error("Error sending location:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev); // Toggle the sidebar visibility
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div onClick={toggleSidebar} style={styles.menuIcon}>
          &#9776; {/* Hamburger icon */}
        </div>
        <h1 style={styles.navbarTitle}>Admin Panel</h1>
      </div>

      {/* Sidebar */}
      <div style={{ ...styles.sidebar, display: isSidebarOpen ? "block" : "none" }}>
        <h2 style={styles.sidebarTitle}>Menu</h2>
        <a href="#" style={styles.sidebarLink}>Dashboard</a>
        <a href="#" style={styles.sidebarLink}>Manage Locations</a>
        <a href="#" style={styles.sidebarLink}>Settings</a>
        <a href="#" style={styles.sidebarLink}>Logout</a>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <h1 style={styles.title}>React Location Sharing</h1>
        {errorMsg ? (
          <p style={styles.error}>{errorMsg}</p>
        ) : (
          <div>
            <p style={styles.locationText}>
              {location
                ? `Your Location: Lat: ${location.latitude}, Long: ${location.longitude}`
                : "Getting location..."}
            </p>
            {serverLocation && (
              <p style={styles.locationText}>
                Server Location: Lat: {serverLocation.latitude}, Long:{" "}
                {serverLocation.longitude}
              </p>
            )}
          </div>
        )}
        <button onClick={sendLocation} style={styles.button}>
          Send Current Location
        </button>

        {/* Debugging info */}
        <div style={styles.debug}>
          Map Status: {isMapOpen ? 'Open' : 'Closed'}
          <br />
          Location Available: {location ? 'Yes' : 'No'}
        </div>

        {location && (
          <TrackerMap
            currentLocation={{
              lat: location.latitude,
              lng: location.longitude,
              address: "", // Add empty address property
            }}
            isOpen={isMapOpen}
            onClose={() => {
              setIsMapOpen(false);
              console.log("Map modal closed"); // Debug log
            }}
          />
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "row", // Side-by-side layout
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    fontFamily: "Arial, sans-serif",
  },
  navbar: {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    padding: "10px 20px",
    backgroundColor: "#2c3e50",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  menuIcon: {
    fontSize: "30px",
    cursor: "pointer",
  },
  navbarTitle: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  sidebar: {
    position: "fixed",
    top: "0",
    left: "0",
    bottom: "0",
    width: "250px",
    backgroundColor: "#2c3e50",
    color: "#fff",
    padding: "20px",
    display: "none", // Initially hidden
    zIndex: 5,
    boxShadow: "2px 0px 10px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease-in-out",
  },
  sidebarTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "30px",
  },
  sidebarLink: {
    color: "#ecf0f1",
    fontSize: "16px",
    textDecoration: "none",
    marginBottom: "15px",
    padding: "10px",
    display: "block",
    backgroundColor: "#34495e", // Black background for each link
    borderRadius: "4px",
    transition: "background-color 0.3s",
  },
  sidebarLinkHover: {
    backgroundColor: "#2c3e50", // Darken when hovered
  },
  mainContent: {
    flex: 1,
    padding: "30px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    marginLeft: "550px", // Shift content right when sidebar is open
    marginTop: "60px", // Adjust to avoid navbar overlap
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  error: {
    color: "#ff4444",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "4px",
    backgroundColor: "#ffe6e6",
  },
  locationText: {
    marginBottom: "10px",
    padding: "10px",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
    width: "100%",
    textAlign: "center",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    marginTop: "15px",
    cursor: "pointer",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    transition: "background-color 0.3s",
  },
  debug: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    fontSize: "14px",
    color: "#666",
  },
};

export default App;
