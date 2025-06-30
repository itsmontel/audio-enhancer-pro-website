// Enhanced Chrome Extension with Supabase Integration
// This shows how to integrate Supabase with your existing popup.js

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://odlcxblrzhstuoosawea.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbGN4YmxyemhzdHVvb3Nhd2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODI1MDcsImV4cCI6MjA2Njg1ODUwN30.KAMCQjGbRdJhGTKpbUyC4Tt3FPGQAOXOZXkcCB7r0Ac'
const supabase = createClient(supabaseUrl, supabaseKey)

// Enhanced license checking with Supabase
async function checkLicenseStatus() {
    try {
        // First check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
            // No authentication - check local storage for legacy users
            const localLicense = await chrome.storage.local.get('license')
            if (localLicense.license?.isPro) {
                return {
                    isPro: true,
                    source: 'local',
                    requiresAccount: true, // Prompt to create account
                    user: null
                }
            }
            return { isPro: false, requiresAccount: true, user: null }
        }

        // User is authenticated - check Supabase subscription
        const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Subscription check error:', error)
            return { isPro: false, user: session.user, error: error.message }
        }

        return {
            isPro: !!subscription,
            user: session.user,
            subscription: subscription,
            source: 'supabase'
        }

    } catch (error) {
        console.error('License check failed:', error)
        return { isPro: false, error: error.message }
    }
}

// Enhanced payment success handler
async function handlePaymentSuccess(paymentData) {
    try {
        // Check if user is already authenticated
        let { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
            // Create new user account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: paymentData.customerEmail,
                password: generateSecurePassword()
            })
            
            if (authError) {
                throw new Error('Failed to create account: ' + authError.message)
            }
            
            session = authData.session
        }

        // Create or update subscription record
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: session.user.id,
                stripe_customer_id: paymentData.stripeCustomerId,
                stripe_subscription_id: paymentData.stripeSubscriptionId,
                status: 'active',
                amount: paymentData.amount,
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            })
            .select()
            .single()

        if (subError) {
            throw new Error('Failed to create subscription: ' + subError.message)
        }

        // Update local state
        isProUser = true
        subscriptionAmount = paymentData.amount

        // Update UI
        unlockProFeatures()
        updateStatusBadge()
        
        // Show success message with account info
        showStatus(`Payment successful! Signed in as ${session.user.email}`, false)
        
        // Clear payment session
        await chrome.storage.local.remove('paymentSession')

    } catch (error) {
        console.error('Error handling payment success:', error)
        showStatus('Payment succeeded but account setup failed. Please contact support.', true)
    }
}

// User authentication functions
async function signInUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })

        if (error) {
            throw error
        }

        // Update UI after successful login
        await updateUIAfterAuth(data.user)
        return { success: true, user: data.user }

    } catch (error) {
        return { success: false, error: error.message }
    }
}

async function signUpUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        })

        if (error) {
            throw error
        }

        showStatus('Account created! Please check your email to verify.', false)
        return { success: true, user: data.user }

    } catch (error) {
        return { success: false, error: error.message }
    }
}

async function signOutUser() {
    try {
        const { error } = await supabase.auth.signOut()
        
        if (error) {
            throw error
        }

        // Reset to free version
        isProUser = false
        applyFreeVersionRestrictions()
        updateStatusBadge()
        
        // Show login form
        showAuthSection(false)
        
        showStatus('Signed out successfully', false)

    } catch (error) {
        showStatus('Error signing out: ' + error.message, true)
    }
}

// UI Management for Authentication
function showAuthSection(isAuthenticated, user = null) {
    const loginForm = document.getElementById('loginForm')
    const accountInfo = document.getElementById('accountInfo')
    
    if (isAuthenticated && user) {
        loginForm.style.display = 'none'
        accountInfo.style.display = 'block'
        
        document.getElementById('userEmail').textContent = user.email
        updateSubscriptionDisplay()
    } else {
        loginForm.style.display = 'block'
        accountInfo.style.display = 'none'
    }
}

async function updateSubscriptionDisplay() {
    const statusSpan = document.getElementById('subscriptionStatus')
    
    try {
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('status', 'active')
            .single()

        if (subscription) {
            statusSpan.textContent = `Pro - $${subscription.amount}/month`
            statusSpan.style.color = '#4CAF50'
        } else {
            statusSpan.textContent = 'Free Plan'
            statusSpan.style.color = '#666'
        }
    } catch (error) {
        statusSpan.textContent = 'Error loading status'
        statusSpan.style.color = '#f44336'
    }
}

// Enhanced initialization
async function initializeUIWithSupabase() {
    // Check authentication status
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
        showAuthSection(true, session.user)
        
        // Check subscription status
        const licenseStatus = await checkLicenseStatus()
        
        if (licenseStatus.isPro) {
            isProUser = true
            unlockProFeatures()
        } else {
            applyFreeVersionRestrictions()
        }
        
        updateStatusBadge()
    } else {
        showAuthSection(false)
        
        // Check for legacy local license
        const licenseStatus = await checkLicenseStatus()
        if (licenseStatus.source === 'local' && licenseStatus.isPro) {
            // Show migration prompt
            showMigrationPrompt()
        }
    }

    // Set up auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            showAuthSection(true, session.user)
            checkLicenseStatus().then(status => {
                if (status.isPro) {
                    isProUser = true
                    unlockProFeatures()
                    updateStatusBadge()
                }
            })
        } else if (event === 'SIGNED_OUT') {
            showAuthSection(false)
            isProUser = false
            applyFreeVersionRestrictions()
            updateStatusBadge()
        }
    })
}

// Migration helper for legacy users
function showMigrationPrompt() {
    const migrationBanner = document.createElement('div')
    migrationBanner.className = 'migration-banner'
    migrationBanner.innerHTML = `
        <div class="migration-content">
            <h4>🚀 Sync Your Pro License</h4>
            <p>Create an account to sync your Pro features across all devices!</p>
            <button id="migrateLicenseBtn" class="btn btn-primary">Create Account</button>
            <button id="dismissMigrationBtn" class="btn btn-secondary">Maybe Later</button>
        </div>
    `
    
    document.querySelector('.container').prepend(migrationBanner)
    
    // Handle migration
    document.getElementById('migrateLicenseBtn').addEventListener('click', () => {
        // Show signup form with pre-filled benefits
        showMigrationSignup()
    })
    
    document.getElementById('dismissMigrationBtn').addEventListener('click', () => {
        migrationBanner.remove()
    })
}

// Utility functions
function generateSecurePassword() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(36))
        .join('')
}

async function updateUIAfterAuth(user) {
    showAuthSection(true, user)
    
    const licenseStatus = await checkLicenseStatus()
    if (licenseStatus.isPro) {
        isProUser = true
        unlockProFeatures()
        updateStatusBadge()
    }
}

// Event listeners for auth forms
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with Supabase
    initializeUIWithSupabase()
    
    // Login form handlers
    document.getElementById('loginBtn')?.addEventListener('click', async () => {
        const email = document.getElementById('emailInput').value
        const password = document.getElementById('passwordInput').value
        
        if (!email || !password) {
            showStatus('Please enter email and password', true)
            return
        }
        
        const result = await signInUser(email, password)
        if (!result.success) {
            showStatus('Login failed: ' + result.error, true)
        }
    })
    
    document.getElementById('signupBtn')?.addEventListener('click', async () => {
        const email = document.getElementById('emailInput').value
        const password = document.getElementById('passwordInput').value
        
        if (!email || !password) {
            showStatus('Please enter email and password', true)
            return
        }
        
        if (password.length < 6) {
            showStatus('Password must be at least 6 characters', true)
            return
        }
        
        const result = await signUpUser(email, password)
        if (!result.success) {
            showStatus('Signup failed: ' + result.error, true)
        }
    })
    
    document.getElementById('logoutBtn')?.addEventListener('click', signOutUser)
    
    document.getElementById('manageSubscriptionBtn')?.addEventListener('click', () => {
        // Open Stripe customer portal
        chrome.tabs.create({
            url: 'https://audioenhancerpro.com/manage-subscription'
        })
    })
})

export {
    checkLicenseStatus,
    handlePaymentSuccess,
    signInUser,
    signUpUser,
    signOutUser,
    initializeUIWithSupabase
} 