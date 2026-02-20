# Carwash Backend API

Car wash management backend API with booking, payments (Wompi), and WhatsApp chatbot integration.

Built with Express, TypeScript, Prisma, and PostgreSQL.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) (for local PostgreSQL via Supabase)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start a local PostgreSQL database

The recommended approach is using Supabase local. If you already have a Supabase local instance running, skip to step 3.

Alternatively, you can use a standalone Postgres container:

```bash
docker run --name carwash-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=carwash -p 5432:5432 -d postgres
```

### 3. Configure environment variables

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

At minimum, set these for local development:

```env
DATABASE_URL=postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:54322/postgres
JWT_SECRET=any-secret-string-for-local-dev
```

If using a standalone Postgres container instead of Supabase:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/carwash
```

The WhatsApp and Wompi keys are only required if you need to test those integrations. The core API works without them.

### 4. Set up the database

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Seed sample data

```bash
npm run prisma:seed
```

This creates:

| User | Email | Password | Role |
|------|-------|----------|------|
| John Owner | owner@carwash.com | password123 | OWNER |
| Jane Manager | manager@carwash.com | password123 | MANAGER |
| Bob Staff | staff@carwash.com | password123 | STAFF |

Plus 3 car wash locations, 6 services, and 4 sample bookings.

### 6. Start the dev server

```bash
npm run dev
```

The server starts on `http://localhost:3000`. Verify with:

```bash
curl http://localhost:3000/health
```

## Usage

### Authentication

All write endpoints require a JWT token. Get one by logging in:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@carwash.com", "password": "password123"}'
```

Use the returned token in subsequent requests:

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <your-token>"
```

### Creating a user via CLI

To bootstrap a user without the API:

```bash
# With defaults (test@example.com / password123 / OWNER)
npm run create-user

# With custom values
npm run create-user -- email@example.com mypassword "User Name" STAFF
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload (port 3000) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed sample data |
| `npm run create-user` | Create a user via CLI |

## API Overview

| Route | Description |
|-------|-------------|
| `POST /auth/login` | Login |
| `GET /auth/me` | Current user |
| `GET/POST/PUT/DELETE /car-washes` | Car wash CRUD |
| `GET/POST/PUT/DELETE /car-washes/:id/services` | Service CRUD (nested) |
| `GET/POST/PUT/DELETE /users` | User CRUD (role-restricted) |
| `/bookings` | Booking management |
| `/payments` | Payment management |
| `/stats` | Statistics |
| `/dashboard` | Dashboard data |
| `/settings` | App settings |
| `/webhooks/whatsapp` | WhatsApp webhook (Meta) |
| `/webhooks/wompi` | Wompi payment webhook |
| `GET /health` | Health check |

## Testing WhatsApp Flow Locally

You can simulate WhatsApp messages by posting Meta's webhook format directly:

```bash
curl -X POST http://localhost:3000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "573001234567",
            "type": "text",
            "text": { "body": "" }
          }]
        }
      }]
    }]
  }'
```

Reply messages will appear in the server console logs. For real WhatsApp delivery, you need a Meta developer account and a tunnel (e.g. ngrok).

## Testing Wompi Webhooks Locally

Simulate a payment status update:

```bash
curl -X POST http://localhost:3000/webhooks/wompi \
  -H "Content-Type: application/json" \
  -d '{
    "event": "transaction.updated",
    "data": {
      "transaction": {
        "id": "txn_123",
        "reference": "YOUR_PAYMENT_REFERENCE",
        "status": "APPROVED"
      }
    }
  }'
```

Replace `YOUR_PAYMENT_REFERENCE` with an actual reference from the Payment table.
