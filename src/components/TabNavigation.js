import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../styles/TabNavigation.css';

const TabNavigation = () => {
    return (
        <div className="tab-container">
            <nav className="tab-navigation">
                <NavLink to="home" className={({ isActive }) => isActive ? "tab active" : "tab"}>Home</NavLink>
                <NavLink to="cart" className={({ isActive }) => isActive ? "tab active" : "tab"}>Cart</NavLink>
                <NavLink to="order" className={({ isActive }) => isActive ? "tab active" : "tab"}>Order</NavLink>
                <NavLink to="track" className={({ isActive }) => isActive ? "tab active" : "tab"}>Track</NavLink>
                <NavLink to="profile" className={({ isActive }) => isActive ? "tab active" : "tab"}>Profile</NavLink>
            </nav>
            <div className="tab-content">
                <Outlet />
            </div>
        </div>
    );
};

export default TabNavigation;
