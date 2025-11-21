# Postman Testing Guide

Base URL: `http://localhost:3000`

## 1. Health Check (No Auth Required)

**GET** `http://localhost:3000/health`

- No headers needed
- Should return: `{"status": "ok"}`

---

## 2. Authentication

### Login
**POST** `http://localhost:3000/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "OWNER"
  }
}
```

**Note:** Copy the `token` value - you'll need it for authenticated requests!

---

## 3. Car Washes

### Get All Car Washes (No Auth)
**GET** `http://localhost:3000/car-washes`

- No headers needed
- Returns: Array of car washes

### Get Car Wash by ID (No Auth)
**GET** `http://localhost:3000/car-washes/1`

- No headers needed
- Replace `1` with actual car wash ID

### Create Car Wash (Auth Required)
**POST** `http://localhost:3000/car-washes`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (raw JSON):**
```json
{
  "name": "Sparkle Car Wash",
  "address": "123 Main St",
  "city": "New York"
}
```

### Update Car Wash (Auth Required)
**PUT** `http://localhost:3000/car-washes/1`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (raw JSON):**
```json
{
  "name": "Updated Car Wash Name",
  "address": "456 Oak Ave",
  "city": "Los Angeles",
  "active": true
}
```

### Delete Car Wash (Auth Required)
**DELETE** `http://localhost:3000/car-washes/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 4. Services

### Get Services by Car Wash ID (No Auth)
**GET** `http://localhost:3000/car-washes/1/services`

- No headers needed
- Replace `1` with car wash ID

### Get Service by ID (No Auth)
**GET** `http://localhost:3000/car-washes/1/services/1`

- No headers needed
- First `1` = car wash ID, second `1` = service ID

### Create Service (Auth Required)
**POST** `http://localhost:3000/car-washes/1/services`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (raw JSON):**
```json
{
  "name": "Basic Wash",
  "price": 1500,
  "durationMin": 30
}
```

**Note:** `price` is in cents (1500 = $15.00)

### Update Service (Auth Required)
**PUT** `http://localhost:3000/car-washes/1/services/1`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (raw JSON):**
```json
{
  "name": "Premium Wash",
  "price": 2500,
  "durationMin": 45,
  "active": true
}
```

### Delete Service (Auth Required)
**DELETE** `http://localhost:3000/car-washes/1/services/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 5. Bookings

### Get All Bookings (Auth Required)
**GET** `http://localhost:3000/bookings`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Booking by ID (Auth Required)
**GET** `http://localhost:3000/bookings/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Create Booking (No Auth Required)
**POST** `http://localhost:3000/bookings`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "carWashId": 1,
  "serviceId": 1,
  "customerPhone": "+1234567890",
  "date": "2024-12-25T10:00:00Z",
  "status": "PENDING_PAYMENT"
}
```

**Note:** `date` should be in ISO 8601 format

### Update Booking (Auth Required)
**PUT** `http://localhost:3000/bookings/1`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (raw JSON):**
```json
{
  "status": "CONFIRMED",
  "customerPhone": "+1234567890",
  "date": "2024-12-25T11:00:00Z"
}
```

### Delete Booking (Auth Required)
**DELETE** `http://localhost:3000/bookings/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Quick Setup in Postman

1. **Create a new Collection** called "Car Wash API"

2. **Set Collection Variables:**
   - Go to Collection → Variables
   - Add variable: `baseUrl` = `http://localhost:3000`
   - Add variable: `token` = (leave empty, will be set after login)

3. **Use Variables in Requests:**
   - Instead of hardcoding URLs, use: `{{baseUrl}}/auth/login`
   - For auth token, use: `Bearer {{token}}`

4. **Auto-save Token after Login:**
   - In the Login request, go to "Tests" tab
   - Add this script:
   ```javascript
   if (pm.response.code === 200) {
       const jsonData = pm.response.json();
       pm.collectionVariables.set("token", jsonData.token);
   }
   ```

5. **Test Flow:**
   - First: Test `/health` to verify server is running
   - Second: Create a user in database (you'll need to do this manually or via Prisma Studio)
   - Third: Login with `/auth/login` to get token
   - Fourth: Test authenticated endpoints using the token

---

## Testing Without a User

If you don't have a user in the database yet, you can create one using Prisma Studio:

```bash
npx prisma studio
```

This opens a browser interface where you can manually create a user. Make sure to hash the password using bcrypt first, or create a simple script to do it.

