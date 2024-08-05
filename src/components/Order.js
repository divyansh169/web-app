import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../styles/Order.css';

const Order = () => {
    return (
        <div className="order-container">
            <nav className="order-tab-navigation">
                <NavLink to="pending-orders" className={({ isActive }) => isActive ? "order-tab active" : "order-tab"}>Pending Orders</NavLink>
                <NavLink to="payable-orders" className={({ isActive }) => isActive ? "order-tab active" : "order-tab"}>Payable Orders</NavLink>
            </nav>
            <div className="order-tab-content">
                <Outlet />
            </div>
        </div>
    );
};

export default Order;
