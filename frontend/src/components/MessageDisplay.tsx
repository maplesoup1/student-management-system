import React from 'react';

interface MessageDisplayProps {
  error?: string | null;
  success?: string | null;
  onClearError?: () => void;
  onClearSuccess?: () => void;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ 
  error, 
  success, 
  onClearError, 
  onClearSuccess 
}) => {
  if (!error && !success) return null;

  return (
    <div style={{ marginBottom: '1rem' }}>
      {error && (
        <div 
          className="error-message" 
          style={{ 
            color: '#721c24',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            marginBottom: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{error}</span>
          {onClearError && (
            <button 
              onClick={onClearError}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '1.2rem', 
                cursor: 'pointer',
                color: '#721c24'
              }}
              aria-label="Close error message"
            >
              ×
            </button>
          )}
        </div>
      )}
      
      {success && (
        <div 
          className="success-message" 
          style={{ 
            color: '#155724',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            marginBottom: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{success}</span>
          {onClearSuccess && (
            <button 
              onClick={onClearSuccess}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '1.2rem', 
                cursor: 'pointer',
                color: '#155724'
              }}
              aria-label="Close success message"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageDisplay;