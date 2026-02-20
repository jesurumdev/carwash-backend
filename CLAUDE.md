# Carwash Backend

Car wash management backend API built with Express + TypeScript + Prisma + PostgreSQL.

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express
- **ORM:** Prisma (v5)
- **Database:** PostgreSQL (Supabase local for dev, Railway for production)
- **Auth:** JWT (jsonwebtoken) + bcrypt for password hashing
- **Payments:** Wompi (Colombian payment gateway, sandbox mode for dev)
- **Messaging:** WhatsApp Business API (Meta)

## Project Structure

```
src/
├── app.ts                  # Express app setup, middleware, route mounting
├── server.ts               # Server entry point (loads .env, starts listening)
├── config/
│   └── database.ts         # Prisma client instance
├── controllers/            # Request handlers (validate, call services, respond)
│   ├── authController.ts
│   ├── bookingController.ts
│   ├── carWashController.ts
│   ├── paymentController.ts
│   ├── serviceController.ts
│   ├── settingsController.ts
│   ├── statsController.ts
│   ├── userController.ts
│   ├── whatsappController.ts
│   ├── whatsappWebhookController.ts
│   └── wompiWebhookController.ts
├── middleware/
│   ├── auth.ts             # JWT authentication middleware (AuthRequest type)
│   └── errorHandler.ts     # Global error handler
├── routes/                 # Route definitions
│   ├── authRoutes.ts       # /auth
│   ├── bookingRoutes.ts    # /bookings
│   ├── carWashRoutes.ts    # /car-washes
│   ├── dashboardRoutes.ts  # /dashboard
│   ├── paymentRoutes.ts    # /payments
│   ├── serviceRoutes.ts    # /car-washes/:id/services (mounted on /car-washes)
│   ├── settingsRoutes.ts   # /settings
│   ├── statsRoutes.ts      # /stats
│   ├── userRoutes.ts       # /users
│   ├── webhookRoutes.ts    # /webhooks (WhatsApp + Wompi)
│   └── whatsappRoutes.ts   # /whatsapp
├── services/               # Business logic layer
│   ├── authService.ts
│   ├── bookingNotificationService.ts
│   ├── bookingService.ts
│   ├── carWashService.ts
│   ├── conversationService.ts  # WhatsApp chatbot state machine
│   ├── paymentService.ts
│   ├── serviceService.ts
│   ├── settingsService.ts
│   ├── statsService.ts
│   ├── userService.ts
│   ├── whatsappService.ts
│   └── wompiService.ts
├── scripts/
│   └── createUser.ts       # CLI script to bootstrap users
├── types/
│   └── index.ts            # Shared types (JwtPayload, LoginRequest, AuthResponse)
└── utils/
    ├── jwt.ts              # JWT sign/verify helpers
    └── money.ts            # centsToPesos / pesosToCents converters
```

## Architecture Pattern

Routes -> Controllers -> Services -> Prisma (DB)

- **Routes** define endpoints and attach middleware (e.g. `authenticate`).
- **Controllers** handle HTTP concerns: parse params/body, call services, send responses.
- **Services** contain business logic and DB queries via Prisma. No HTTP awareness.
- Keep this separation. Don't put Prisma calls in controllers or HTTP responses in services.

## Database

### Models

- **User** - email (unique), name, password (bcrypt), role (OWNER | MANAGER | STAFF)
- **CarWash** - name, address, city, active, working hours config (openingTime, closingTime, slotDurationMinutes, breakStartTime, breakEndTime)
- **Service** - belongs to CarWash, name, price (stored in cents), durationMin, active
- **Booking** - belongs to CarWash + Service, customerPhone, date, status, has many Payments
- **Payment** - belongs to Booking, reference (unique), amount (cents), currency (COP), status, Wompi link/txn IDs, metadata (JSON)
- **ConversationState** - WhatsApp chatbot state per customerPhone (unique), tracks step + selections

### Important: Currency Handling

- **Database stores prices in cents** (integer). Example: 2000.00 COP = 200000 cents.
- **API accepts and returns prices in pesos**. Controllers convert using `pesosToCents()` / `centsToPesos()` from `src/utils/money.ts`.
- Wompi minimum is 150,000 cents (1,500.00 COP).
- Always follow this pattern when adding new endpoints that deal with prices.

## API Endpoints

### Auth (`/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Login, returns JWT |
| GET | `/auth/me` | Yes | Get current user from token |

### Car Washes (`/car-washes`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/car-washes` | No | List all active car washes |
| GET | `/car-washes/:id` | No | Get single car wash |
| POST | `/car-washes` | Yes | Create car wash |
| PUT | `/car-washes/:id` | Yes | Update car wash |
| DELETE | `/car-washes/:id` | Yes | Delete car wash |

### Services (`/car-washes/:id/services`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/car-washes/:id/services` | No | List services for a car wash |
| GET | `/car-washes/:id/services/:serviceId` | No | Get single service |
| POST | `/car-washes/:id/services` | Yes | Create service (price in pesos) |
| PUT | `/car-washes/:id/services/:serviceId` | Yes | Update service |
| DELETE | `/car-washes/:id/services/:serviceId` | Yes | Delete service |

### Users (`/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Yes | List users (filtered by caller's role) |
| GET | `/users/:id` | Yes | Get user (role-restricted) |
| POST | `/users` | Yes | Create user (role-restricted) |
| PUT | `/users/:id` | Yes | Update user (role-restricted) |
| DELETE | `/users/:id` | Yes | Delete user (role-restricted) |

### Bookings (`/bookings`)
### Payments (`/payments`)
### Stats (`/stats`)
### Dashboard (`/dashboard`)
### Settings (`/settings`)
### Webhooks (`/webhooks`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/webhooks/whatsapp` | No | Meta webhook verification |
| POST | `/webhooks/whatsapp` | No | Receive WhatsApp messages |
| POST | `/webhooks/wompi` | No | Receive Wompi payment updates |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Returns `{ status: "ok" }` |

## Role-Based Access Control

Three roles: **OWNER**, **MANAGER**, **STAFF**.

### User Management Permissions
| Action | OWNER | MANAGER | STAFF |
|--------|-------|---------|-------|
| List users | Sees MANAGER + STAFF | Sees STAFF only | 403 |
| Get user | MANAGER + STAFF | STAFF only | Own profile only |
| Create user | MANAGER or STAFF | STAFF only | 403 |
| Update user | MANAGER or STAFF | STAFF only | Own profile only (cannot change role) |
| Delete user | MANAGER or STAFF | STAFF only | 403 |

The role hierarchy is enforced in `src/controllers/userController.ts` via `MANAGEABLE_ROLES` and `canManageRole()`. When adding new role-restricted endpoints, follow the same pattern.

## WhatsApp Chatbot Flow

The conversation state machine lives in `src/services/conversationService.ts`. Steps:

1. **CHOOSE_SEDE** - Customer picks a car wash location
2. **CHOOSE_SERVICE** - Customer picks a service
3. **CHOOSE_DATE** - Customer enters date (YYYY-MM-DD format)
4. **CHOOSE_TIME** - Customer picks from available time slots
5. **CONFIRM_BOOKING** - Booking is created, Wompi payment link is generated and sent
6. **COMPLETED** - Waiting for payment webhook

The state is stored per phone number in the `ConversationState` table.

## Payment Flow

1. Booking is created with status `PENDING_PAYMENT`
2. `paymentService.createPaymentLink()` generates a Wompi payment link
3. Link is sent to customer via WhatsApp
4. Customer pays through Wompi
5. Wompi sends webhook to `POST /webhooks/wompi`
6. `wompiWebhookController` updates Payment status and Booking status
7. If APPROVED: booking becomes `CONFIRMED`, customer gets WhatsApp confirmation
8. If DECLINED: customer gets WhatsApp rejection message

## Local Development

### Prerequisites
- Node.js
- PostgreSQL (Supabase local via Docker recommended)

### Environment Variables (.env)
```
DATABASE_URL=postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:54322/postgres
JWT_SECRET=any-secret-string
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_BUSINESS_ACCOUNT_ID=...
WHATSAPP_VERIFY_TOKEN=...
WOMPI_PUBLIC_KEY=...
WOMPI_PRIVATE_KEY=...
WOMPI_INTEGRITY_KEY=...
WOMPI_ENVIRONMENT=sandbox
WOMPI_REDIRECT_URL=...
```

The `.env` file has both local (Supabase) and production (Railway) DATABASE_URLs. Comment/uncomment to switch.

### Commands
```bash
npm install              # Install dependencies
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
npm run prisma:seed       # Seed sample data
npm run create-user       # Bootstrap a user via CLI
npm run dev               # Start dev server (port 3000)
npm run build             # Compile TypeScript
npm start                 # Run compiled JS
```

### Seed Data Credentials
- Owner: `owner@carwash.com` / `password123`
- Manager: `manager@carwash.com` / `password123`
- Staff: `staff@carwash.com` / `password123`

## Rules for Adding New Features

1. **Follow the layered architecture.** Route -> Controller -> Service -> Prisma.
2. **Prices in cents in DB, pesos in API.** Use `pesosToCents()` / `centsToPesos()` in controllers.
3. **Never return password fields.** Use Prisma `select` to exclude them.
4. **Hash passwords with bcrypt** (salt rounds: 10) before storing.
5. **Use `AuthRequest` type** (from `src/middleware/auth.ts`) in controllers that need `req.user`.
6. **Check roles in controllers**, not in services. Services should be role-agnostic.
7. **Webhooks return 200 immediately** and process asynchronously. Never block webhook responses.
8. **New migrations:** Run `npx prisma migrate dev --name description` to generate. Never edit existing migration files.
9. **No multi-tenancy yet.** Car washes are not scoped to users/organizations. All authenticated users see all car washes.

## Changes Log

### Session 2026-02-20
- **Fixed `carWashService.ts`**: Implemented `createCarWash`, `updateCarWash`, `deleteCarWash` (were stubs returning `null`).
- **Implemented `userService.ts`**: Full CRUD + `getUsersByRoles`. Passwords hashed with bcrypt, excluded from responses.
- **Added role-based access control to `userController.ts`**: OWNER manages MANAGER+STAFF, MANAGER manages STAFF, STAFF can only update own profile.
- **Generated missing `Payment` table migration**: The Payment model existed in schema but had no migration. Created `20260220222949_add_payment_table`.
- **Configured local dev environment**: Pointed `DATABASE_URL` to local Supabase PostgreSQL (port 54322). Both local and production URLs kept in `.env`.
