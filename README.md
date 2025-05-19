# Audio Enhancer Pro Website

This is the official website and payment API for the Audio Enhancer Pro Chrome extension.

## Features

- Stripe payment integration
- Subscription management
- Subscription verification system

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with your Stripe API keys:
   ```
   STRIPE_SECRET_KEY=sk_test_your_test_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Access the site at http://localhost:3000

## Production Deployment

### Setting up on audioenhancerpro.com

1. Clone the repository on your server
2. Install dependencies: `npm install --production`
3. Set environment variables:
   ```
   export NODE_ENV=production
   export STRIPE_SECRET_KEY=sk_live_your_live_key
   export STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   export PORT=80  # or 443 if using HTTPS directly
   ```
4. Run the production server:
   ```
   npm run prod
   ```

### Using a Process Manager (recommended)

For production, it's recommended to use PM2:

```
npm install -g pm2
pm2 start server.js --name "audio-enhancer-pro" --env production
pm2 save
pm2 startup
```

### Setting up with Nginx (recommended)

1. Install and configure Nginx as a reverse proxy
2. Use Let's Encrypt to set up SSL for audioenhancerpro.com
3. Configure your Nginx server block to forward requests to your Node.js application

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name audioenhancerpro.com www.audioenhancerpro.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name audioenhancerpro.com www.audioenhancerpro.com;

    ssl_certificate /etc/letsencrypt/live/audioenhancerpro.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/audioenhancerpro.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## API Endpoints

- `/config` - Get Stripe publishable key
- `/create-payment-intent` - Create a subscription
- `/verify-subscription` - Verify subscription by email
- `/verify-subscription-id` - Verify subscription by ID
- `/recover-subscription` - Recover subscription ID via email 