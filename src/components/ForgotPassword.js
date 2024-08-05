import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ForgotPassword.css';
import backgroundImage from '../assets/loginbackground.jpg';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../firebase';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset email sent!');
        } catch (error) {
            setMessage(error.message);
        }
    };

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
                <form onSubmit={handleResetPassword}>
                    <div className="input-field">
                        <input 
                            type="email" 
                            placeholder="Email id" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="actions">
                        <button type="submit" className="btn">Reset</button>
                    </div>
                    {message && <p className="message">{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
