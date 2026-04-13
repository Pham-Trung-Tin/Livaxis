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
