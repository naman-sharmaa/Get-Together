import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  User,
} from "firebase/auth";
import { auth } from "@/config/firebase";

const googleProvider = new GoogleAuthProvider();

// Configure Google provider to always show account selection
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Sign in with Google using Firebase
 * Uses redirect flow which is compatible with COOP headers
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    // Check if we're returning from a redirect
    const redirectResult = await getRedirectResult(auth);
    if (redirectResult) {
      return redirectResult.user;
    }
    
    // Try popup first (for better UX)
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (popupError: any) {
      // If popup fails (likely due to COOP), fall back to redirect
      const errorCode = popupError?.code;
      const errorMessage = popupError?.message || '';
      
      // Check for COOP-related errors
      if (
        errorCode === 'auth/popup-blocked' ||
        errorCode === 'auth/popup-closed-by-user' ||
        errorCode === 'auth/operation-not-supported-in-this-environment' ||
        errorMessage.includes('Cross-Origin') ||
        errorMessage.includes('COOP')
      ) {
        console.warn("Popup blocked or COOP policy active, using redirect flow:", errorMessage);
        await signInWithRedirect(auth, googleProvider);
        // Return a placeholder - actual user will be available after redirect
        throw new Error("Redirecting to Google...");
      }
      
      // Re-throw other errors
      throw popupError;
    }
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    throw new Error(error.message || "Failed to sign in with Google");
  }
};

/**
 * Sign out from Firebase
 */
export const firebaseSignOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Sign out error:", error);
    throw new Error(error.message || "Failed to sign out");
  }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Password reset error:", error);
    throw new Error(error.message || "Failed to send password reset email");
  }
};

/**
 * Verify password reset code
 */
export const verifyResetCode = async (code: string): Promise<string> => {
  try {
    const email = await verifyPasswordResetCode(auth, code);
    return email;
  } catch (error: any) {
    console.error("Verify reset code error:", error);
    throw new Error(error.message || "Invalid or expired reset code");
  }
};

/**
 * Confirm password reset with new password
 */
export const confirmPasswordResetWithCode = async (
  code: string,
  newPassword: string
): Promise<void> => {
  try {
    await confirmPasswordReset(auth, code, newPassword);
  } catch (error: any) {
    console.error("Confirm password reset error:", error);
    throw new Error(error.message || "Failed to reset password");
  }
};

/**
 * Get ID token from Firebase user
 */
export const getFirebaseToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (error: any) {
    console.error("Get token error:", error);
    return null;
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
