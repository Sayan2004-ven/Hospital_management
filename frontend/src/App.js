import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Home from "./Home";
import Create from "./Create";
import Login from "./Login";
import CustomerDetails from "./CustomerDetails";
import UpdateUser from "./UpdateUser";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import HospitalDashboard from "./HospitalDashboard";
import HospitalDetails from "./HospitalDetails";

function App() {
  return (
    // ✅ FIX 6 & 7: Wrap entire app so auth state is available everywhere
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                     element={<Home />} />
          <Route path="/create"               element={<Create />} />
          <Route path="/login"                element={<Login />} />
          <Route path="/customer-details/:id" element={<CustomerDetails />} />
          <Route path="/update/:id"           element={<UpdateUser />} />
          <Route path="/admin-login"          element={<AdminLogin />} />
          <Route path="/admin-dashboard"      element={<AdminDashboard />} />
          <Route path="/hospitals"            element={<HospitalDashboard />} />
          <Route path="/hospital/:id" element={<HospitalDetails />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;