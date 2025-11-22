# Firebase Credentials Setup - Step by Step

## Current Status
❌ Firebase Admin SDK credentials are NOT configured
⚠️ Google authentication will NOT work until credentials are added

## What You Need To Do

### Step 1: Get Firebase Service Account JSON File

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **eventhub-d4844**
3. Click the **gear icon** (⚙️) → **Project Settings**
4. Go to the **Service Accounts** tab
5. Click the blue button **"Generate New Private Key"**
6. A JSON file will download - **SAVE IT SECURELY**

### Step 2: Open the Downloaded JSON File

The file will look like this:
```json
{
  "type": "service_account",
  "project_id": "eventhub-d4844",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@eventhub-d4844.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### Step 3: Add Credentials to `backend/.env`

Open `backend/.env` and add these three lines:

```
FIREBASE_PROJECT_ID=eventhub-d4844
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@eventhub-d4844.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n
```

### Step 4: How to Extract Values from JSON

**For FIREBASE_PROJECT_ID:**
- Find the line: `"project_id": "eventhub-d4844"`
- Copy: `eventhub-d4844`

**For FIREBASE_CLIENT_EMAIL:**
- Find the line: `"client_email": "firebase-adminsdk-xxxxx@eventhub-d4844.iam.gserviceaccount.com"`
- Copy the entire email address

**For FIREBASE_PRIVATE_KEY:**
- Find the line: `"private_key": "-----BEGIN PRIVATE KEY-----\n..."`
- Copy the ENTIRE value including the quotes
- It will look like: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n`

### Step 5: Verify the Format

Your `backend/.env` should look like:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
EMAIL_USER=...
EMAIL_PASSWORD=...
FIREBASE_PROJECT_ID=eventhub-d4844
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@eventhub-d4844.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n
```

### Step 6: Restart Backend Server

After adding the credentials:

```bash
cd backend
npm start
```

You should see:
```
✅ Firebase Admin SDK initialized
🚀 Server is running on port 5050
```

### Step 7: Test Google Authentication

1. Refresh your browser (Ctrl+R or Cmd+R)
2. Click "Continue with Google" (users) or "Sign In with Google" (organizers)
3. Select your Google account
4. Should now successfully authenticate! ✅

## Troubleshooting

### Error: "Firebase Admin SDK credentials not found in .env"
- ✅ You're seeing this message - it's expected
- Add the three environment variables as shown above
- Restart the backend

### Error: "Invalid Firebase token"
- Check that FIREBASE_PRIVATE_KEY is complete and includes the full key
- Verify no extra spaces or quotes
- Restart backend after making changes

### Error: "Firebase Admin SDK initialization error"
- Check that all three credentials are present
- Verify the format matches the JSON file exactly
- Make sure the private key includes `\n` for line breaks

## Security Notes

⚠️ **IMPORTANT:**
- Never commit the `.env` file to Git (it's in .gitignore)
- Never share your Firebase credentials
- The private key is sensitive - keep it secure
- Rotate keys periodically in Firebase Console

## What Happens After Setup

Once credentials are added:
1. Firebase Admin SDK will initialize on backend startup
2. Google authentication will work for users
3. Google authentication will work for organizers
4. Password reset via Firebase will work
5. All authentication flows will be functional

## Questions?

If you have issues:
1. Check backend console for error messages
2. Verify all three environment variables are set
3. Make sure the private key format is correct (includes `\n`)
4. Restart the backend after making changes
