import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children, user, role }) {
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (user.role !== role) {
    return <Navigate to="/" />;
  }
  return children;
}

export default PrivateRoute;
