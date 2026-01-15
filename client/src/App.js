import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Login from "./Login";
import OrderPage from './Orders';
import OrderForm from "./Vnos";
import Header from "./Header";
import ArchivePage from './ArchivePage';
import OrderTypePage from './OrderTypePage';
import Edit from './Edit';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  // This effect ensures the app listens to changes in localStorage (e.g., when logging out)
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('authToken'));
    };

    window.addEventListener('storage', checkAuth); // Listens to localStorage changes

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <Router>
      <MainContent isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
    </Router>
  );
}

function MainContent({ isAuthenticated, setIsAuthenticated }) {
  const location = useLocation();
  const shouldRenderHeader = location.pathname !== "/login"; // Don't show header on login page

  return (
    <div>
      {shouldRenderHeader && <Header />}
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />

        <Route path="/orders" element={isAuthenticated ? <OrderPage /> : <Navigate to="/login" />} />
        <Route path="/vnos" element={isAuthenticated ? <OrderForm /> : <Navigate to="/login" />} />
        <Route path="/archive/:year" element={isAuthenticated ? <ArchivePage /> : <Navigate to="/login" />} />
        <Route path="/orders/:type" element={isAuthenticated ? <OrderTypePage /> : <Navigate to="/login" />} />
        <Route path="/orders/edit/:orderId" element={isAuthenticated ? <Edit /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
