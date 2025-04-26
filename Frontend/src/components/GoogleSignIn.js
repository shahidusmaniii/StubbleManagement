import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GoogleSignIn = ({ onSuccess, onError, userType = 'Farmer' }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setIsLoading(true);
            console.log('Google credential received, length:', 
                credentialResponse.credential ? credentialResponse.credential.length : 0);
            
            if (!credentialResponse.credential) {
                throw new Error('No credential received from Google');
            }

            // Use the full Google auth endpoint with proper error handling
            console.log(`Authenticating with Google as ${userType}...`);
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/auth/google`, 
                { 
                    credential: credentialResponse.credential,
                    userType 
                }
            );
            
            console.log('Server response:', {
                success: true,
                userId: response.data.user?.id,
                userName: response.data.user?.name,
                userEmail: response.data.user?.email,
                userType: response.data.user?.type,
                hasToken: !!response.data.token
            });
            
            if (onSuccess) {
                onSuccess(response.data);
            }
        } catch (error) {
            console.error('Google Sign-In error:', error);
            let errorMessage = 'Google Sign-In failed';
            
            if (error.response) {
                // Access msg property safely using optional chaining
                errorMessage = error.response?.data?.msg || error.response?.data?.error || errorMessage;
                console.error('Server error details:', error.response.data);
                
                // Provide more detailed error info
                if (error.response.status === 400) {
                    errorMessage = `${errorMessage} - Please try a different login method`;
                } else if (error.response.status === 500) {
                    errorMessage = `Server error - Please try again later`;
                }
            } else if (error.request) {
                errorMessage = 'No response from server - Please check your internet connection';
                console.error('No response received:', error.request);
            } else {
                errorMessage = error.message || errorMessage;
                console.error('Error setting up request:', error);
            }
            
            if (onError) {
                // Pass a string, not an object
                onError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        console.error('Google Sign-In failed in the Google component');
        if (onError) {
            onError('Google Sign-In was cancelled or failed. Please try again.');
        }
    };

    return (
        <div>
            {isLoading && <div className="text-center my-2">
                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                <span className="ms-2">Authenticating with Google...</span>
            </div>}
            
            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "512824280172-9965tinrcgi43ju4ptvbjso8qe5pgv80.apps.googleusercontent.com"}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    cancel_on_tap_outside={true}
                    context="signin"
                    type="standard"
                    theme="filled_blue"
                    text="signin_with"
                    shape="rectangular"
                    logo_alignment="left"
                    width="250px"
                />
            </GoogleOAuthProvider>
        </div>
    );
};

export default GoogleSignIn; 