# Labour Management Backend

Node.js + Express + MongoDB backend for Labour Management System with subscription and Stripe integration.

## Setup

1. Copy `.env.example` to `.env` and set values (MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY)
2. `npm install`
3. `npm run seed` (to create default plans and salary types)
4. `npm run dev` or `npm start`

## Notes

- Stripe is used to create Checkout sessions in a minimal example. You must set `STRIPE_SECRET_KEY`.
- Webhooks for Stripe are not implemented here — use them in production to confirm payments.
