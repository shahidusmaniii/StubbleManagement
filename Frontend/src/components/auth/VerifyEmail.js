import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');
            const type = searchParams.get('type');

            if (!token || !type) {
                setError('Invalid verification link');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Use the full URL to ensure the request goes to the backend
                const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                const res = await axios.get(`${baseURL}/api/auth/verify-email?token=${token}&type=${type}`);
                console.log('Verification response:', res.data);
                setMessage(res.data.msg);
                
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (err) {
                console.error('Verification error:', err);
                setError(err.response?.data?.msg || 'Verification failed');
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="auth-container">
            <h1 className="text-primary mb-4">Email Verification</h1>
            {loading && <div className="text-center"><div className="spinner-border text-primary" role="status"></div></div>}
            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">
                <p>{message}</p>
                <p>Redirecting to login page...</p>
            </div>}
        </div>
    );
};

export default VerifyEmail; 