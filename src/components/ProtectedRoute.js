// src/components/ProtectedRoute.js

import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useUser } from './UserContext'; // Adjust the import path as necessary

const ProtectedRoute = ({ component: Component, ...rest }) => {
    const { user } = useUser(); // Get user from context

    return (
        <Route
            {...rest}
            render={props =>
                user ? (
                    <Component {...props} /> // Render the component if user is authenticated
                ) : (
                    <Redirect to="/signin" /> // Redirect to sign-in if not authenticated
                )
            }
        />
    );
};

export default ProtectedRoute;
