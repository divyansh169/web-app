import React from 'react';
import '../styles/ForgotPassword.css';
import backgroundImage from '../assets/loginbackground.jpg';

const ForgotPassword = () => {
    return (
        <div 
            className="container" 
            style={{ 
                background: `url(${backgroundImage}) no-repeat center center fixed`,
                backgroundSize: 'cover'
            }}
        >
            <div className="forgot-password-form">
                <h2>Forgot Password</h2>
                <div className="input-field">
                    <input type="email" placeholder="Email id" />
                </div>
                <div className="actions">
                    <button className="btn">Reset</button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
