# Audio Enhancer Pro - Supabase Implementation Guide

## 🚀 Quick Start Implementation

### Step 1: Set up Supabase Database

1. **Go to your Supabase dashboard:** https://odlcxblrzhstuoosawea.supabase.co
2. **Navigate to SQL Editor**
3. **Run the database setup script:**
   - Copy the entire contents of `setup-supabase-database.sql`
   - Paste and execute in the SQL Editor
   - You should see success messages confirming table creation

### Step 2: Update Chrome Extension Files

#### A. Update manifest.json
Add the "identity" permission and update externally_connectable:

```json
{
  "permissions": [
    "storage",
    "activeTab", 
    "scripting",
    "tabs",
    "identity"
  ],
  "externally_connectable": {
    "matches": ["https://audioenhancerpro.com/*"]
  }
}
```

#### B. Replace popup.html
- **Option 1 (Recommended):** Add the authentication section from `popup-with-auth.html` to your existing `popup.html`
- **Option 2:** Use the complete `popup-supabase.html` file with full integration

#### C. Replace popup.js
- Backup your current `popup.js`
- Use `popup-supabase.js` as a base and integrate your existing functions
- The new file includes all Supabase authentication and settings sync

### Step 3: Update Website Payment Integration

#### Update payment-integration.html
Add Supabase user creation on successful payment:

```javascript
// Add after successful Stripe payment
async function createSupabaseUser(customerEmail, stripeCustomerId) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: customerEmail,
            password: generateSecurePassword(), // Send via email
            options: {
                data: {
                    stripe_customer_id: stripeCustomerId,
                    created_from: 'payment'
                }
            }
        })
        
        if (!error && data.user) {
            // Create subscription record
            await supabase.from('subscriptions').insert({
                user_id: data.user.id,
                stripe_customer_id: stripeCustomerId,
                status: 'active',
                amount: paymentAmount
            })
        }
    } catch (error) {
        console.error('Failed to create user:', error)
    }
}
```

### Step 4: Set up Stripe Webhooks (Optional but Recommended)

Create a webhook endpoint to sync subscription status:

```javascript
// webhook.js - Deploy to Vercel, Netlify, or your server
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://odlcxblrzhstuoosawea.supabase.co',
  'YOUR_SERVICE_ROLE_KEY' // Get from Supabase Settings > API
)

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature']
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    )
    
    switch (event.type) {
      case 'customer.subscription.updated':
        await updateSubscription(event.data.object)
        break
      case 'customer.subscription.deleted':
        await cancelSubscription(event.data.object)
        break
    }
    
    res.json({ received: true })
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`)
  }
}

async function updateSubscription(subscription) {
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000)
    })
    .eq('stripe_subscription_id', subscription.id)
}
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file with:

```bash
SUPABASE_URL=https://odlcxblrzhstuoosawea.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbGN4YmxyemhzdHVvb3Nhd2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODI1MDcsImV4cCI6MjA2Njg1ODUwN30.KAMCQjGbRdJhGTKpbUyC4Tt3FPGQAOXOZXkcCB7r0Ac
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Supabase Authentication Settings
1. Go to **Authentication > Settings**
2. **Enable email confirmations** (recommended)
3. **Set up email templates** for password reset, etc.
4. **Configure redirect URLs** if needed

## 📱 User Flow After Implementation

### New Users
1. Install extension → sees Free version
2. Clicks "Upgrade to Pro" → redirected to payment page
3. Completes payment → Supabase account auto-created
4. Returns to extension → automatically signed in with Pro features
5. Settings sync across all devices

### Existing Users (Migration)
1. Open extension → sees "Sync Your Pro License" banner
2. Creates account → keeps existing Pro features
3. Settings automatically sync to cloud
4. Can now use Pro features on any device

### Returning Users
1. Open extension → automatically signs in
2. Settings sync from cloud
3. Subscription status verified from Supabase
4. Pro features work seamlessly

## 🧪 Testing the Integration

### 1. Test Database Setup
```sql
-- Run in Supabase SQL Editor
SELECT is_pro_user('test-user-id'::uuid);
-- Should return false for non-existent user
```

### 2. Test Authentication
- Try signing up with a test email
- Check if user appears in Authentication > Users
- Verify RLS policies work correctly

### 3. Test Subscription Creation
```sql
-- Insert test subscription
INSERT INTO subscriptions (user_id, status, amount) 
VALUES (auth.uid(), 'active', 4.99);

-- Verify user is now Pro
SELECT get_user_subscription_status(auth.uid());
```

### 4. Test Settings Sync
- Change settings in extension
- Sign out and sign back in
- Verify settings are restored

## 🔍 Monitoring & Analytics

### Useful Supabase Queries

```sql
-- Active Pro users
SELECT COUNT(*) FROM subscriptions WHERE status = 'active';

-- Revenue by month
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(amount) as revenue,
  COUNT(*) as subscribers
FROM subscriptions 
WHERE status = 'active'
GROUP BY month;

-- User signup sources
SELECT 
  raw_user_meta_data->>'created_from' as source,
  COUNT(*) as users
FROM auth.users 
GROUP BY source;
```

### Set up Row Level Security Monitoring
Monitor RLS policy effectiveness in the Supabase dashboard.

## 🚨 Troubleshooting

### Common Issues

1. **"User not authenticated" errors**
   - Check if Supabase client is properly initialized
   - Verify anon key is correct
   - Check browser console for auth errors

2. **RLS policy errors**
   - Verify policies are enabled
   - Check policy conditions match your auth flow
   - Test with service role key temporarily

3. **Settings not syncing**
   - Check if user is properly authenticated
   - Verify user_settings table has correct permissions
   - Look for sync errors in console

4. **Payment → account creation fails**
   - Check Stripe webhook configuration
   - Verify Supabase service role key
   - Monitor webhook logs

### Debug Commands

```javascript
// Check current auth status
const { data: { session } } = await supabase.auth.getSession()
console.log('Current session:', session)

// Test subscription check
const { data } = await supabase.rpc('get_user_subscription_status', { 
  user_uuid: session.user.id 
})
console.log('Subscription status:', data)

// Test settings sync
const { data: settings } = await supabase
  .from('user_settings')
  .select('*')
  .eq('user_id', session.user.id)
console.log('User settings:', settings)
```

## 🎯 Next Steps After Implementation

1. **Deploy updated extension** to Chrome Web Store
2. **Set up Stripe webhooks** for production
3. **Configure email templates** in Supabase
4. **Add customer support** tools
5. **Monitor metrics** and user feedback
6. **Plan additional features** like team accounts

## 💡 Additional Features to Consider

- **Social login** (Google, GitHub)
- **Team subscriptions** for organizations
- **Usage analytics** and reporting
- **Custom branding** for Pro users
- **Advanced export** options
- **API access** for Pro users

Your Supabase integration is now ready to provide enterprise-grade user management and subscription handling for Audio Enhancer Pro! 