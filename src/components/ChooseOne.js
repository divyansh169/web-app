import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import lottie from 'lottie-web';
import '../styles/ChooseOne.css';
import orderFoodAnimation from '../assets/orderfood.json';

const ChooseOne = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const auth = queryParams.get('auth');

    useEffect(() => {
        lottie.loadAnimation({
            container: document.getElementById('lottie-animation'), // Required
            animationData: orderFoodAnimation, // Path to the animation JSON file
            renderer: 'svg', // Renderer type (svg, canvas, html)
            loop: true, // Should it loop
            autoplay: true, // Should it start automatically
        });
    }, []);

    const connectAsSeller = () => {
        // Navigate to seller-specific page or logic
    };

    const connectAsCustomer = () => {
        if (auth === 'login') {
            navigate('/login');
        } else if (auth === 'signup') {
            navigate('/register');
        }
    };

    const connectAsDelivery = () => {
        // Navigate to delivery-specific page or logic
    };

    return (
        <div className="container">
            <div className="menu">
                <div id="lottie-animation"></div>
                <p>Find Various Products around you and order them easily, get them delivered to your doorsteps or TakeAway or Book/Pre-book your Order!</p>
                <button className="btn" onClick={connectAsSeller}>Connect as Seller</button>
                <button className="btn" onClick={connectAsCustomer}>Connect as Customer</button>
                <button className="btn" onClick={connectAsDelivery}>Connect as Delivery person</button>
            </div>
        </div>
    );
};

export default ChooseOne;
