import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Spinner from '../common/Spinner';
const PrivateRoute = ({ roles }) => {
const { isAuthenticated, user, loading } = useContext(AuthContext);
if (loading) {
    return <Spinner />;
}

if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
}

if (roles && !roles.includes(user.role)) {
    // Redirect to their own dashboard if they try to access a wrong page
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
}

return <Outlet />;
};

export default PrivateRoute;