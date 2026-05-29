
/**
 * Mock implementation of WebAuthn for biometric/face recognition login.
 * In a real environment, this would use the browser's navigator.credentials API.
 */

export const webAuthn = {
  /**
   * Checks if the device supports biometric authentication.
   */
  isSupported: async (): Promise<boolean> => {
    // In a real app, we'd check window.PublicKeyCredential
    return true;
  },

  /**
   * Registers a new biometric credential for the user.
   */
  register: async (userId: string, userName: string): Promise<string> => {
    console.log(`Registering biometrics for user: ${userName} (${userId})`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would call navigator.credentials.create()
    // and return a credential ID.
    return `mock_biometric_key_${Date.now()}`;
  },

  /**
   * Authenticates the user using biometrics.
   */
  authenticate: async (userId: string): Promise<boolean> => {
    console.log(`Authenticating biometrics for user ID: ${userId}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would call navigator.credentials.get()
    // For this demo, we'll assume success if a userId is provided.
    return !!userId;
  }
};
