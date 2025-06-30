# Audio Enhancer Pro - Stripe Payment Integration Setup

This guide will help you set up the Stripe payment integration between your Chrome extension and website.

## Overview

The integration creates this user flow:
1. User clicks "Upgrade to Pro" in the Chrome extension popup
2. Opens your website's Stripe payment page in a new tab
3. User completes payment on Stripe
4. Website sends success/failure message back to the extension
5. Extension automatically activates Pro features on successful payment

## Setup Requirements

### 1. Stripe Account Setup
1. Create a Stripe account at https://stripe.com
2. Get your Stripe publishable key from the Stripe Dashboard
3. Set up webhooks for payment confirmation (recommended for production)

### 2. Domain Configuration

**Replace placeholders in these files:**

#### `manifest.json`
```json
"externally_connectable": {
  "matches": [
    "https://audioenhancerpro.com/*"  // ✅ Already configured
  ]
}
```

#### `popup.js` (2 locations)
```javascript
// ✅ Already configured with your domain
const paymentUrl = `https://audioenhancerpro.com/audio-enhancer-website/payment-integration.html?`
```

#### `audio-enhancer-website/payment-integration.html`
```javascript
// Replace with your actual Stripe publishable key
const stripe = Stripe('pk_test_51XXXXXXXXXXXXXXXXXXXXXXXX');
```

### 3. File Structure
Ensure your website has this structure:
```
audioenhancerpro.com/
└── audio-enhancer-website/
    ├── payment-integration.html
    ├── payment-success.html
    └── logo.png
```

## Configuration Steps

### Step 1: Configure Stripe ✅ COMPLETE
The Stripe publishable key has been configured in `payment-integration.html`.

**🔒 Security Note:** Your Stripe secret key (`sk_test_...`) should NEVER be used in frontend code. It's only for secure backend/server operations. Only the publishable key (`pk_test_...`) is safe for frontend use.

### Step 2: Upload Website Files & Test the Integration (Final step)

**Upload the website files to your domain:**
1. Upload the `audio-enhancer-website/` folder to `https://audioenhancerpro.com/`
2. Ensure files are accessible at `https://audioenhancerpro.com/audio-enhancer-website/payment-integration.html`
3. Test the integration (see testing section below)

#### Local Testing (Development)
1. Use `http://localhost:*/*` in manifest.json for local testing
2. Set up a local server for the website files
3. Update the domain references to point to localhost

#### Production Testing
1. Deploy website files to your domain
2. Update all domain references
3. Load the extension in Chrome (Developer mode)
4. Test the payment flow

## Testing Checklist

### Extension Side
- [ ] Upgrade button opens payment page in new tab
- [ ] URL parameters are correctly passed
- [ ] Extension receives payment success/failure messages
- [ ] Pro features are activated after successful payment
- [ ] Free restrictions remain after failed payment

### Website Side
- [ ] Payment page loads with correct parameters
- [ ] Stripe form works correctly
- [ ] Success page displays proper amount
- [ ] Messages are sent back to extension
- [ ] Page auto-closes after success

### Integration Testing
- [ ] Successful payment activates Pro features
- [ ] Failed payment doesn't activate Pro features
- [ ] Payment cancellation is handled gracefully
- [ ] Session validation works correctly

## Stripe Test Cards

Use these test card numbers during development:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Insufficient funds**: 4000 0000 0000 9995
- **Expired card**: 4000 0000 0000 0069

Use any future expiry date and any 3-digit CVC.

## Production Considerations

### Security
1. **Never expose your Stripe secret key** in frontend code
2. Use server-side validation for payments
3. Implement webhook verification
4. Validate payment amounts server-side

### Backend Implementation (Recommended)
For production, implement a backend server that:
1. Creates Stripe payment intents
2. Handles webhooks for payment confirmation
3. Validates extension sessions
4. Manages user subscriptions

### Error Handling
1. Handle network failures gracefully
2. Provide clear error messages to users
3. Implement retry mechanisms
4. Log errors for debugging

## Troubleshooting

### Common Issues

#### "Extension communication error"
- Check that domain is added to `externally_connectable` in manifest.json
- Verify the extension ID is being passed correctly
- Ensure the website is served over HTTPS (required for Chrome extensions)

#### Payment page doesn't load
- Verify domain configuration in popup.js
- Check that website files are uploaded correctly
- Ensure the payment-integration.html file is accessible

#### Pro features don't activate
- Check browser console for error messages
- Verify session ID matching in extension storage
- Ensure payment success message is being sent

#### Stripe errors
- Verify publishable key is correct
- Check that Stripe.js is loading properly
- Ensure test mode is enabled during development

### Debug Tools
1. Chrome DevTools Console (for both extension and website)
2. Chrome Extension Developer Tools
3. Stripe Dashboard (for payment logs)
4. Network tab (to check API calls)

## Support

For additional help:
1. Check Chrome extension documentation
2. Review Stripe integration guides
3. Test with Stripe's test cards
4. Use browser developer tools for debugging

---

**Important**: This setup uses Stripe test mode. Make sure to switch to live mode and update keys before going to production. 