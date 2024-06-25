import React from 'react';
import '../styles/Register.css';

const Register = () => {
    return (
        <div className="container">
            <div className="register-form">
                <h2>Register</h2>
                <div className="input-field">
                    <input type="text" placeholder="First Name" />
                </div>
                <div className="input-field">
                    <input type="text" placeholder="Last Name" />
                </div>
                <div className="input-field">
                    <input type="email" placeholder="Email id" />
                </div>
                <div className="input-field">
                    <input type="text" placeholder="Mobile number" />
                </div>
                <div className="input-field">
                    <input type="password" placeholder="Password" />
                </div>
                <div className="input-field">
                    <input type="password" placeholder="Confirm password" />
                </div>
                <div className="actions">
                    <button className="btn">Register</button>
                </div>
            </div>
        </div>
    );
};

export default Register;
