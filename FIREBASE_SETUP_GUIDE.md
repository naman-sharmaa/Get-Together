# Firebase Google Authentication Setup Guide

## Overview
This guide explains how to set up Firebase Google Authentication for your EventHub application.

## What Was Implemented

### Backend Changes:
1. **Firebase Admin SDK Integration** (`backend/server.js`)
   - Initializes Firebase Admin SDK for token verification
   
2. **New Authentication Endpoint** (`backend/controllers/authController.js`)
   - `/api/auth/firebase-google-auth` - Handles Firebase Google authentication
   - Verifies Firebase tokens
   - Creates or updates user accounts
   - Returns JWT token for backend authentication

3. **Updated User Model** (`backend/models/User.js`)
   - Added `firebaseUid` field (unique, sparse)
   - Updated `loginMethod` enum to include 'google'
   - Made password field optional (for Google auth users)

4. **Dependencies Added** (`backend/package.json`)
   - `firebase-admin@^12.0.0`

### Frontend Changes:
1. **AuthDialog Component** (`src/components/AuthDialog.tsx`)
   - Added Google Sign In button for users
   - Sends Firebase token to backend
   - Stores JWT token in localStorage

2. **OrganizerAuth Page** (`src/pages/OrganizerAuth.tsx`)
   - Added Google Sign In button for organizers
   - Sends Firebase token to backend with role='organizer'
   - Stores JWT token in localStorage

## Setup Instructions

### Step 1: Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project "eventhub-d4844"
3. Go to **Project Settings** (gear icon)
4. Click on **Service Accounts** tab
5. Click **Generate New Private Key**
6. A JSON file will download - keep it safe!

### Step 2: Add Environment Variables to Backend

Add these to your `backend/.env` file:

```
FIREBASE_PROJECT_ID=eventhub-d4844
FIREBASE_CLIENT_EMAIL=<your-client-email-from-json>
FIREBASE_PRIVATE_KEY=<your-private-key-from-json>
```

**How to extract from the JSON file:**
- Open the downloaded JSON file
- Copy the value of `"project_id"` → `FIREBASE_PROJECT_ID`
- Copy the value of `"client_email"` → `FIREBASE_CLIENT_EMAIL`
- Copy the value of `"private_key"` → `FIREBASE_PRIVATE_KEY`

**Important:** When copying the private key, make sure to include the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

### Step 3: Restart Backend Server

```bash
cd backend
npm install  # Already done, but just in case
npm start
```

### Step 4: Test Google Authentication

1. Open your application in browser
2. Click "Sign In" button
3. Click "Continue with Google" button
4. Select your Google account
5. You should be logged in and redirected to home page

## How It Works

### User Flow:

```
User clicks "Continue with Google"
    ↓
Google popup appears
    ↓
User selects/logs in with Google account
    ↓
Firebase returns ID token
    ↓
Frontend sends token to backend (/api/auth/firebase-google-auth)
    ↓
Backend verifies token using Firebase Admin SDK
    ↓
Backend checks if user exists in database
    ↓
If new user: Create account with Firebase data
If existing user: Verify role matches
    ↓
Backend generates JWT token
    ↓
Frontend stores JWT in localStorage
    ↓
User is logged in and redirected
```

## API Endpoint Details

### POST `/api/auth/firebase-google-auth`

**Request:**
```json
{
  "firebaseToken": "<firebase-id-token>",
  "role": "user" // or "organizer"
}
```

**Response (Success):**
```json
{
  "message": "Firebase authentication successful",
  "token": "<jwt-token>",
  "user": {
    "id": "<user-id>",
    "name": "<user-name>",
    "email": "<user-email>",
    "role": "user",
    "organizationName": null
  }
}
```

**Response (Error):**
```json
{
  "message": "Error message"
}
```

## Troubleshooting

### Issue: "Invalid Firebase token"
**Solution:** 
- Check that FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are correctly set in .env
- Ensure the private key includes the full `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- Restart the backend server after updating .env

### Issue: "This email is already registered as a different role"
**Solution:**
- The email is registered with a different role (user vs organizer)
- Use the appropriate login page for that role
- Or create a new account with a different email

### Issue: User not logging in despite successful Google authentication
**Solution:**
- Check browser console for errors
- Check backend logs for error messages
- Ensure localStorage is not disabled
- Clear browser cache and try again

### Issue: "Failed to authenticate with backend"
**Solution:**
- Check that backend is running on port 5050
- Check CORS settings in backend/server.js
- Verify frontend is making requests to correct URL (/api/auth/firebase-google-auth)

## Security Notes

1. **Private Key Security:**
   - Never commit `.env` file to git
   - Never share your Firebase private key
   - Rotate keys periodically in Firebase Console

2. **Token Verification:**
   - Backend verifies all Firebase tokens before creating/updating users
   - JWT tokens are stored in localStorage (consider using httpOnly cookies for production)

3. **Role Validation:**
   - Backend validates that user role matches the login page used
   - Prevents users from accessing organizer features without proper role

## Next Steps

1. Test Google Sign In for regular users
2. Test Google Sign In for organizers
3. Verify forgot password functionality still works
4. Test OTP login still works
5. Deploy to production with proper environment variables

## Support

For issues or questions:
1. Check Firebase Console for any errors
2. Review backend logs for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure Firebase Admin SDK is properly initialized
