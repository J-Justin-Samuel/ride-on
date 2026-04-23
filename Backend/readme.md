# Ride-On Backend

This is the backend service for the Ride-On application, providing a RESTful API and real-time WebSocket communication for users and captains (drivers).

## 📦 Project Structure

- `app.js` / `server.js`: Main entry points for the Express app and Socket.IO server
- `controllers/`: Route handlers for users, captains, and rides
- `models/`: Mongoose models for users, captains, and blacklisted tokens
- `routes/`: Express route definitions for users, captains, and rides
- `services/`: Business logic and Socket.IO service
- `middlewares/`: Authentication middleware
- `db/`: Database connection logic

## ⚙️ Environment Variables (.env)

Create a `.env` file in the `Backend` directory with the following variables:

```
PORT=4000                # Port for backend server
DB_CONNECT=mongodb://127.0.0.1:27017/rideon   # MongoDB connection string
JWT_SECRET=your_jwt_secret                   # Secret for JWT signing
CLIENT_URL=http://localhost:5173             # Frontend URL for CORS
```

**Note:** Never commit your real `.env` file to version control. Use `.env.example` for sharing variable names.

## 🔌 Real-Time Communication (Socket.IO)

- Passengers and drivers connect via Socket.IO for live ride requests, driver location updates, and ride status.
- Socket events:
  - `requestRide`: Passenger requests a ride (notifies nearby drivers)
  - `acceptRide`: Driver accepts a ride (notifies passenger)
  - `driverLiveLocation`: Driver streams live location to passenger
  - `cancelRide`, `completeRide`: Ride status updates
  - `noDriversAvailable`, `rideTaken`, `rideCancelled`, etc.
- See `services/socket.service.js` for all event details and debug logging.

## 🗺️ REST API Overview

The backend exposes RESTful endpoints for user and captain registration, login, profile, and ride management. See below for details.

## 🚀 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/) & [Bcrypt](https://www.npmjs.com/package/bcrypt)
- **Real-time Communication**: [Socket.IO](https://socket.io/)
- **Validation**: [express-validator](https://express-validator.github.io/docs/)

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- MongoDB instance (local or Atlas)

### Installation

1. Navigate to the backend directory:

   ```bash
   cd Backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the `Backend` directory containing your variables such as `PORT`, `MONGO_URI`, and `JWT_SECRET`.

4. Start the server:
   ```bash
   node server.js
   ```

---

## 📚 API Documentation

# Users API — /users/register

Description

- Registers a new user and returns a JWT token and the created user (excluding the password).

Endpoint

- **Method:** POST
- **URL:** `/users/register`

Request Body (JSON)

- `fullname` (object) — required
  - `firstname` (string) — required, min length 3
  - `lastname` (string) — optional, min length 3 if provided
- `email` (string) — required, must be a valid email
- `password` (string) — required, min length 6

Validation Rules

- `email` must be a valid email format.
- `fullname.firstname` minimum 3 characters.
- `password` minimum 6 characters.

Responses

- 201 Created
  - Description: User created successfully.
  - Body: `{ token: string, user: object }` — `user` contains user fields except `password`.

- 400 Bad Request
  - Description: Validation failed.
  - Body: `{ errors: [ ...validationErrors ] }`

- 409 Conflict
  - Description: Email already registered / user already exists.
  - Body: `{ message: "User already exists" }` or `{ message: "Email already registered" }`

- 500 Internal Server Error
  - Description: Unexpected server error.
  - Body: `{ message: string }

Example Request (curl)

```
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": { "firstname": "Jane", "lastname": "Doe" },
    "email": "jane.doe@example.com",
    "password": "s3cr3tpass"
  }'
```

Example Success Response (201)

```
{
  "token": "<jwt-token>",
  "user": {
    "_id": "642...",
    "fullname": { "firstname": "Jane", "lastname": "Doe" },
    "email": "jane.doe@example.com",
    "socketId": null
  }
}
```

Notes

- The response `user` object omits the `password` field (schema sets `select: false`).
- Duplicate email attempts return 409 (Mongo duplicate key or explicit check).

---

# Users API — /users/login

Description

- Authenticates an existing user and returns a JWT token and the user object (excluding the password).

Endpoint

- **Method:** POST
- **URL:** `/users/login`

Request Body (JSON)

- `email` (string) — required, must be a valid email
- `password` (string) — required, min length 6

Validation Rules

- `email` must be a valid email format.
- `password` minimum 6 characters.

Responses

- 200 OK
  - Description: User authenticated successfully.
  - Body: `{ token: string, user: object }` — `user` contains user fields except `password`.

- 400 Bad Request
  - Description: Validation failed.
  - Body: `{ errors: [ ...validationErrors ] }`

- 401 Unauthorized
  - Description: Invalid email or password.
  - Body: `{ message: "Invalid email or password" }`

- 500 Internal Server Error
  - Description: Unexpected server error.
  - Body: `{ message: string }`

Example Request (curl)

```
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.doe@example.com",
    "password": "s3cr3tpass"
  }'
```

Example Success Response (200)

```
{
  "token": "<jwt-token>",
  "user": {
    "_id": "642...",
    "fullname": { "firstname": "Jane", "lastname": "Doe" },
    "email": "jane.doe@example.com",
    "socketId": null
  }
}
```

Example Failure Response (401)

```
{
  "message": "Invalid email or password"
}
```

Notes

- Returns 401 if email does not exist or password is incorrect.
- The response `user` object omits the `password` field.

---

# Users API — /users/profile

Description

- Returns the authenticated user's profile. Requires a valid JWT (sent as cookie `token` or `Authorization: Bearer <token>` header).

Endpoint

- **Method:** GET
- **URL:** `/users/profile`

Authentication

- Requires authentication: the request must include a valid JWT. The server middleware `authUser` populates `req.user`.

Responses

- 200 OK
  - Description: Returns the authenticated user's profile.
  - Body: `{ user: object }` — `user` contains user fields excluding `password`.

- 401 Unauthorized
  - Description: Missing or invalid token.
  - Body: `{ message: string }`

Example Request (curl)

```
curl -X GET http://localhost:3000/users/profile \
  -H "Cookie: token=<jwt-token>"
```

Example Success Response (200)

```
{
  "user": {
    "_id": "642...",
    "fullname": { "firstname": "Jane", "lastname": "Doe" },
    "email": "jane.doe@example.com",
    "socketId": null
  }
}
```

---

# Users API — /users/logout

Description

- Logs out the authenticated user by clearing the `token` cookie and adding the token to a server-side blacklist to prevent reuse.

Endpoint

- **Method:** GET
- **URL:** `/users/logout`

Authentication

- Requires authentication: the request must include a valid JWT (sent as cookie `token` or `Authorization: Bearer <token>` header).

Behavior

- Clears the `token` cookie from the client.
- Reads the token from `req.cookies.token` or the `Authorization` header and saves it to the `blacklistTokens` collection so it cannot be reused.

Responses

- 200 OK
  - Description: Logged out successfully.
  - Body: `{ message: "Logged out successfully" }`

- 401 Unauthorized
  - Description: Missing or invalid token.
  - Body: `{ message: string }`

Example Request (curl)

```
curl -X GET http://localhost:3000/users/logout \
  -H "Cookie: token=<jwt-token>"
```

Example Success Response (200)

```
{
  "message": "Logged out successfully"
}
```

# Captain API — /captains/register

## Description

- Registers a new captain and creates a captain account with vehicle details.

---

## Endpoint

- **Method:** POST
- **URL:** `/captains/register`

---

## Request Body (JSON)

- `fullName` (object) — required
  - `firstName` (string) — required, min length 3
  - `lastName` (string) — required, min length 3

- `email` (string) — required, must be a valid email

- `password` (string) — required, min length 6

- `vehicle` (object) — required
  - `color` (string) — required
  - `plate` (string) — required, min length 3
  - `capacity` (number) — required, minimum 1
  - `vehicleType` (string) — required, must be one of: `"car"`, `"motorcycle"`, `"auto"`

---

## Validation Rules

- `fullName.firstName` minimum 3 characters.
- `fullName.lastName` minimum 3 characters.
- `email` must be valid email format.
- `password` minimum 6 characters.
- `vehicle.plate` minimum 3 characters.
- `vehicle.capacity` must be an integer ≥ 1.
- `vehicle.vehicleType` must be `"car"`, `"motorcycle"` or `"auto"`.
- All required fields must be provided or the service throws `"All fields are required"`.

---

## Responses

### 201 Created

- **Description:** Captain created successfully.
- **Body:** `{ captain: object }`

Example:

```json
{
  "captain": {
    "_id": "65f...",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john.doe@example.com",
    "vehicle": {
      "color": "Black",
      "plate": "KA01AB1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }
}
```

---

### 400 Bad Request

- **Description:** Validation failed.
- **Body:** `{ errors: [ ...validationErrors ] }`

Example:

```json
{
  "errors": [
    {
      "msg": "Password must be at least 6 characters long"
    }
  ]
}
```

---

### 409 Conflict

- **Description:** Captain already exists (duplicate email).
- **Body:** `{ message: "Captain already exists" }`

---

### 500 Internal Server Error

- **Description:** Unexpected server error.
- **Body:**

```json
{
  "message": "Internal server error"
}
```

---

## Example Request (curl)

```bash
curl -X POST http://localhost:3000/captains/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john.doe@example.com",
    "password": "secret123",
    "vehicle": {
      "color": "Black",
      "plate": "KA01AB1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }'
```

---

## Notes

- Password should be hashed before saving (recommended: bcrypt).
- Duplicate email attempts should return 409.
- Vehicle details are embedded inside the captain document.

# Captain API

This module handles captain authentication and profile management.

Base URL:

```
http://localhost:3000/captains
```

---

# 1. Register Captain — /captains/register

## Description

Registers a new captain and returns a JWT token along with the created captain (excluding password).

## Endpoint

- **Method:** POST
- **URL:** `/captains/register`

## Request Body (JSON)

- `fullName` (object) — required
  - `firstName` (string) — required, min length 3
  - `lastName` (string) — required, min length 3

- `email` (string) — required, must be valid email

- `password` (string) — required, min length 6

- `vehicle` (object) — required
  - `color` (string) — required
  - `plate` (string) — required, min length 3
  - `capacity` (number) — required, integer ≥ 1
  - `vehicleType` (string) — required, must be one of: `"car"`, `"motorcycle"`, `"auto"`

## Validation Rules

- First and last name minimum 3 characters.
- Email must be valid.
- Password minimum 6 characters.
- Vehicle plate minimum 3 characters.
- Vehicle capacity must be integer ≥ 1.
- Vehicle type must be `"car"`, `"motorcycle"` or `"auto"`.

## Responses

### 201 Created

```json
{
  "captain": {
    "_id": "65f...",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john@example.com",
    "vehicle": {
      "color": "Black",
      "plate": "KA01AB1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  },
  "token": "<jwt-token>"
}
```

### 400 Bad Request

```json
{
  "errors": [ ...validationErrors ]
}
```

OR

```json
{
  "message": "Captain already exists"
}
```

---

# 2. Login Captain — /captains/login

## Description

Authenticates a captain and returns a JWT token.

## Endpoint

- **Method:** POST
- **URL:** `/captains/login`

## Request Body (JSON)

- `email` (string) — required
- `password` (string) — required, min length 6

## Validation Rules

- Email must be valid.
- Password minimum 6 characters.

## Responses

### 200 OK

```json
{
  "token": "<jwt-token>",
  "captain": {
    "_id": "65f...",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john@example.com",
    "vehicle": {
      "color": "Black",
      "plate": "KA01AB1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }
}
```

### 401 Unauthorized

```json
{
  "message": "Invalid email or password"
}
```

### 400 Bad Request

```json
{
  "errors": [ ...validationErrors ]
}
```

---

# 3. Get Captain Profile — /captains/profile

## Description

Returns the authenticated captain’s profile.

## Endpoint

- **Method:** GET
- **URL:** `/captains/profile`

## Authentication

- Requires valid JWT.
- Token must be sent:
  - As cookie: `token`
  - OR header: `Authorization: Bearer <token>`

## Response

### 200 OK

```json
{
  "captain": {
    "_id": "65f...",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john@example.com",
    "vehicle": {
      "color": "Black",
      "plate": "KA01AB1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }
}
```

### 401 Unauthorized

```json
{
  "message": "Unauthorized"
}
```

---

# 4. Logout Captain — /captains/logout

## Description

Logs out the authenticated captain.

- Clears the `token` cookie.
- Adds the token to a blacklist collection to prevent reuse.

## Endpoint

- **Method:** GET
- **URL:** `/captains/logout`

## Authentication

- Requires valid JWT.

## Response

### 200 OK

```json
{
  "message": "Logout successfull"
}
```

### 401 Unauthorized

```json
{
  "message": "Unauthorized"
}
```

---

# Notes

- Password is hashed before saving.
- JWT is generated using `generateAuthToken()` method.
- Logout invalidates token using a blacklist collection.
- Protected routes use `authMiddleware.authCaptain`.
- Password field is excluded from queries unless explicitly selected.
