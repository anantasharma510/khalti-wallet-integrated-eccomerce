# Forgot Password Setup Guide

This guide will help you set up the forgot password functionality in your Ananta Glass application.

## Features Added

1. **Forgot Password Page** (`/forgot-password`) - Users can request a password reset
2. **Reset Password Page** (`/reset-password`) - Users can set a new password using a reset token
3. **Email Integration** - Password reset emails are sent via Gmail SMTP
4. **Security Features** - Reset tokens expire after 1 hour

## Environment Variables Setup

Add the following environment variables to your `.env.local` file:

```env
# Email Configuration (Required for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Existing variables (already configured)
MONGODB_URI=your-mongodb-uri
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

## Gmail Setup Instructions

### Option 1: Using Gmail App Password (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Navigate to Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Ananta Glass" as the name
   - Copy the generated 16-character password
3. **Use the App Password** in your `EMAIL_PASS` environment variable

### Option 2: Using Gmail with Less Secure Apps (Not Recommended)

1. Enable "Less secure app access" in your Google Account settings
2. Use your regular Gmail password in `EMAIL_PASS`

## Database Schema Updates

The user schema has been updated to include reset token fields:

```typescript
interface UserSchema {
  // ... existing fields
  resetToken?: string
  resetTokenExpiry?: Date
}
```

## API Endpoints

### POST `/api/auth/forgot-password`
- **Purpose**: Request a password reset
- **Body**: `{ email: string }`
- **Response**: Success message (doesn't reveal if email exists)

### POST `/api/auth/reset-password`
- **Purpose**: Reset password using token
- **Body**: `{ token: string, password: string }`
- **Response**: Success/error message

## Frontend Pages

### `/forgot-password`
- Clean, user-friendly interface
- Email input form
- Success/error message display
- Link back to login page

### `/reset-password?token=<reset-token>`
- Password and confirm password fields
- Token validation
- Automatic redirect to login after successful reset
- Error handling for invalid/expired tokens

## Security Features

1. **Token Expiration**: Reset tokens expire after 1 hour
2. **Secure Token Generation**: Uses cryptographically secure random tokens
3. **Email Privacy**: Doesn't reveal if an email exists in the system
4. **Password Validation**: Minimum 6 characters required
5. **Token Cleanup**: Reset tokens are removed after successful password reset

## Testing the Functionality

1. **Start your development server**: `npm run dev`
2. **Navigate to login page**: `http://localhost:3000/login`
3. **Click "Forgot password?"** link
4. **Enter your email** and submit
5. **Check your email** for the reset link
6. **Click the reset link** and set a new password

## Troubleshooting

### Email Not Sending
- Verify your `EMAIL_USER` and `EMAIL_PASS` are correct
- Check if you're using an App Password (recommended)
- Ensure your Gmail account has 2FA enabled if using App Password

### Reset Link Not Working
- Check if the token has expired (1 hour limit)
- Verify the `NEXTAUTH_URL` environment variable is correct
- Ensure the reset token is being passed correctly in the URL

### Database Issues
- Run the database initialization script: `npm run init-db`
- Check MongoDB connection string
- Verify the users collection exists

## Customization

### Email Template
You can customize the email template in `lib/utils.ts` in the `sendPasswordResetEmail` function.

### Token Expiration
Change the expiration time in `app/api/auth/forgot-password/route.ts`:
```typescript
const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
```

### Email Provider
To use a different email provider, update the transporter configuration in `lib/utils.ts`.

## Support

If you encounter any issues, check the browser console and server logs for error messages. The application includes comprehensive error handling and user feedback. 