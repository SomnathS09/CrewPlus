// Generate a session ID for the user
export const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Format price in INR
export const formatPrice = (price) => {
  return `₹${price.toFixed(2)}`;
};
