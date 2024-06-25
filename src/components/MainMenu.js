import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import lottie from 'lottie-web';
import '../styles/MainMenu.css';
import onlineOrderAnimation from '../assets/onlineorder.json';

const MainMenu = () => {
    const navigate = useNavigate();

    useEffect(() => {
        lottie.loadAnimation({
            container: document.getElementById('lottie-animation'), // Required
            animationData: onlineOrderAnimation, // Path to the animation JSON file
            renderer: 'svg', // Renderer type (svg, canvas, html)
            loop: true, // Should it loop
            autoplay: true, // Should it start automatically
        });
    }, []);

    const signInWithEmail = () => {
        navigate('/chooseone?auth=login');
    };

    const signUp = () => {
        navigate('/chooseone?auth=signup');
    };

    return (
        <div className="container">
            <img src="assets/pic18.png" className="background-image" alt="Background" />
            <div className="menu">
                <h1>Welcome To NightBytes!</h1>
                <div id="lottie-animation"></div>
                <button className="btn red" onClick={signInWithEmail}>SignIn with Email</button>
                <button className="btn blue" style={{ display: 'none' }} onClick={signInWithEmail}>SignIn with Phone</button>
                <div className="divider">
                    <hr className="line" />
                    <span>OR</span>
                    <hr className="line" />
                </div>
                <button className="btn default" onClick={signUp}>SignUp</button>
            </div>
        </div>
    );
};

export default MainMenu;
