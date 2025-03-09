import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import Login from "./Login";
import OrderPage from './Orders';
import OrderForm from "./Vnos";
import Header from "./Header";
import ArchivePage from './ArchivePage';
import OrderTypePage from './OrderTypePage';
import Edit from './Edit';

function App() {
  return (
    <Router>
      <MainContent />
    </Router>
  );
}

function MainContent() {
  const location = useLocation(); // Get the current route/location
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // This effect checks if the user is logged in based on some condition
  useEffect(() => {
    // Replace with actual authentication check (e.g., checking localStorage, token, etc.)
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const shouldRenderHeader = location.pathname !== "/login"; // Only show Header on non-login pages

  return (
    <div>
      {shouldRenderHeader && <Header />} {/* Conditionally render Header */}
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />

        {/* Protected Routes */}
        <Route 
          path="/orders" 
          element={isAuthenticated ? <OrderPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/vnos" 
          element={isAuthenticated ? <OrderForm /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/archive/:year" 
          element={isAuthenticated ? <ArchivePage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/orders/:type" 
          element={isAuthenticated ? <OrderTypePage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/orders/edit/:orderId" 
          element={isAuthenticated ? <Edit /> : <Navigate to="/login" />} 
        />
      </Routes>
    </div>
  );
}

export default App;
