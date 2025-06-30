# Supabase Integration Plan for Audio Enhancer Pro

## Overview
This plan outlines how to integrate Supabase for user authentication, subscription management, and cross-device synchronization with your Chrome extension and Stripe payments.

## Why Supabase?
- **Authentication**: Built-in user management with email/social logins
- **Database**: PostgreSQL database for storing user and subscription data
- **Real-time**: Live subscription status updates
- **Security**: Row Level Security (RLS) for data protection
- **Stripe Integration**: Easy webhook handling and subscription management
- **Cross-platform**: Works with web, mobile, and extensions

## Database Schema

### Users Table (Managed by Supabase Auth)
```sql
-- Supabase creates this automatically
users (
  id uuid PRIMARY KEY,
  email text,
  created_at timestamp,
  -- other auth fields
)
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL, -- active, canceled, past_due, trialing
  current_period_start timestamp,
  current_period_end timestamp,
  amount decimal(10,2),
  currency text DEFAULT 'usd',
  trial_end timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" 
ON subscriptions FOR SELECT 
USING (auth.uid() = user_id);
```

### Extension Settings Table (Optional)
```sql
CREATE TABLE user_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings" 
ON user_settings FOR ALL 
USING (auth.uid() = user_id);
```

## Implementation Steps

### Step 1: Supabase Setup
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get your project URL and anon key
4. Set up the database tables (above schema)
5. Configure authentication providers (email, Google, etc.)

### Step 2: Update Chrome Extension

#### Add Supabase Client
```javascript
// Add to manifest.json permissions
"permissions": [
  "storage",
  "activeTab", 
  "scripting",
  "tabs",
  "identity" // For authentication
]

// Install Supabase client in extension
// popup.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)
```

#### Authentication Flow
```javascript
// Login function
async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    showStatus('Login failed: ' + error.message, true)
    return false
  }
  
  // Store auth session
  await chrome.storage.local.set({
    supabaseSession: data.session
  })
  
  return true
}

// Check subscription status
async function checkSubscriptionStatus() {
  const { data: session } = await supabase.auth.getSession()
  
  if (!session?.user) {
    return { isPro: false, requiresLogin: true }
  }
  
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .single()
  
  return {
    isPro: !!subscription && !error,
    subscription: subscription,
    user: session.user
  }
}
```

### Step 3: Update Website Payment Flow

#### Enhanced Payment Success
```javascript
// payment-success.html
async function handlePaymentSuccess(paymentData) {
  // 1. Authenticate user or create account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: customerEmail,
    password: generateTempPassword(), // Or use passwordless
  })
  
  // 2. Create subscription record
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .insert({
      user_id: authData.user.id,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      status: 'active',
      amount: paymentData.amount
    })
  
  // 3. Send auth info to extension
  sendMessageToExtension('PAYMENT_SUCCESS', {
    ...paymentData,
    user: authData.user,
    subscription: subscription
  })
}
```

### Step 4: Stripe Webhook Handler

#### Server-side Webhook Processing
```javascript
// server.js or serverless function
app.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature']
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await updateSubscriptionInSupabase(event.data.object)
      break
      
    case 'customer.subscription.deleted':
      await cancelSubscriptionInSupabase(event.data.object)
      break
  }
  
  res.json({ received: true })
})

async function updateSubscriptionInSupabase(stripeSubscription) {
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      stripe_subscription_id: stripeSubscription.id,
      status: stripeSubscription.status,
      current_period_end: new Date(stripeSubscription.current_period_end * 1000),
      // ... other fields
    })
}
```

### Step 5: Extension UI Updates

#### Add Login/Account Management
```html
<!-- Add to popup.html -->
<div id="authSection" class="card">
  <div id="loginForm">
    <h3>Sign In to Sync Settings</h3>
    <input type="email" id="emailInput" placeholder="Email">
    <input type="password" id="passwordInput" placeholder="Password">
    <button id="loginBtn">Sign In</button>
    <button id="signupBtn">Create Account</button>
  </div>
  
  <div id="accountInfo" style="display:none;">
    <h3>Account</h3>
    <p>Signed in as: <span id="userEmail"></span></p>
    <p>Subscription: <span id="subscriptionStatus"></span></p>
    <button id="logoutBtn">Sign Out</button>
    <button id="manageSubscriptionBtn">Manage Subscription</button>
  </div>
</div>
```

## Security Benefits

1. **Server-side validation**: Subscription status verified from Supabase
2. **Row Level Security**: Users only access their own data
3. **JWT tokens**: Secure authentication with automatic refresh
4. **Audit trail**: Track all subscription changes
5. **Webhook verification**: Stripe events are cryptographically verified

## User Experience Improvements

1. **Cross-device sync**: Settings and subscription work everywhere
2. **Password recovery**: Built-in forgot password flow
3. **Account management**: Users can view billing history, cancel subscriptions
4. **Support**: Customer service can look up and help users
5. **Social login**: Optional Google/GitHub login for easier signup

## Migration Strategy

### Phase 1: Parallel System
- Keep existing local storage system
- Add Supabase as optional enhancement
- Users can choose to create accounts for sync

### Phase 2: Gradual Migration
- Prompt existing Pro users to create accounts
- Offer incentives (extra trial time, etc.)
- Maintain backward compatibility

### Phase 3: Full Migration
- Require accounts for new Pro subscriptions
- Sunset local-only licensing

## Environment Variables

```bash
# Add to your .env file
SUPABASE_URL=https://odlcxblrzhstuoosawea.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbGN4YmxyemhzdHVvb3Nhd2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODI1MDcsImV4cCI6MjA2Njg1ODUwN30.KAMCQjGbRdJhGTKpbUyC4Tt3FPGQAOXOZXkcCB7r0Ac
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Cost Considerations

**Supabase Pricing (as of 2024):**
- **Free tier**: 50,000 monthly active users
- **Pro tier**: $25/month for 100,000 MAU
- **Pay-as-you-scale**: Additional usage fees

For most SaaS extensions, the free tier is sufficient initially.

## Next Steps

1. **Set up Supabase project**
2. **Create database schema**
3. **Update Chrome extension with auth**
4. **Add webhook handler**
5. **Test end-to-end flow**
6. **Deploy and monitor**

This architecture provides enterprise-grade subscription management while maintaining the seamless user experience of your current integration. 