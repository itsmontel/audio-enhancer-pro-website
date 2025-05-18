# Audio Enhancer Pro Website

The official website for Audio Enhancer Pro - a browser extension that transforms your audio with studio-quality enhancements.

## Features

- Advanced Volume Boost (up to 500%)
- 10-Band Equalizer with Presets
- AI-Powered Noise Reduction
- 3D Spatial Audio
- Personalized Hearing Test

## Website Structure

- `index.html`: Main landing page
- `payment-success.html`: Payment confirmation page
- `payment-integration.html`: Payment processing page
- `logo.png`: Brand logo
- `server.js`: Backend for payment processing (requires setup)

## Stripe Integration

The website includes Stripe integration for processing subscription payments. To activate it:

1. Replace `YOUR_PUBLISHABLE_KEY` with your Stripe publishable key
2. Deploy the backend server (`server.js`) and update `YOUR_BACKEND_ENDPOINT`
3. Replace `YOUR_EXTENSION_ID` with your Chrome extension ID

## Setup Instructions

1. Clone this repository
2. Configure your Stripe API keys
3. Deploy to your web hosting provider
4. Link to your Chrome extension 