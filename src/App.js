import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./Navbar.css"; // Import the CSS file
import axios from "axios";

// Navbar Component
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* Hamburger Menu Icon */}
        <div className="menu-icon" onClick={toggleMenu}>
          {isMenuOpen ? "✕" : "☰"}
        </div>

        {/* Navigation Links */}
        <ul className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          {["Home", "Dashboard", "Track Your Shipment", "About Us", "Contact Us"].map((text, index) => (
            <li key={index}>
              <Link
                to={`/${text.toLowerCase().replace(/\s+/g, "-")}`}
                className="nav-link"
              >
                {text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-right">
        <h1 className="navbar-title">
          BiGeo
          <br />
          <span className="navbar-subtitle">
            Logistics and Supply Chain Solution
          </span>
        </h1>
      </div>
    </nav>
  );
};

// WelcomeSection Component (Home Page)
const WelcomeSection = () => {
  const styles = {
    welcomeSection: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundImage: `url("https://dimensions.edu.sg/programme/logistic/images/Supply-Chain-and-Logistics-Management.jpg")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: "rgb(65, 71, 74)",
      textAlign: "center",
      padding: "20px",
      marginTop: "60px",
    },
    welcomeTitle: {
      fontSize: "4rem",
      fontWeight: "bold",
      marginBottom: "20px",
    },
    welcomeSubtitle: {
      fontSize: "1.5rem",
      fontWeight: "400",
    },
    welcomeButton: {
      marginTop: "30px",
      padding: "15px 30px",
      fontSize: "1rem",
      fontWeight: "600",
      color: "White",
      backgroundColor: "#6a11cb",
      border: "none",
      borderRadius: "50px",
      cursor: "pointer",
      transition: "all 0.3s ease-in-out",
    },
    welcomeButtonHover: {
      transform: "scale(1.1)",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
      
    },
  };

  return (
    <section id="home" style={styles.welcomeSection}>
      <h1 style={styles.welcomeTitle} className="text-6xl font-bold">
        Welcome to BiGeo
      </h1>
      <p style={styles.welcomeSubtitle} className="text-xl">
        Your ultimate logistics and supply chain solution
      </p>
      <button
        style={styles.welcomeButton}
        className="hover:scale-110 hover:shadow-lg"
        onMouseEnter={(e) => {
          e.target.style.transform = styles.welcomeButtonHover.transform;
          e.target.style.boxShadow = styles.welcomeButtonHover.boxShadow;
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "none";
        }}
      >
        Get Started
      </button>
    </section>
  );
};

// PopupMessage Component
const PopupMessage = ({ message, type = "info", duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [duration, onClose]);

  const styles = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    color: "white",
    padding: "15px 25px",
    borderRadius: "50px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    fontSize: "1rem",
    fontWeight: "600",
    zIndex: 1000,
    animation: "slideIn 0.5s ease-out",
    backgroundColor: type === "success" ? "#4CAF50" : type === "error" ? "#FF5252" : "#6a11cb",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  return (
    <div style={styles}>
      {type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"} {message}
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editShipmentData, setEditShipmentData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("info");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    device_id: "",
    shipment_id: "",
    status: "",
    current_location: "",
    destination_location: "",
    notes: "",
  });

  // Function to show a pop-up message
  const showPopupMessage = (message, type = "info", duration = 3000) => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);

    // Hide the pop-up after the specified duration
    setTimeout(() => {
      setShowPopup(false);
    }, duration);
  };

  // Fetch shipments from the backend
  const fetchShipments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/shipments");
      setShipments(response.data);
      generateNotifications(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch shipments on component mount
  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // Generate notifications based on shipment status
  const generateNotifications = (shipments) => {
    const generatedNotifications = shipments
      .filter(
        (shipment) =>
          shipment.status === "Out for Delivery" || shipment.status === "Delivered"
      )
      .map((shipment) => {
        let message = "";
        let status = shipment.status;

        if (shipment.status === "Out for Delivery") {
          message = `Your shipment #${shipment.shipment_id} is out for delivery and will arrive soon.`;
        } else if (shipment.status === "Delivered") {
          message = `Shipment #${shipment.shipment_id} has been successfully delivered.`;
        }

        return {
          id: shipment.id,
          message,
          status,
          read: false,
        };
      });

    setNotifications(generatedNotifications);
  };

  // Calculate the next Device ID and Shipment ID
  const getNextIds = () => {
    if (shipments.length === 0) {
      return { nextDeviceId: "iot-112", nextShipmentId: "SHIP-012" };
    }

    const lastShipment = shipments[shipments.length - 1];
    const lastDeviceNumber = parseInt(lastShipment.device_id.split("-")[1], 10);
    const lastShipmentNumber = parseInt(lastShipment.shipment_id.split("-")[1], 10);

    const nextDeviceId = `iot-${(lastDeviceNumber + 1).toString().padStart(3, "0")}`;
    const nextShipmentId = `SHIP-${(lastShipmentNumber + 1).toString().padStart(3, "0")}`;

    return { nextDeviceId, nextShipmentId };
  };

  // Open the Add Shipment Form with auto-generated IDs
  const openAddForm = () => {
    const { nextDeviceId, nextShipmentId } = getNextIds();
    setFormData({
      device_id: nextDeviceId,
      shipment_id: nextShipmentId,
      status: "",
      current_location: "",
      destination_location: "",
      notes: "",
    });
    setIsAddFormOpen(!isAddFormOpen);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission for adding a new shipment
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/shipments", formData);
      setShipments([...shipments, response.data]);
      setIsAddFormOpen(false);
      setFormData({
        device_id: "",
        shipment_id: "",
        status: "",
        current_location: "",
        destination_location: "",
        notes: "",
      });
      showPopupMessage("Shipment added successfully!", "success");
    } catch (err) {
      console.error(err);
      showPopupMessage("Failed to add shipment. Please try again.", "error");
    }
  };

  // Handle form submission for editing a shipment
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/shipments/${editShipmentData.id}`,
        formData
      );
      const updatedShipments = shipments.map((shipment) =>
        shipment.id === editShipmentData.id ? response.data : shipment
      );
      setShipments(updatedShipments);
      setIsEditFormOpen(false);
      showPopupMessage("Shipment updated successfully!", "success");
    } catch (err) {
      console.error(err);
      showPopupMessage("Failed to update shipment. Please try again.", "error");
    }
  };

  // Open edit form with selected shipment data
  const openEditForm = (shipment) => {
    setEditShipmentData(shipment);
    setFormData({
      device_id: shipment.device_id,
      shipment_id: shipment.shipment_id,
      status: shipment.status,
      current_location: shipment.current_location,
      destination_location: shipment.destination_location,
      notes: shipment.notes,
    });
    setIsEditFormOpen(true);
    setIsAddFormOpen(false);

    // Show the pop-up message
    showPopupMessage("Back to the Top!", "info");
  };

  // Toggle notifications section
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  // Delete a notification
  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  // Styles
  const styles = {
    dashboard: {
      display: "flex",
      height: "100vh",
      marginTop: "60px",
      fontFamily: "'Poppins', sans-serif",
      background: "#f5f5f5",
    },
    sidebar: {
      width: "250px",
      background: "#343a40",
      color: "white",
      padding: "20px",
      boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
      transition: "width 0.3s ease",
    },
    sidebarMinimized: {
      width: "80px",
    },
    minimizeButton: {
      background: "none",
      border: "none",
      color: "white",
      cursor: "pointer",
      fontSize: "1.5rem",
      marginBottom: "20px",
    },
    mainContent: {
      flex: 1,
      padding: "20px",
      background: "#fff",
      overflowY: "auto",
    },
    header: {
      fontSize: "2rem",
      fontWeight: "bold",
      marginBottom: "20px",
      color: "#343a40",
    },
    card: {
      background: "#fff",
      borderRadius: "10px",
      padding: "20px",
      marginBottom: "20px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    cardTitle: {
      fontSize: "1.5rem",
      fontWeight: "600",
      marginBottom: "10px",
      color: "#343a40",
    },
    notification: {
      background: "#fff",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      borderLeft: "5px solid #6a11cb",
      transition: "all 0.3s ease",
    },
    notificationHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    },
    notificationText: {
      fontSize: "0.9rem",
      color: "#343a40",
    },
    closeButton: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "1rem",
      color: "#343a40",
      transition: "all 0.3s ease",
    },
    closeButtonHover: {
      color: "#ff4d4f",
    },
    notificationIcon: {
      marginRight: "10px",
      fontSize: "1.2rem",
      color: "#6a11cb",
    },
    notificationStatus: {
      fontSize: "0.8rem",
      fontWeight: "600",
      color: "#6a11cb",
      textTransform: "uppercase",
    },
    notificationWrongMark: {
      fontSize: "1.2rem",
      color: "#ff4d4f",
      cursor: "pointer",
    },
    notificationIconContainer: {
      position: "relative",
      display: "inline-block",
      cursor: "pointer",
      fontSize: "1.5rem",
      padding: "10px",
      borderRadius: "50%",
      background: "#f0f0f0",
      transition: "all 0.3s ease",
    },
    notificationIconContainerHover: {
      background: "#e0e0e0",
      transform: "scale(1.1)",
    },
    notificationBadge: {
      position: "absolute",
      top: "14px",
      right: "14px",
      width: "10px",
      height: "10px",
      backgroundColor: "#ff4d4f",
      borderRadius: "50%",
      border: "2px solid white",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    },
    input: {
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      outline: "none",
    },
    inputFocus: {
      borderColor: "#6a11cb",
      boxShadow: "0 0 0 3px rgba(106, 17, 203, 0.1)",
    },
    textarea: {
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      fontSize: "1rem",
      minHeight: "120px",
      resize: "vertical",
      transition: "all 0.3s ease",
      outline: "none",
    },
    textareaFocus: {
      borderColor: "#6a11cb",
      boxShadow: "0 0 0 3px rgba(106, 17, 203, 0.1)",
    },
    button: {
      padding: "12px",
      background: "#6a11cb",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "600",
      transition: "all 0.3s ease",
    },
    buttonHover: {
      background: "#2575fc",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    },
    shipmentStatus: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    shipmentItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px",
      background: "#f8f9fa",
      borderRadius: "8px",
      border: "1px solid #ddd",
      transition: "all 0.3s ease",
    },
    shipmentItemHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    shipmentId: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#343a40",
    },
    shipmentStatusText: {
      fontSize: "0.9rem",
      color: "#6a11cb",
      fontWeight: "600",
    },
    shipmentLocation: {
      fontSize: "0.9rem",
      color: "#666",
    },
    loading: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100px",
      fontSize: "1.2rem",
      color: "#6a11cb",
    },
  };

  return (
    <div style={styles.dashboard}>
      {/* Pop-up Message */}
      {showPopup && (
        <PopupMessage
          message={popupMessage}
          type={popupType}
          duration={3000}
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          ...styles.sidebar,
          ...(isSidebarMinimized ? styles.sidebarMinimized : {}),
        }}
      >
        <button
          style={styles.minimizeButton}
          onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
        >
          {isSidebarMinimized ? "☰" : "✕"}
        </button>
        {/* Sidebar content */}
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Dashboard Title with Add Button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h1 style={styles.header}>Dashboard</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            {/* Add Shipment Button */}
            <div
              style={{
                ...styles.notificationIconContainer,
                ...(isAddFormOpen ? styles.notificationIconContainerHover : {}),
              }}
              onClick={openAddForm}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  styles.notificationIconContainerHover.background;
                e.currentTarget.style.transform =
                  styles.notificationIconContainerHover.transform;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f0f0f0";
                e.currentTarget.style.transform = "scale(1)";
              }}
              title={isAddFormOpen ? "Cancel" : "Add New Shipment"}
            >
              {isAddFormOpen ? "✕" : "➕"}
            </div>
          </div>
        </div>

        {/* Add Shipment Form */}
        {isAddFormOpen && (
          <div style={styles.card}>
            <h2 style={{ ...styles.cardTitle, fontSize: "1.8rem", marginBottom: "20px" }}>
              Add New Shipment
            </h2>
            <form style={styles.form} onSubmit={handleAddSubmit}>
              <input
                type="text"
                name="device_id"
                placeholder="Device ID"
                value={formData.device_id}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  padding: "12px",
                  fontSize: "1rem",
                  background: "linear-gradient(145deg, #f9f9f9, #ffffff)",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #ffffff, #f0f0f0)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                  e.target.style.borderColor = "#6a11cb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #f9f9f9, #ffffff)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  e.target.style.borderColor = "#e0e0e0";
                }}
                required
                readOnly
              />
              <input
                type="text"
                name="shipment_id"
                placeholder="Shipment ID"
                value={formData.shipment_id}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  padding: "12px",
                  fontSize: "1rem",
                  background: "linear-gradient(145deg, #f9f9f9, #ffffff)",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #ffffff, #f0f0f0)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                  e.target.style.borderColor = "#6a11cb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #f9f9f9, #ffffff)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  e.target.style.borderColor = "#e0e0e0";
                }}
                required
                readOnly
              />
              <input
                type="text"
                name="status"
                placeholder="Status (eg: In Transit, Pending)"
                value={formData.status}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  padding: "12px",
                  fontSize: "1rem",
                  background: "linear-gradient(145deg, #f9f9f9, #ffffff)",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #ffffff, #f0f0f0)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                  e.target.style.borderColor = "#6a11cb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #f9f9f9, #ffffff)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  e.target.style.borderColor = "#e0e0e0";
                }}
                required
              />
              <input
                type="text"
                name="current_location"
                placeholder="Current Location"
                value={formData.current_location}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  padding: "12px",
                  fontSize: "1rem",
                  background: "linear-gradient(145deg, #f9f9f9, #ffffff)",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #ffffff, #f0f0f0)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                  e.target.style.borderColor = "#6a11cb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #f9f9f9, #ffffff)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  e.target.style.borderColor = "#e0e0e0";
                }}
                required
              />
              <input
                type="text"
                name="destination_location"
                placeholder="Destination Location"
                value={formData.destination_location}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  padding: "12px",
                  fontSize: "1rem",
                  background: "linear-gradient(145deg, #f9f9f9, #ffffff)",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #ffffff, #f0f0f0)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                  e.target.style.borderColor = "#6a11cb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #f9f9f9, #ffffff)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  e.target.style.borderColor = "#e0e0e0";
                }}
                required
              />
              <textarea
                name="notes"
                placeholder="Additional Note???"
                value={formData.notes}
                onChange={handleChange}
                style={{
                  ...styles.textarea,
                  padding: "12px",
                  fontSize: "1rem",
                  background: "linear-gradient(145deg, #f9f9f9, #ffffff)",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #ffffff, #f0f0f0)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                  e.target.style.borderColor = "#6a11cb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #f9f9f9, #ffffff)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  e.target.style.borderColor = "#e0e0e0";
                }}
              />
              {/* Button Container */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  type="submit"
                  style={styles.button}
                  onMouseEnter={(e) => {
                    e.target.style.background = styles.buttonHover.background;
                    e.target.style.transform = styles.buttonHover.transform;
                    e.target.style.boxShadow = styles.buttonHover.boxShadow;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#6a11cb";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  Submit Shipment
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.button,
                    background: "linear-gradient(135deg, #ff4d4f, #ff7875)",
                  }}
                  onClick={() => setIsAddFormOpen(false)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = styles.buttonHover.transform;
                    e.target.style.boxShadow = styles.buttonHover.boxShadow;
                    e.target.style.background = "linear-gradient(135deg, #ff7875, #ff4d4f)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = styles.button.boxShadow;
                    e.target.style.background = "linear-gradient(135deg, #ff4d4f, #ff7875)";
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Shipment Form */}
        {isEditFormOpen && (
          <div style={styles.card}>
            <h2 style={{ ...styles.cardTitle, fontSize: "1.8rem", marginBottom: "20px" }}>
              Edit Shipment
            </h2>
            <form style={styles.form} onSubmit={handleEditSubmit}>
              {/* Device ID Field (Read-Only) */}
              <input
                type="text"
                name="device_id"
                placeholder="Device ID"
                value={formData.device_id}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  padding: "12px",
                  fontSize: "1rem",
                  background: "linear-gradient(145deg, #f9f9f9, #ffffff)",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #ffffff, #f0f0f0)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                  e.target.style.borderColor = "#6a11cb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #f9f9f9, #ffffff)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  e.target.style.borderColor = "#e0e0e0";
                }}
                readOnly
              />
              {/* Shipment ID Field (Read-Only) */}
              <input
                type="text"
                name="shipment_id"
                placeholder="Shipment ID"
                value={formData.shipment_id}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  padding: "12px",
                  fontSize: "1rem",
                  background: "linear-gradient(145deg, #f9f9f9, #ffffff)",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #ffffff, #f0f0f0)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                  e.target.style.borderColor = "#6a11cb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #f9f9f9, #ffffff)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  e.target.style.borderColor = "#e0e0e0";
                }}
                readOnly
              />
              {/* Status Field */}
              <input
                type="text"
                name="status"
                placeholder="Status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  padding: "12px",
                  fontSize: "1rem",
                  background: "linear-gradient(145deg, #f9f9f9, #ffffff)",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #ffffff, #f0f0f0)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                  e.target.style.borderColor = "#6a11cb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #f9f9f9, #ffffff)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  e.target.style.borderColor = "#e0e0e0";
                }}
                required
              />
              {/* Current Location Field */}
              <input
                type="text"
                name="current_location"
                placeholder="Current Location"
                value={formData.current_location}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  padding: "12px",
                  fontSize: "1rem",
                  background: "linear-gradient(145deg, #f9f9f9, #ffffff)",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #ffffff, #f0f0f0)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                  e.target.style.borderColor = "#6a11cb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #f9f9f9, #ffffff)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  e.target.style.borderColor = "#e0e0e0";
                }}
                required
              />
              {/* Destination Location Field */}
              <input
                type="text"
                name="destination_location"
                placeholder="Destination Location"
                value={formData.destination_location}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  padding: "12px",
                  fontSize: "1rem",
                  background: "linear-gradient(145deg, #f9f9f9, #ffffff)",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #ffffff, #f0f0f0)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                  e.target.style.borderColor = "#6a11cb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #f9f9f9, #ffffff)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  e.target.style.borderColor = "#e0e0e0";
                }}
                required
              />
              {/* Notes Field (Updated to Textarea) */}
              <textarea
                name="notes"
                placeholder="Additional Notes"
                value={formData.notes}
                onChange={handleChange}
                style={{
                  ...styles.textarea,
                  padding: "12px",
                  fontSize: "1rem",
                  background: "linear-gradient(145deg, #f9f9f9, #ffffff)",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #ffffff, #f0f0f0)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                  e.target.style.borderColor = "#6a11cb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(145deg, #f9f9f9, #ffffff)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  e.target.style.borderColor = "#e0e0e0";
                }}
              />
              {/* Button Container */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  type="submit"
                  style={styles.button}
                  onMouseEnter={(e) => {
                    e.target.style.background = styles.buttonHover.background;
                    e.target.style.transform = styles.buttonHover.transform;
                    e.target.style.boxShadow = styles.buttonHover.boxShadow;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#6a11cb";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  Update Shipment
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.button,
                    background: "linear-gradient(135deg, #ff4d4f, #ff7875)",
                  }}
                  onClick={() => setIsEditFormOpen(false)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = styles.buttonHover.transform;
                    e.target.style.boxShadow = styles.buttonHover.boxShadow;
                    e.target.style.background = "linear-gradient(135deg, #ff7875, #ff4d4f)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = styles.button.boxShadow;
                    e.target.style.background = "linear-gradient(135deg, #ff4d4f, #ff7875)";
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notifications Section */}
        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2 style={styles.cardTitle}>Notifications</h2>
            <button
              style={styles.minimizeButton}
              onClick={toggleNotifications}
            >
              {isNotificationsOpen ? (
                <span style={styles.notificationWrongMark}>❌</span>
              ) : (
                <div
                  style={{
                    ...styles.notificationIconContainer,
                    position: "relative",
                    display: "inline-block",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    padding: "10px",
                    borderRadius: "50%",
                    background: "#f0f0f0",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e0e0e0";
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f0f0f0";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  🔔
                  {notifications.some((notification) => !notification.read) && (
                    <span
                      style={{
                        position: "absolute",
                        top: "14px",
                        right: "14px",
                        width: "10px",
                        height: "10px",
                        backgroundColor: "#ff4d4f",
                        borderRadius: "50%",
                        border: "2px solid white",
                      }}
                    ></span>
                  )}
                </div>
              )}
            </button>
          </div>
          {isNotificationsOpen && (
            <div style={{ marginBottom: "20px" }}>
              {/* Mark All as Read Button */}
              <button
                style={{
                  ...styles.button,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  marginBottom: "20px",
                  background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                }}
                onClick={markAllAsRead}
                onMouseEnter={(e) => {
                  e.target.style.background = styles.buttonHover.background;
                  e.target.style.transform = styles.buttonHover.transform;
                  e.target.style.boxShadow = styles.buttonHover.boxShadow;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#6a11cb";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>📨</span> 
                Mark All as Read
              </button>

              {/* Notifications List */}
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    ...styles.notification,
                    opacity: notification.read ? 0.7 : 1,
                    transform: notification.read ? "scale(0.98)" : "scale(1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0, 0, 0, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 4px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={styles.notificationIcon}>🔔</span>
                    <div>
                      <p style={styles.notificationText}>{notification.message}</p>
                      <span style={styles.notificationStatus}>
                        Status: {notification.status}
                      </span>
                    </div>
                  </div>
                  <button
                    style={styles.closeButton}
                    onClick={() => deleteNotification(notification.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = styles.closeButtonHover.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = styles.closeButton.color;
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shipment Status and Location Updates */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Shipment Status and Location</h2>
          {isLoading ? (
            <div style={styles.loading}>Loading shipments...</div>
          ) : (
            <div style={styles.shipmentStatus}>
              {shipments.map((shipment) => (
                <div
                  key={shipment.id}
                  style={styles.shipmentItem}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <div style={styles.shipmentId}>Shipment #{shipment.shipment_id}</div>
                    <div style={styles.shipmentStatusText}>
                      Status: {shipment.status}
                    </div>
                    <div style={styles.shipmentLocation}>
                      Current Location: {shipment.current_location}
                    </div>
                    <div style={styles.shipmentLocation}>
                      Destination: {shipment.destination_location}
                    </div>
                    {/* Replaced "Created At" with "Notes".... */}
                    <div style={styles.shipmentLocation}>
                      Note: {shipment.notes || "No notes available"}
                    </div>
                  </div>
                  <button
                    style={styles.button}
                    onClick={() => openEditForm(shipment)}
                    onMouseEnter={(e) => {
                      e.target.style.background = styles.buttonHover.background;
                      e.target.style.transform = styles.buttonHover.transform;
                      e.target.style.boxShadow = styles.buttonHover.boxShadow;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#6a11cb";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <button
              style={styles.button}
              onClick={fetchShipments}
              onMouseEnter={(e) => {
                e.target.style.background = styles.buttonHover.background;
                e.target.style.transform = styles.buttonHover.transform;
                e.target.style.boxShadow = styles.buttonHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#6a11cb";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              Refresh Shipments
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// AboutUs Component
const AboutUs = () => {
  const styles = {
    aboutUs: {
      padding: "80px",
      marginTop: "60px",
      fontFamily: "'Poppins', sans-serif",
      background: "#f5f5f5",
      minHeight: "100vh",
    },
    header: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: "20px",
      color: "#343a40",
    },
    content: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      background: "#fff",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    sectionTitle: {
      fontSize: "2rem",
      fontWeight: "600",
      marginBottom: "10px",
      color: "#6a11cb",
      textAlign: "center",
    },
    team: {
      display: "flex",
      justifyContent: "space-around",
      marginTop: "20px",
    },
    teamMember: {
      textAlign: "center",
    },
    teamMemberName: {
      fontSize: "1.2rem",
      fontWeight: "600",
      color: "#343a40",
    },
    teamMemberRole: {
      fontSize: "0.9rem",
      color: "#777",
    },
    highlight: {
      color: "#6a11cb",
      fontWeight: "600",
    },
    // Media Queries for AboutUs
    "@media (max-width: 768px)": {
      header: {
        fontSize: "2rem",
      },
      sectionTitle: {
        fontSize: "1.5rem",
      },
      team: {
        flexDirection: "column",
        gap: "20px",
      },
    },
  };

  return (
    <div style={styles.aboutUs}>
      <h1 style={styles.header}>About Us</h1>
      <div style={styles.content}>
        <p>
          At <span style={styles.highlight}>BiGeo</span>, we’re transforming the logistics industry. Using advanced technology, we design efficient and eco-friendly supply chains that help businesses thrive while ensuring unmatched dependability. We’re more than a delivery service—we’re shaping the future of a  global connectivity.
        </p>
        <h2 style={styles.sectionTitle}>Our Team</h2>
        <div style={styles.team}>
          <div style={styles.teamMember}>
            <h3 style={styles.teamMemberName}>Nagaraju Devulapelly</h3>
            <p style={styles.teamMemberRole}>Team Member 1</p>
          </div>
          <div style={styles.teamMember}>
            <h3 style={styles.teamMemberName}>Rahul Peddapally</h3>
            <p style={styles.teamMemberRole}>Team Member 2</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ContactUs Component
const ContactUs = () => {
  const styles = {
    contactUs: {
      padding: "20px",
      // marginTop: "60px",
      fontFamily: "'Poppins', sans-serif",
      background: "#f5f5f5",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
    header: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      color: "#343a40",
      marginBottom: "20px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      maxWidth: "500px",
      width: "100%",
    },
    input: {
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ddd",
      fontSize: "1rem",
    },
    textarea: {
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ddd",
      fontSize: "1rem",
      minHeight: "150px",
    },
    button: {
      padding: "10px",
      background: "#6a11cb",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "all 0.3s ease",
    },
    buttonHover: {
      background: "#2575fc",
    },
    // Media Queries for ContactUs
    "@media (max-width: 768px)": {
      header: {
        fontSize: "2rem",
      },
      input: {
        padding: "8px",
        fontSize: "0.9rem",
      },
      textarea: {
        padding: "8px",
        fontSize: "0.9rem",
      },
      button: {
        padding: "8px",
        fontSize: "0.9rem",
      },
    },
  };

  return (
    <section id="contact-us" style={styles.contactUs}>
      <h1 style={styles.header}>Contact Us</h1>
      <form style={styles.form}>
        <input type="text" placeholder="Your Name" style={styles.input} />
        <input type="email" placeholder="Your Email" style={styles.input} />
        <textarea placeholder="Your Message" style={styles.textarea} />
        <button
          type="submit"
          style={styles.button}
          onMouseEnter={(e) => {
            e.target.style.background = styles.buttonHover.background;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#6a11cb";
          }}
        >
          Send Message
        </button>
      </form>
    </section>
  );
};

// TrackYourShipment Component
const TrackYourShipment = () => {
  const styles = {
    trackShipment: {
      padding: "40px 20px",
      marginTop: "60px",
      fontFamily: "'Poppins', sans-serif",
      background: "#f5f5f5",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
    header: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      color: "#343a40",
      marginBottom: "30px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      maxWidth: "500px",
      width: "100%",
      marginBottom: "30px",
    },
    input: {
      padding: "12px",
      borderRadius: "5px",
      border: "1px solid #ddd",
      fontSize: "1rem",
    },
    button: {
      padding: "12px",
      background: "#6a11cb",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "all 0.3s ease",
    },
    buttonHover: {
      background: "#2575fc",
    },
    shipmentDetails: {
      marginTop: "30px",
      padding: "25px",
      background: "#fff",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      width: "100%",
      maxWidth: "500px",
    },
    shipmentId: {
      fontSize: "1.2rem",
      fontWeight: "600",
      color: "#343a40",
      marginBottom: "15px",
    },
    shipmentStatus: {
      fontSize: "1rem",
      color: "#6a11cb",
      fontWeight: "600",
      marginBottom: "20px",
    },
    shipmentLocation: {
      fontSize: "0.9rem",
      color: "#2575fc",
      marginBottom: "5px",
      transition: "margin-top 0.3s ease", // Smooth transition for margin-top
    },
    shipmentNotes: {
      fontSize: "0.9rem",
      color: "#ff4d4f",
      fontStyle: "italic",
      marginBottom: "5px",
      transition: "margin-top 0.3s ease", // Smooth transition for margin-top
    },
    created_at: {
      fontSize: "0.8rem",
      color: "#4CAF50",
      fontStyle: "italic",
      transition: "margin-top 0.3s ease", // Smooth transition for margin-top
    },
    error: {
      color: "#ff4d4f",
      fontSize: "0.9rem",
      marginTop: "20px",
    },
    progressBarContainer: {
      width: "100%",
      marginTop: "20px",
      marginBottom: "4px", // Added 4px gap below the progress bar
      padding: "10px",
      borderRadius: "10px",
      transition: "all 0.3s ease",
    },
    progressBarContainerHover: {
      padding: "15px",
      backgroundColor: "#f0f0f0",
    },
    progressBar: {
      width: "100%",
      height: "20px",
      backgroundColor: "#e0e0e0",
      borderRadius: "10px",
      overflow: "hidden",
      position: "relative",
    },
    progress: {
      height: "100%",
      backgroundColor: "#6a11cb",
      transition: "width 0.4s ease",
    },
    progressSteps: {
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
      marginTop: "20px",
      marginBottom: "20px",
      fontSize: "0.8rem",
      color: "#666",
      position: "relative",
    },
    stepPoint: {
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      backgroundColor: "#e0e0e0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer", // Removed hover effect
    },
    stepPointActive: {
      backgroundColor: "#6a11cb",
      color: "white",
    },
    stepLabel: {
      position: "absolute",
      top: "25px",
      fontSize: "0.7rem",
      color: "#666",
    },
  };

  const [shipmentId, setShipmentId] = useState("");
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [error, setError] = useState("");
  const [isProgressBarHovered, setIsProgressBarHovered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:5000/api/shipments/${shipmentId}`);
      setShipmentDetails(response.data);
      setError("");
    } catch (err) {
      setShipmentDetails(null);
      setError("Shipment not found. Please check the ID and try again.");
    }
  };

  const getProgressWidth = (status) => {
    switch (status) {
      case "Pending":
        return "25%";
      case "In Transit":
        return "50%";
      case "Out for Delivery":
        return "75%";
      case "Delivered":
        return "100%";
      default:
        return "0%";
    }
  };

  const steps = ["Pending", "In Transit", "Out for Delivery", "Delivered"];

  return (
    <section id="track-your-shipment" style={styles.trackShipment}>
      <h1 style={styles.header}>Track Your Shipment</h1>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Shipment ID (eg. 001,002,003,.....)"
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            fontSize: "1rem",
            background: "linear-gradient(145deg, #f9f9f9, #ffffff)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "linear-gradient(145deg, #ffffff, #f0f0f0)";
            e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
            e.target.style.borderColor = "#6a11cb";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "linear-gradient(145deg, #f9f9f9, #ffffff)";
            e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
            e.target.style.borderColor = "#e0e0e0";
          }}
          required
        />
        <button
          type="submit"
          style={styles.button}
          onMouseEnter={(e) => {
            e.target.style.background = styles.buttonHover.background;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#6a11cb";
          }}
        >
          Track Shipment
        </button>
      </form>

      {shipmentDetails && (
        <div style={styles.shipmentDetails}>
          <div style={styles.shipmentId}>
            Shipment ID: {shipmentDetails.shipment_id}
          </div>
          <div style={styles.shipmentStatus}>
            Status: {shipmentDetails.status}
          </div>

          {/* Progress Bar Container with Hover Effect */}
          <div
            style={{
              ...styles.progressBarContainer,
              ...(isProgressBarHovered ? styles.progressBarContainerHover : {}),
            }}
            onMouseEnter={() => setIsProgressBarHovered(true)}
            onMouseLeave={() => setIsProgressBarHovered(false)}
          >
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progress,
                  width: getProgressWidth(shipmentDetails.status),
                }}
              ></div>
            </div>
          </div>

          {/* Progress Steps with Points (No Hover Effect) (Optonal have to make?) */}
          <div style={styles.progressSteps}>
            {steps.map((step, index) => (
              <div
                key={index}
                style={{
                  ...styles.stepPoint,
                  ...(shipmentDetails.status === step ? styles.stepPointActive : {}),
                }}
              >
                {index + 1}
                <div style={styles.stepLabel}>{step}</div>
              </div>
            ))}
          </div>

          {/* Current Location, Destination, Notes, and Created At */}
          <div
            style={{
              ...styles.shipmentLocation,
              marginTop: isProgressBarHovered ? "9px" : "5px", // Move down by 4px on hover
            }}
          >
            Current Location: {shipmentDetails.current_location}
          </div>
          <div
            style={{
              ...styles.shipmentLocation,
              marginTop: isProgressBarHovered ? "9px" : "5px", // Move down by 4px on hover
            }}
          >
            Destination: {shipmentDetails.destination_location}
          </div>
          <div
            style={{
              ...styles.shipmentNotes,
              marginTop: isProgressBarHovered ? "9px" : "5px", // Move down by 4px on hover
            }}
          >
            Note: {shipmentDetails.notes}
          </div>
          <div
            style={{
              ...styles.created_at,
              marginTop: isProgressBarHovered ? "9px" : "5px", // Move down by 4px on hover
            }}
          >
            Created At: {new Date(shipmentDetails.created_at).toLocaleString()}
          </div>
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}
    </section>
  );
};

// App Component
const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<WelcomeSection />} />
        <Route path="/home" element={<WelcomeSection />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/track-your-shipment" element={<TrackYourShipment />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
      </Routes>
    </Router>
  );
};

export default App;