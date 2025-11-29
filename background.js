chrome.runtime.onInstalled.addListener(() => {
    // Initialize default settings - extension is now free
    chrome.storage.local.set({
        enabled: true,
        volume: 100,
        equalizer: new Array(10).fill(0),
        preset: 'flat',
        aiEnhancement: {
            noiseReduction: 0,
            audioClarity: 0,
            dynamicRange: 0
        },
        license: {
            isPro: true, // Always Pro - extension is free
            purchaseDate: null
        },
        // Track the last date the fact was viewed and set initial date
        lastFactDate: new Date().toDateString(),
        // Set initial view to true to prevent notification on first install
        initialFactViewed: true
    });

    // Schedule initial badge check
    checkForBadgeNotification();
});

// Check if badge notification should be shown (3+ days since last view)
function checkForBadgeNotification() {
    chrome.storage.local.get(['lastFactDate', 'initialFactViewed'], function(result) {
        // If this is first run, don't show notification
        if (!result.initialFactViewed) {
            chrome.storage.local.set({initialFactViewed: true});
            return;
        }
        
        const today = new Date();
        const lastViewed = new Date(result.lastFactDate);
        
        // Calculate days difference
        const timeDiff = today.getTime() - lastViewed.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        // Only show badge if 3 or more days have passed
        if (daysDiff >= 3) {
            // New fact hasn't been viewed for 3+ days - set badge
            chrome.action.setBadgeText({text: "NEW"});
            chrome.action.setBadgeBackgroundColor({color: "#D32F2F"});
            
        } else {
            // Less than 3 days, ensure badge is cleared
            chrome.action.setBadgeText({text: ""});
        }
    });
}

// Schedule daily checks at midnight
function scheduleNextCheck() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 10, 0); // 00:00:10 tomorrow
    
    const timeUntilMidnight = tomorrow - now;
    
    // Schedule the check
    setTimeout(() => {
        checkForBadgeNotification();
        scheduleNextCheck(); // Schedule next day's check
    }, timeUntilMidnight);
}

// Start the scheduling
scheduleNextCheck();

// Handle license check - DISABLED: Extension is now free
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CHECK_LICENSE') {
        // Always return Pro status - extension is free
        sendResponse({ isPro: true });
        return true;
    }
    
    // Handle payment success from website
    if (request.type === 'PAYMENT_SUCCESS') {
        handlePaymentSuccess(request.data).then(() => {
            sendResponse({ success: true });
        }).catch((error) => {
            console.error('Error handling payment success:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    
    // Handle payment failure from website
    if (request.type === 'PAYMENT_FAILED') {
        handlePaymentFailure(request.data).then(() => {
            sendResponse({ success: true });
        }).catch((error) => {
            console.error('Error handling payment failure:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
});

// Function to handle successful payment
async function handlePaymentSuccess(paymentData) {
    try {
        // Verify payment session
        const result = await chrome.storage.local.get('paymentSession');
        const paymentSession = result.paymentSession;
        
        if (!paymentSession || paymentSession.sessionId !== paymentData.sessionId) {
            throw new Error('Invalid payment session');
        }
        
        // Activate pro license
        await chrome.storage.local.set({
            license: {
                isPro: true,
                purchaseDate: new Date().toISOString(),
                amount: paymentData.amount || 4.99,
                stripePaymentIntentId: paymentData.paymentIntentId,
                sessionId: paymentData.sessionId
            }
        });
        
        // Clear payment session
        await chrome.storage.local.remove('paymentSession');
        
        // Notify popup if it's open
        try {
            await chrome.runtime.sendMessage({
                type: 'PAYMENT_SUCCESS',
                data: paymentData
            });
        } catch (e) {
            // Popup might not be open, that's okay
        }
        
        console.log('Pro license activated successfully');
        
    } catch (error) {
        console.error('Error activating pro license:', error);
        throw error;
    }
}

// Function to handle payment failure
async function handlePaymentFailure(failureData) {
    try {
        // Clear payment session
        await chrome.storage.local.remove('paymentSession');
        
        // Notify popup if it's open
        try {
            await chrome.runtime.sendMessage({
                type: 'PAYMENT_FAILED',
                data: failureData
            });
        } catch (e) {
            // Popup might not be open, that's okay
        }
        
        console.log('Payment failed or cancelled');
        
    } catch (error) {
        console.error('Error handling payment failure:', error);
        throw error;
    }
}

// Handle pro activation
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'ACTIVATE_PRO') {
        // In a real implementation, you would validate the license key
        // For demo purposes, we'll just activate pro mode
        chrome.storage.local.set({
            license: {
                isPro: true,
                purchaseDate: new Date().toISOString()
            }
        }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});

// Handle badge clearing when fact is viewed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'FACT_VIEWED') {
        // Clear the badge
        chrome.action.setBadgeText({text: ""});
        
        // Update the last viewed date
        const today = new Date().toDateString();
        chrome.storage.local.set({lastFactDate: today});
        
        sendResponse({ success: true });
        return true;
    }
});

// Check for new fact when browser starts
chrome.runtime.onStartup.addListener(() => {
    checkForBadgeNotification();
    scheduleNextCheck();
});