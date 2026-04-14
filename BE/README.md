# Livaxis Backend

## Auth Scope

Implemented auth flows:
- Signup
- Signin
- Signout
- Get current user profile
- Refresh access token
- Forgot password
- Reset password
- Verify email

Token strategy:
- Access token + refresh token
- Both stored in httpOnly cookies

Role baseline:
- user
- admin

## Setup

1. Copy `.env.sample` to `.env`
2. Install dependencies:
   - `npm install`
3. Run dev server:
   - `npm run dev`

Google OAuth (Passport) environment variables:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL` (example: `http://localhost:5000/api/auth/google/callback`)
- `CLIENT_URL` (example: `http://localhost:5173`)

## API Endpoints

Base URL: `http://localhost:5000/api`

- `POST /auth/signup`
- `POST /auth/signin`
- `POST /auth/signout`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/verify-email?token=...`
- `GET /auth/google`
- `GET /auth/google/callback`

Error format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {}
  }
}
```

## Testing

Run tests:
- `npm run test`

Minimum coverage implemented:
- signup endpoint
- signin endpoint
- auth middleware protection
