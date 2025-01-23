import React, { useState } from 'react';
import './Login.css';
import assets from '../../assets/assets';

const Login = () => {
    const [currState, setCurrState] = useState('Sign Up');

    return (
        <div className="login">
            <img src={assets.logo_big} alt="Logo" className="login-logo" />
            <form className="login-form">
                <h2>{currState}</h2>
                {currState === 'Sign Up' && (
                    <input type="text" placeholder="Username" className="form-input" required />
                )}
                <input type="email" placeholder="Email Address" className="form-input" required />
                <input type="password" placeholder="Password" className="form-input" required />
                <button type="submit">{currState === "Sign Up" ? "Create account" : "Login now"}</button>
                <div className="login-term">
                    <input type="checkbox" id="terms" />
                    <label htmlFor="terms">
                        Agree to the <span>Terms</span>, <span>Data Policy</span>, and <span>Cookies Policy</span>
                    </label>
                </div>
                <div className="login-forgot">
                    {currState === 'Login' ? (
                        <p className="login-toggle">
                            Don’t have an account?{' '}
                            <span onClick={() => setCurrState('Sign Up')}>Sign Up Here</span>
                        </p>
                    ) : (
                        <p className="login-toggle">
                            Already have an account?{' '}
                            <span onClick={() => setCurrState('Login')}>Login Here</span>
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Login;
