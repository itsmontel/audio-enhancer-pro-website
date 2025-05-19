// This is an example of how your Chrome extension would handle payments
// You would include this in your extension's background.js or similar file

// Generate a verification token to prevent unauthorized access
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Store token in extension storage
function storeToken(token) {
  chrome.storage.local.set({ 'paymentToken': token });
}

// Function to open payment page when user clicks subscribe in extension
function openPaymentPage() {
  // Get user's email if available
  chrome.storage.local.get(['userEmail'], function(result) {
    const userEmail = result.userEmail || '';
    
    // Create a secure token
    const token = generateToken();
    storeToken(token);
    
    // Construct payment URL with parameters
    const paymentUrl = `http://localhost:3000/payment-refresh?source=extension&token=${token}&email=${encodeURIComponent(userEmail)}`;
    
    // Open the payment page in a new tab
    chrome.tabs.create({ url: paymentUrl });
    
    // Show notification about subscription process
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'images/icon128.png',
      title: 'Audio Enhancer Pro',
      message: 'After payment, you\'ll receive a Subscription ID. Keep it safe to activate your premium features!'
    });
  });
}

// New function to verify subscription by ID
function verifySubscriptionID(subscriptionId) {
  // Display loading state in UI
  updateUI({ state: 'verifying' });
  
  return fetch('https://audioenhancerpro.com/verify-subscription-id', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      subscriptionId: subscriptionId 
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.subscribed) {
      // Store subscription details
      chrome.storage.local.set({
        'subscription': {
          active: true,
          subscriptionId: data.subscriptionId,
          expiryDate: data.expiryDate,
          planName: data.planName
        }
      }, function() {
        console.log('Subscription details saved');
        
        // Enable premium features
        enablePremiumFeatures();
        
        // Show success notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'images/icon128.png',
          title: 'Premium Features Activated',
          message: 'Thank you for subscribing to Audio Enhancer Pro!'
        });
        
        // Update UI
        updateUI({ state: 'subscribed' });
      });
      return { success: true };
    } else {
      // Update UI
      updateUI({ state: 'error', message: data.error || 'Invalid subscription ID' });
      return { success: false, error: data.error };
    }
  })
  .catch(error => {
    console.error('Error verifying subscription ID:', error);
    updateUI({ state: 'error', message: 'Network error. Please try again.' });
    return { success: false, error: 'Network error' };
  });
}

// Add a recovery option for lost subscription IDs
function recoverSubscriptionID(email) {
  updateUI({ state: 'recovering' });
  
  return fetch('https://audioenhancerpro.com/recover-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      updateUI({ 
        state: 'recovery-sent', 
        message: 'Recovery email sent! Please check your inbox.' 
      });
      return { success: true };
    } else {
      updateUI({ 
        state: 'error', 
        message: data.error || 'No subscription found for this email.' 
      });
      return { success: false, error: data.error };
    }
  })
  .catch(error => {
    console.error('Error recovering subscription:', error);
    updateUI({ state: 'error', message: 'Network error. Please try again.' });
    return { success: false, error: 'Network error' };
  });
}

// Helper function to update the UI based on state
function updateUI(data) {
  // Send message to popup.js to update the UI
  chrome.runtime.sendMessage({ 
    type: 'UPDATE_UI', 
    data: data 
  });
}

// Example functions for enabling/disabling features
function enablePremiumFeatures() {
  // Set premium flag
  chrome.storage.local.set({ 'isPremium': true });
  
  // Update UI to show premium features
  chrome.runtime.sendMessage({ type: 'PREMIUM_ACTIVATED' });
}

function disablePremiumFeatures() {
  // Remove premium flag
  chrome.storage.local.set({ 'isPremium': false });
  
  // Update UI to hide premium features
  chrome.runtime.sendMessage({ type: 'PREMIUM_DEACTIVATED' });
}

// Check subscription status when extension starts
chrome.runtime.onStartup.addListener(function() {
  checkSavedSubscription();
});

// Also check when installed
chrome.runtime.onInstalled.addListener(function() {
  checkSavedSubscription();
});

// Function to check if subscription is stored locally
function checkSavedSubscription() {
  chrome.storage.local.get(['subscription'], function(result) {
    const subscription = result.subscription;
    
    if (subscription && subscription.active) {
      // Check if expired
      const now = new Date();
      const expiryDate = new Date(subscription.expiryDate);
      
      if (expiryDate > now) {
        // Still valid
        enablePremiumFeatures();
      } else {
        // Expired
        disablePremiumFeatures();
      }
    } else {
      disablePremiumFeatures();
    }
  });
}

// Listen for messages from popup UI
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'VERIFY_SUBSCRIPTION_ID') {
    verifySubscriptionID(request.subscriptionId)
      .then(result => sendResponse(result));
    return true; // Required for async sendResponse
  }
  
  if (request.type === 'RECOVER_SUBSCRIPTION') {
    recoverSubscriptionID(request.email)
      .then(result => sendResponse(result));
    return true; // Required for async sendResponse
  }
});

// Example: Add click listeners for popup buttons (this would go in popup.js)
document.addEventListener('DOMContentLoaded', function() {
  // Subscribe button
  const subscribeButton = document.getElementById('subscribe-button');
  if (subscribeButton) {
    subscribeButton.addEventListener('click', function() {
      openPaymentPage();
    });
  }
  
  // Verify subscription ID button
  const verifyButton = document.getElementById('verify-button');
  if (verifyButton) {
    verifyButton.addEventListener('click', function() {
      const subscriptionId = document.getElementById('subscription-id-input').value;
      if (subscriptionId) {
        chrome.runtime.sendMessage(
          { type: 'VERIFY_SUBSCRIPTION_ID', subscriptionId: subscriptionId },
          function(response) {
            // Handle response in UI
          }
        );
      }
    });
  }
  
  // Recover subscription button
  const recoverButton = document.getElementById('recover-button');
  if (recoverButton) {
    recoverButton.addEventListener('click', function() {
      const email = document.getElementById('recovery-email-input').value;
      if (email) {
        chrome.runtime.sendMessage(
          { type: 'RECOVER_SUBSCRIPTION', email: email },
          function(response) {
            // Handle response in UI
          }
        );
      }
    });
  }
}); 