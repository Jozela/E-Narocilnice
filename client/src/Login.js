import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');  // Reset any previous error message
    
        try {
            // Send POST request to Flask backend for login
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',  // Include cookies for session
                body: JSON.stringify({ username, password }),
            });
    
            const data = await response.json();
            setLoading(false);
    
            if (response.ok) {
                // Successful login
                console.log("Login successful:", data);
                localStorage.setItem('username', username);  // Save username to localStorage
                window.location.href = 'http://localhost:3000/orders';
            } else {
                // Handle invalid login or server error
                setError(data.message || 'Invalid login. Please check your credentials.');
            }
        } catch (error) {
            setLoading(false);
            console.error('Login failed:', error);
            setError('An error occurred. Please try again later.');
        }
    };
    

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <h2 className="text-center">Login</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary w-100" 
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
