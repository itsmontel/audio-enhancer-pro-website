// Load environment variables
try {
  require('dotenv').config();
} catch (error) {
  console.warn('Warning: dotenv module not found. Using environment variables directly.');
}

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

// Use environment variables for API keys
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize Stripe with the secret key
const stripe = require('stripe')(STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const allowedDomains = ['https://audioenhancerpro.com', 'https://www.audioenhancerpro.com'];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed
    if (allowedDomains.indexOf(origin) !== -1 || !isProduction) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Serve static files from the root directory
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Debug route for checking environment
app.get('/debug', (req, res) => {
  res.json({
    stripeKeyConfigured: !!STRIPE_SECRET_KEY,
    environment: process.env.NODE_ENV || 'development',
    port: port
  });
});

// Route to serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Comparison page route
app.get('/comparison', (req, res) => {
  res.sendFile(path.join(__dirname, 'comparison.html'));
});

// Success page
app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'payment-success.html'));
});

// Payment page route - this is the page that will be loaded from the extension
app.get('/payment', (req, res) => {
  res.sendFile(path.join(__dirname, 'payment-page.html'));
});

// Force refresh payment page route
app.get('/payment-refresh', (req, res) => {
  res.sendFile(path.join(__dirname, 'payment-refresh.html'));
});

// Test route for Stripe
app.get('/test-stripe', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-stripe.html'));
});

// Redirect page for simulating extension payment
app.get('/payment-redirect', (req, res) => {
  res.sendFile(path.join(__dirname, 'payment-redirect.html'));
});

// Endpoint to provide publishable key to the client
app.get('/config', (req, res) => {
  console.log('Providing publishable key to client');
  res.json({ 
    publishableKey: STRIPE_PUBLISHABLE_KEY
  });
});

// Create a payment intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    console.log('Creating payment intent with data:', JSON.stringify(req.body));
    
    const { email, name, token, amount, currency = 'usd', description, extensionReferrer } = req.body;
    
    // Basic validation
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }
    
    // Optional: Validate that the request comes from the extension
    // In a production app, you would implement better validation
    if (!extensionReferrer) {
      console.warn('Payment attempt not from extension');
      // In production, you might want to reject these requests
      // return res.status(403).json({ error: 'Payments must be initiated from the extension' });
    }
    
    // Create a customer first
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      source: token // attach the token to the customer
    });
    
    console.log('Customer created:', customer.id);
    
    // First, create a product
    const product = await stripe.products.create({
      name: 'Audio Enhancer Pro Monthly Subscription',
      description: 'Premium audio features for your browser',
    });
    
    console.log('Product created:', product.id);
    
    // Create a subscription with the new product
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: {
            currency: currency,
            product: product.id,
            unit_amount: amount,
            recurring: {
              interval: 'month',
            },
          },
        },
      ],
      metadata: {
        user_email: email,
        extension_id: 'gligbihjcmlhoeidminbplfikfkjjneg' // Your Chrome extension ID
      }
    });
    
    console.log('Subscription created:', subscription.id);
    
    // Store this information for your extension to validate
    // In production, you would store this in a database
    
    res.json({
      clientSecret: subscription.latest_invoice.payment_intent?.client_secret,
      subscriptionId: subscription.id,
      customerId: customer.id,
      success: true
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for the extension to verify subscription
app.post('/verify-subscription', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // In production, you would query your database
    // For now, we'll check directly with Stripe
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    
    if (customers.data.length === 0) {
      return res.json({ subscribed: false });
    }
    
    const customerId = customers.data[0].id;
    
    // Check for active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });
    
    if (subscriptions.data.length > 0) {
      return res.json({ 
        subscribed: true,
        subscriptionId: subscriptions.data[0].id,
        planName: 'Audio Enhancer Pro',
        expiryDate: new Date(subscriptions.data[0].current_period_end * 1000).toISOString()
      });
    }
    
    // Check for trialing subscription
    const trialSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'trialing',
      limit: 1
    });
    
    if (trialSubscriptions.data.length > 0) {
      return res.json({ 
        subscribed: true,
        trial: true,
        trialEnd: new Date(trialSubscriptions.data[0].trial_end * 1000).toISOString(),
        subscriptionId: trialSubscriptions.data[0].id,
        planName: 'Audio Enhancer Pro'
      });
    }
    
    return res.json({ subscribed: false });
  } catch (error) {
    console.error('Error verifying subscription:', error);
    res.status(500).json({ error: 'Error verifying subscription' });
  }
});

// Endpoint to verify subscription by ID (for manual entry in extension)
app.post('/verify-subscription-id', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }
    
    // Look up the subscription in Stripe
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        // Get customer details for more information
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        return res.json({ 
          subscribed: true,
          subscriptionId: subscription.id,
          planName: 'Audio Enhancer Pro',
          expiryDate: new Date(subscription.current_period_end * 1000).toISOString(),
          email: customer.email
        });
      } else {
        return res.json({ 
          subscribed: false, 
          error: 'Subscription is not active' 
        });
      }
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return res.json({ 
        subscribed: false, 
        error: 'Invalid subscription ID' 
      });
    }
  } catch (error) {
    console.error('Error verifying subscription ID:', error);
    res.status(500).json({ error: 'Error verifying subscription ID' });
  }
});

// Endpoint to recover lost subscription ID via email
app.post('/recover-subscription', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Look up customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    
    if (customers.data.length === 0) {
      return res.json({ 
        success: false,
        error: 'No customer found with this email address'
      });
    }
    
    const customerId = customers.data[0].id;
    
    // Find active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 10
    });
    
    if (subscriptions.data.length === 0) {
      return res.json({ 
        success: false,
        error: 'No active subscriptions found for this email address'
      });
    }
    
    // In a real implementation, you would send an email with the subscription IDs
    // For this example, we'll just return success
    console.log(`Subscription recovery requested for ${email}. Found ${subscriptions.data.length} subscriptions.`);
    console.log('Subscription IDs:', subscriptions.data.map(sub => sub.id).join(', '));
    
    // Pretend we've sent an email
    return res.json({
      success: true,
      message: 'Recovery email sent with your subscription information'
    });
  } catch (error) {
    console.error('Error recovering subscription:', error);
    res.status(500).json({ error: 'Error recovering subscription' });
  }
});

// Webhook to handle events from Stripe
app.post('/webhook', bodyParser.raw({type: 'application/json'}), async (req, res) => {
  let event;

  try {
    if (STRIPE_WEBHOOK_SECRET) {
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } else {
      // For testing without a webhook secret
      event = req.body;
    }
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Received webhook event:', event.type);

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('New subscription created:', subscription.id);
      // Activate the extension for this user
      // You would typically store this in a database and have your extension
      // check against this when it starts up
      break;
      
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('Payment succeeded for invoice:', invoice.id);
      // Update subscription status in your database
      break;
      
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      console.log('Subscription updated:', updatedSubscription.id, 'Status:', updatedSubscription.status);
      // Handle subscription updates (upgrades, downgrades, cancellations)
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({received: true});
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on ${isProduction ? 'production' : 'development'} mode`);
  console.log(`Server listening on port ${port}`);
  console.log(`Access URL: ${isProduction ? 'https://audioenhancerpro.com' : 'http://localhost:' + port}`);
  console.log(`Stripe API key configured: ${STRIPE_SECRET_KEY ? 'Yes' : 'No'}`);
}); 