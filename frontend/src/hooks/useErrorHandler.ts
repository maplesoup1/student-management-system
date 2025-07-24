import { useState } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleError = (error: any, fallbackMessage: string) => {
    let errorMessage = fallbackMessage;
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 401) {
      errorMessage = 'Session expired. Please log in again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.response?.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (error.response?.status === 409) {
      errorMessage = 'This action conflicts with existing data.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    console.error('Error:', error);
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccessMessage(null);
  
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setError(null);
    // Auto-clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return { 
    error, 
    successMessage, 
    setError, 
    setSuccessMessage, 
    handleError, 
    clearError, 
    clearSuccess, 
    showSuccess 
  };
};