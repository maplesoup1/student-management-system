export const isTokenValid = (token: string): boolean => {
  try {
    if (!token) return false;
    
    // Decode JWT payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

export const getTokenExpiration = (token: string): Date | null => {
  try {
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

export const getTokenPayload = (token: string): any | null => {
  try {
    if (!token) return null;
    
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Error parsing token payload:', error);
    return null;
  }
};

export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};