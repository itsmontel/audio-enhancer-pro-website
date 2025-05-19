# Audio Enhancer Pro Website

This repository contains the website and payment system for the Audio Enhancer Pro Chrome extension. The website allows users to subscribe to premium features of the extension.

## Features

- Landing page showcasing Audio Enhancer Pro features
- Secure payment processing using Stripe
- Subscription management system
- Automatic extension activation using subscription IDs

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Payment Processing: Stripe API
- Authentication: Custom token-based verification

## Setup Instructions

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file with your Stripe API keys
   ```
   STRIPE_PUBLISHABLE_KEY=your_publishable_key
   STRIPE_SECRET_KEY=your_secret_key
   ```
4. Start the server
   ```
   node server.js
   ```
5. The server will run on http://localhost:3000

## Extension Integration

The Chrome extension connects to this server to:
- Process payments
- Verify subscription status
- Activate premium features

## Subscription Flow

1. User clicks "Upgrade" in the extension
2. User is directed to the payment page
3. After successful payment, user receives a Subscription ID
4. User enters the Subscription ID in the extension
5. Extension verifies the ID with the server
6. Premium features are activated upon verification

## Directory Structure

- `index.html` - Main landing page
- `payment-page.html` - Payment form page
- `payment-success.html` - Payment confirmation page
- `server.js` - Node.js server code
- `extension-example.js` - Example code for extension integration

## Stripe Integration

The website includes Stripe integration for processing subscription payments. To activate it:

1. Replace `YOUR_PUBLISHABLE_KEY` with your Stripe publishable key
2. Deploy the backend server (`server.js`) and update `YOUR_BACKEND_ENDPOINT`
3. Replace `YOUR_EXTENSION_ID` with your Chrome extension ID 