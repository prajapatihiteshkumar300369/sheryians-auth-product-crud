# Sheryians Coding School - Authentication & Product CRUD

Full-stack assignment using:

- Node.js
- Express
- MongoDB + Mongoose
- JWT access + refresh tokens
- bcryptjs
- express-validator
- React + Vite
- Axios

## Project structure

```text
sheryians-auth-product-crud/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── validators/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── .env.example
│   └── package.json
└── README.md
```

## Backend setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` (ready-made `.env` files are already included for local use) and set:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=long_random_secret
REFRESH_TOKEN_SECRET=another_long_random_secret
CLIENT_URL=http://localhost:5173
```

Start:

```bash
npm run dev
```

API:

```text
http://localhost:5000
```

## Frontend setup

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`.

```env
VITE_API_URL=http://localhost:5000/api
```

Start:

```bash
npm run dev
```

Production build: `npm run build`

Frontend:

```text
http://localhost:5173
```

## API endpoints

### Auth

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh-token` | Refresh cookie |
| POST | `/api/auth/logout` | Access token |
| GET | `/api/auth/me` | Access token |

### Products

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/products` | Authenticated |
| GET | `/api/products` | Public |
| GET | `/api/products/:id` | Public |
| PUT | `/api/products/:id` | Authenticated |
| DELETE | `/api/products/:id` | Authenticated |

## Authentication flow

1. Register creates a user with a bcrypt-hashed password.
2. Login verifies the password.
3. Login returns a short-lived access token in JSON.
4. Login also sets a long-lived refresh token in an httpOnly cookie.
5. Only a SHA-256 hash of the refresh token is stored in MongoDB.
6. Protected routes require `Authorization: Bearer <accessToken>`.
7. When the access token expires, the frontend calls `/api/auth/refresh-token`.
8. The refresh token is verified and compared with the stored hash.
9. Refresh-token rotation creates a new refresh token and invalidates the previous one.
10. Logout removes the stored refresh-token hash and clears the cookie.

## Important security note

In local development, `secure` is false because localhost normally uses HTTP.

In production, set:

```env
NODE_ENV=production
```

The refresh cookie then uses:

- `httpOnly: true`
- `secure: true`
- `sameSite: none`

Use HTTPS in production.

## Example register request

```json
{
  "name": "Hitesh",
  "email": "hitesh@example.com",
  "password": "secret123",
  "confirmPassword": "secret123"
}
```

## Example login response

```json
{
  "message": "Login successful",
  "accessToken": "JWT_ACCESS_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "Hitesh",
    "email": "hitesh@example.com"
  }
}
```

The refresh token is not exposed in JSON.

## Example product

```json
{
  "name": "Wireless Headphones",
  "description": "Bluetooth over-ear headphones",
  "price": 2499,
  "category": "Electronics",
  "stock": 20,
  "image": "https://example.com/headphones.jpg"
}
```

## Testing order

1. Register
2. Login
3. Copy access token
4. Call `/api/auth/me` with Bearer token
5. Create product with Bearer token
6. Get all products
7. Get product by ID
8. Update product with Bearer token
9. Delete product with Bearer token
10. Test refresh token
11. Test logout
12. Try protected APIs after logout

## GitHub

Do not commit:

```text
backend/.env
frontend/.env
node_modules/
```

Create `.gitignore` files before pushing.

## Deployment checklist

Backend:
- MongoDB Atlas
- Set all environment variables
- Use HTTPS
- Set `NODE_ENV=production`
- Set `CLIENT_URL` to the deployed frontend URL

Frontend:
- Set `VITE_API_URL` to the deployed backend `/api` URL
- Run `npm run build`

## Assignment explanation

This project intentionally keeps responsibilities separate:

- Routes decide which endpoint is called.
- Validators validate input.
- Middleware handles authentication and validation results.
- Controllers contain business logic.
- Models define MongoDB structure.
- Token utilities handle JWT/cookie/hash operations.
- React context stores authentication state.
- Axios interceptors automatically attach access tokens and refresh expired access tokens.
