import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import backgroundImage from '../assets/pic5.jpg';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login successful!");
            navigate('/tabs/home');
        } catch (error) {
            alert("Login failed: " + error.message);
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    const handleSignUp = () => {
        navigate('/register');
    };

    return (
        <div 
            className="container" 
            style={{ 
                background: `url(${backgroundImage}) no-repeat center center fixed`,
                backgroundSize: 'cover'
            }}
        >
            <div className="login-form">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="input-field">
                        <input 
                            type="email" 
                            placeholder="Email id" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="input-field password-field">
                        <input 
                            type={passwordVisible ? "text" : "password"} 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                        <span 
                            className="toggle-password" 
                            onClick={togglePasswordVisibility}
                        >
                            {passwordVisible ? "👁️" : "🙈"}
                        </span>
                    </div>
                    <div className="actions">
                        <button type="submit" className="btn">Login</button>
                        <p onClick={handleForgotPassword} className="forgot-password">Forgot Password?</p>
                        <p onClick={handleSignUp} className="sign-up">Do not have an account? SignUp</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
