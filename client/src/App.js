import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Login from "./Login";
import OrderPage from './Orders';
import OrderForm from "./Vnos";
import Header from "./Header";
import ArchivePage from './ArchivePage';
import OrderTypePage from './OrderTypePage';
import Edit from './Edit'
function App() {
  return (
    <Router>
      <MainContent />
    </Router>
  );
}

function MainContent() {
  const location = useLocation(); // Get the current route/location
  const shouldRenderHeader = location.pathname !== "/login"; // Only show Header on non-login pages

  return (
    <div>
      {shouldRenderHeader && <Header />} {/* Conditionally render Header */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/vnos" element={<OrderForm />} />
        <Route path="/archive/:year" element={<ArchivePage />} />
        <Route path="/orders/:type" element={<OrderTypePage />} />  {/* New route */}
        <Route path="/orders/edit/:orderId" element={<Edit />} />

      </Routes>
    </div>
  );
}

export default App;
