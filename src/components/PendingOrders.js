import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import '../styles/PendingOrders.css';

const PendingOrders = () => {
    const [pendingOrders, setPendingOrders] = useState([]);

    useEffect(() => {
        const fetchPendingOrders = async (userId) => {
            const db = getDatabase();
            const pendingOrdersRef = ref(db, `CustomerPendingOrders/${userId}`);

            try {
                const snapshot = await get(pendingOrdersRef);

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const ordersList = Object.keys(data).map(orderId => ({
                        orderId,
                        ...data[orderId]
                    }));
                    setPendingOrders(ordersList);
                }
            } catch (error) {
                console.error("Error fetching pending orders:", error);
            }
        };

        const auth = getAuth();
        auth.onAuthStateChanged((user) => {
            if (user) {
                fetchPendingOrders(user.uid);
            }
        });
    }, []);

    return (
        <div className="pending-orders-container">
            {pendingOrders.length > 0 ? (
                pendingOrders.map((order) => (
                    <OrderCard key={order.orderId} order={order} />
                ))
            ) : (
                <p>No pending orders</p>
            )}
        </div>
    );
};

const OrderCard = ({ order }) => (
    <div className="order-card">
        <div className="order-details">
            {order.Dishes && Object.values(order.Dishes).map((dish, index) => (
                <div key={index} className="dish-details">
                    <p className="dish-name"><strong>{dish.DishName}</strong></p>
                    <div className="dish-info">
                        <p>Price: ₹{dish.Price} x {dish.DishQuantity}</p>
                        <p className="dish-total">Total: ₹{dish.TotalPrice}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default PendingOrders;
