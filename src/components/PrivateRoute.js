// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Adjust the path accordingly

const PrivateRoute = ({ children }) => {
    const { user } = useUser(); // Access user context

    // Redirect to SignIn if not authenticated
    return user ? children : <Navigate to="/signin" replace />;
};

export default PrivateRoute;
