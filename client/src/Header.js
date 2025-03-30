import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null); // Assume user info comes from some auth service

  // Example of fetching the current user (could be from context, Redux, etc.)
  useEffect(() => {
    const user = { username: "Mihalavric" }; // This would come from your auth service
    setCurrentUser(user);
  }, []);

  const handleLogout = async () => {
    try {
        // Send logout request to Flask backend
        const response = await fetch("https://e-narocilnice-5.onrender.com/logout", {
            method: "POST",
            credentials: "include", // Ensures cookies are sent
        });

        if (response.ok) {
            console.log("Logged out successfully");

            // Clear localStorage and sessionStorage
            localStorage.removeItem("username");
            localStorage.removeItem("authToken");
            sessionStorage.removeItem("authToken");

            // Delete cookies
            document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

            // Redirect to login page
            window.location.href = "/login";
        } else {
            console.error("Logout failed:", response.statusText);
        }
    } catch (error) {
        console.error("Error during logout:", error);
    }
};


  const handleNavigate = (path) => {
    navigate(path);
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light custom-navbar">
      <div className="container-fluid">
        {/* Logo/Menu Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <a className="navbar-brand" href="#">
          naročilnica
        </a>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link" onClick={() => handleNavigate("/orders")}>
                Domača stran
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={() => handleNavigate("/vnos")}>
                Vnesi naročilnico
              </a>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                id="pregledDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Pregled naročilnic
              </a>
              <ul className="dropdown-menu">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleNavigate("/orders/blago")}
                  >
                    Blago
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleNavigate("/orders/storitev")}
                  >
                    Storitev
                  </button>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="arhivDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Arhiv
              </a>
              <ul className="dropdown-menu">
                {[2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024].map((year) => (
                  <li key={year}>
                    <button
                      className="dropdown-item"
                      onClick={() => handleNavigate(`/archive/${year}`)}
                    >
                      {year}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          </ul>

          {/* User Info */}
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              {currentUser ? (
                <>
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="userDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Prijavljen kot: {currentUser.username}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <a className="dropdown-item" href="#">
                        Profil
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" onClick={() => handleLogout()}>
                        Odjava
                      </a>
                    </li>
                  </ul>
                </>
              ) : (
                <a
                  className="nav-link"
                  onClick={() => handleNavigate("/login")}
                >
                  Prijavljen kot: N/A
                </a>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
