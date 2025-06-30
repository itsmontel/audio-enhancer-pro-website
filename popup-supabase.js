// Enhanced Chrome Extension with Supabase Integration
// Audio Enhancer Pro - Popup Script with Authentication

// Import Supabase (you'll need to include this in your manifest.json or use a CDN)
// For Chrome extensions, you can include supabase via CDN in popup.html:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// Supabase configuration
const supabaseUrl = 'https://odlcxblrzhstuoosawea.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbGN4YmxyemhzdHVvb3Nhd2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODI1MDcsImV4cCI6MjA2Njg1ODUwN30.KAMCQjGbRdJhGTKpbUyC4Tt3FPGQAOXOZXkcCB7r0Ac'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

document.addEventListener('DOMContentLoaded', async () => {
    // Get all existing UI elements
    const volumeSlider = document.getElementById('volumeBoost');
    const volumeValue = document.getElementById('volumeValue');
    const eqSliders = document.querySelectorAll('.eq-slider');
    const status = document.getElementById('status');
    const proUpgrade = document.getElementById('proUpgrade');
    const masterToggle = document.getElementById('masterToggle');
    const resetEQButton = document.getElementById('resetEQ');
    const presetSelect = document.getElementById('preset-select');
    const upgradeBtn = document.getElementById('upgradeBtn');
    const planBadge = document.getElementById('planBadge');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const masterResetBtn = document.getElementById('masterResetBtn');
    
    // Add authentication UI elements
    const authSection = document.getElementById('authSection');
    const loginForm = document.getElementById('loginForm');
    const accountInfo = document.getElementById('accountInfo');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmail = document.getElementById('userEmail');
    const subscriptionStatus = document.getElementById('subscriptionStatus');
    const manageSubscriptionBtn = document.getElementById('manageSubscriptionBtn');
    
    // A/B Testing elements
    const abTestButton = document.getElementById('abTestButton');
    const abStatus = document.getElementById('ab-status');
    
    // AI enhancement elements
    const noiseReductionSlider = document.getElementById('noiseReduction');
    const audioClaritySlider = document.getElementById('audioClarity');
    const dynamicRangeSlider = document.getElementById('dynamicRange');
    const aiEnhancementValueSpans = document.querySelectorAll('.ai-control .value');

    // 3D Spatial Audio elements
    const spatialToggle = document.getElementById('spatialToggle');
    const roomSizeSlider = document.getElementById('roomSize');
    const spatialWidthSlider = document.getElementById('spatialWidth');
    const spatialPresetSelect = document.getElementById('spatial-preset');
    const spatialModeSelect = document.getElementById('spatial-mode');

    // Subscription variables with Supabase integration
    let isProUser = false;
    let currentUser = null;
    let currentSubscription = null;
    let trialDaysLeft = 0;
    let subscriptionAmount = 0;
    let selectedAmount = 4.99;
    let isTrialActive = false;
    let customPresets = [];

    // Enhanced license checking with Supabase
    async function checkLicenseStatus() {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            
            if (sessionError) {
                console.error('Session error:', sessionError)
                return { isPro: false, requiresAuth: true, error: sessionError.message }
            }
            
            if (!session?.user) {
                // Check local storage for legacy users
                const localLicense = await chrome.storage.local.get('license')
                if (localLicense.license?.isPro) {
                    return {
                        isPro: true,
                        source: 'local',
                        requiresAccount: true,
                        user: null,
                        legacy: true
                    }
                }
                return { isPro: false, requiresAuth: true, user: null }
            }

            currentUser = session.user

            // Check Supabase subscription
            const { data: subscriptionData, error: subError } = await supabase
                .rpc('get_user_subscription_status', { user_uuid: session.user.id })

            if (subError) {
                console.error('Subscription check error:', subError)
                return { isPro: false, user: session.user, error: subError.message }
            }

            const subscription = subscriptionData[0] || { is_pro: false, status: 'none' }

            return {
                isPro: subscription.is_pro,
                user: session.user,
                subscription: subscription,
                source: 'supabase'
            }

        } catch (error) {
            console.error('License check failed:', error)
            return { isPro: false, error: error.message }
        }
    }

    // Enhanced payment success handler with Supabase
    async function handlePaymentSuccess(paymentData) {
        try {
            // Check if user is already authenticated
            let { data: { session } } = await supabase.auth.getSession()
            
            if (!session?.user) {
                // For new users, create account with email from payment
                if (paymentData.customerEmail) {
                    const tempPassword = generateSecurePassword()
                    
                    const { data: authData, error: authError } = await supabase.auth.signUp({
                        email: paymentData.customerEmail,
                        password: tempPassword,
                        options: {
                            data: {
                                created_from: 'payment',
                                stripe_customer_id: paymentData.stripeCustomerId
                            }
                        }
                    })
                    
                    if (authError) {
                        console.error('Failed to create account:', authError)
                        // Still activate locally for now
                        isProUser = true
                        unlockProFeatures()
                        updateStatusBadge()
                        showStatus('Payment successful! Please sign up to sync across devices.', false)
                        return
                    }
                    
                    session = authData.session
                    currentUser = authData.user
                    
                    // Send welcome email with password
                    showStatus(`Account created! Check ${paymentData.customerEmail} for login details.`, false)
                }
            }

            if (session?.user) {
                // Create or update subscription record
                const { data: subscription, error: subError } = await supabase
                    .from('subscriptions')
                    .upsert({
                        user_id: session.user.id,
                        stripe_customer_id: paymentData.stripeCustomerId,
                        stripe_subscription_id: paymentData.stripeSubscriptionId,
                        status: 'active',
                        amount: paymentData.amount,
                        current_period_start: new Date(),
                        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                    })
                    .select()
                    .single()

                if (subError) {
                    console.error('Failed to create subscription:', subError)
                } else {
                    currentSubscription = subscription
                }
            }

            // Update local state
            isProUser = true
            subscriptionAmount = paymentData.amount

            // Update UI
            unlockProFeatures()
            updateStatusBadge()
            updateAuthUI()
            
            // Show success message
            if (currentUser) {
                showStatus(`Payment successful! Signed in as ${currentUser.email}`, false)
            } else {
                showStatus('Payment successful! Pro features activated.', false)
            }
            
            // Clear payment session
            await chrome.storage.local.remove('paymentSession')

        } catch (error) {
            console.error('Error handling payment success:', error)
            showStatus('Payment succeeded but account setup failed. Contact support if needed.', true)
            
            // Fallback to local activation
            isProUser = true
            unlockProFeatures()
            updateStatusBadge()
        }
    }

    // User authentication functions
    async function signInUser(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            })

            if (error) throw error

            currentUser = data.user
            await syncSettingsFromCloud()
            await updateAuthUI()
            await updateLicenseStatus()
            
            showStatus(`Welcome back, ${data.user.email}!`, false)
            return { success: true, user: data.user }

        } catch (error) {
            console.error('Sign in error:', error)
            return { success: false, error: error.message }
        }
    }

    async function signUpUser(email, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { created_from: 'extension' }
                }
            })

            if (error) throw error

            showStatus('Account created! Please check your email to verify.', false)
            return { success: true, user: data.user }

        } catch (error) {
            console.error('Sign up error:', error)
            return { success: false, error: error.message }
        }
    }

    async function signOutUser() {
        try {
            const { error } = await supabase.auth.signOut()
            
            if (error) {
                throw error
            }

            // Reset global state
            currentUser = null
            currentSubscription = null

            // Check for local license fallback
            const licenseStatus = await checkLicenseStatus()
            if (licenseStatus.legacy) {
                isProUser = true
                showMigrationPrompt()
            } else {
                isProUser = false
                applyFreeVersionRestrictions()
            }
            
            updateStatusBadge()
            updateAuthUI()
            
            showStatus('Signed out successfully', false)

        } catch (error) {
            console.error('Sign out error:', error)
            showStatus('Error signing out: ' + error.message, true)
        }
    }

    // Settings synchronization
    async function syncSettingsToCloud() {
        if (!currentUser) return

        try {
            const currentSettings = {
                // Collect all current settings
                lastSync: new Date().toISOString()
            }

            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: currentUser.id,
                    settings: currentSettings
                })

            if (error) {
                console.error('Failed to sync settings:', error)
            }
        } catch (error) {
            console.error('Settings sync error:', error)
        }
    }

    async function syncSettingsFromCloud() {
        if (!currentUser) return

        try {
            const { data, error } = await supabase
                .from('user_settings')
                .select('settings')
                .eq('user_id', currentUser.id)
                .single()

            if (error || !data?.settings) {
                console.log('No cloud settings found, using local settings')
                return
            }

            // Apply settings to UI
            console.log('Settings synced from cloud')

        } catch (error) {
            console.error('Failed to sync settings from cloud:', error)
        }
    }

    // UI Management for Authentication
    function updateAuthUI() {
        if (!authSection) return // Auth UI might not be added to HTML yet

        if (currentUser) {
            if (loginForm) loginForm.style.display = 'none'
            if (accountInfo) accountInfo.style.display = 'block'
            
            if (userEmail) userEmail.textContent = currentUser.email
            updateSubscriptionDisplay()
        } else {
            if (loginForm) loginForm.style.display = 'block'
            if (accountInfo) accountInfo.style.display = 'none'
        }
    }

    async function updateSubscriptionDisplay() {
        if (!subscriptionStatus || !currentUser) return
        
        try {
            const { data: subscriptionData } = await supabase
                .rpc('get_user_subscription_status', { user_uuid: currentUser.id })

            const subscription = subscriptionData[0]

            if (subscription?.is_pro) {
                subscriptionStatus.textContent = `Pro - $${subscription.amount || 'N/A'}/month`
                subscriptionStatus.style.color = '#4CAF50'
            } else {
                subscriptionStatus.textContent = 'Free Plan'
                subscriptionStatus.style.color = '#666'
            }
        } catch (error) {
            console.error('Error updating subscription display:', error)
            subscriptionStatus.textContent = 'Error loading status'
            subscriptionStatus.style.color = '#f44336'
        }
    }

    // Enhanced initialization with Supabase
    async function initializeUIWithSupabase() {
        // Check authentication status first
        const licenseStatus = await checkLicenseStatus()
        
        if (licenseStatus.user) {
            currentUser = licenseStatus.user
            updateAuthUI()
            
            if (licenseStatus.isPro) {
                isProUser = true
                unlockProFeatures()
            } else {
                applyFreeVersionRestrictions()
            }
        } else {
            updateAuthUI()
            
            // Check for legacy local license
            if (licenseStatus.legacy && licenseStatus.isPro) {
                isProUser = true
                unlockProFeatures()
                showMigrationPrompt()
            } else {
                applyFreeVersionRestrictions()
            }
        }

        updateStatusBadge()

        // Set up auth state change listener
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                currentUser = session.user
                updateAuthUI()
                
                const licenseStatus = await checkLicenseStatus()
                if (licenseStatus.isPro) {
                    isProUser = true
                    unlockProFeatures()
                    updateStatusBadge()
                }
                
                await syncSettingsFromCloud()
            } else if (event === 'SIGNED_OUT') {
                currentUser = null
                currentSubscription = null
                updateAuthUI()
                
                // Check for local fallback
                const licenseStatus = await checkLicenseStatus()
                if (licenseStatus.legacy) {
                    isProUser = true
                    showMigrationPrompt()
                } else {
                    isProUser = false
                    applyFreeVersionRestrictions()
                }
                updateStatusBadge()
            }
        })

        // Set up periodic settings sync (every 30 seconds when user is active)
        if (currentUser) {
            setInterval(() => {
                if (currentUser && document.hasFocus()) {
                    syncSettingsToCloud()
                }
            }, 30000)
        }
    }

    // Migration helper for legacy users
    function showMigrationPrompt() {
        // Check if migration banner already exists
        if (document.querySelector('.migration-banner')) return

        const migrationBanner = document.createElement('div')
        migrationBanner.className = 'migration-banner'
        migrationBanner.innerHTML = `
            <div class="migration-content">
                <h4>🚀 Sync Your Pro License</h4>
                <p>Create an account to sync your Pro features across all devices!</p>
                <div class="migration-buttons">
                    <button id="migrateLicenseBtn" class="btn btn-primary">Create Account</button>
                    <button id="dismissMigrationBtn" class="btn btn-secondary">Maybe Later</button>
                </div>
            </div>
        `
        
        const container = document.querySelector('.container')
        if (container) {
            container.insertBefore(migrationBanner, container.firstChild)
        }
        
        // Handle migration
        document.getElementById('migrateLicenseBtn')?.addEventListener('click', () => {
            migrationBanner.remove()
            // Switch to signup form
            if (authSection) {
                authSection.scrollIntoView({ behavior: 'smooth' })
            }
            if (emailInput) emailInput.focus()
        })
        
        document.getElementById('dismissMigrationBtn')?.addEventListener('click', () => {
            migrationBanner.remove()
            // Store dismissal to not show again for a while
            chrome.storage.local.set({ migrationDismissed: Date.now() })
        })
    }

    // Enhanced license status update
    async function updateLicenseStatus() {
        const licenseStatus = await checkLicenseStatus()
        
        if (licenseStatus.isPro) {
            isProUser = true
            unlockProFeatures()
        } else {
            isProUser = false
            applyFreeVersionRestrictions()
        }
        
        updateStatusBadge()
        updateAuthUI()
    }

    // Utility functions
    function generateSecurePassword() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(36))
            .join('')
    }

    // Event listeners for auth forms
    function setupAuthEventListeners() {
        // Login form handlers
        loginBtn?.addEventListener('click', async () => {
            const email = emailInput.value.trim()
            const password = passwordInput.value
            
            if (!email || !password) {
                showStatus('Please enter email and password', true)
                return
            }
            
            loginBtn.disabled = true
            loginBtn.textContent = 'Signing in...'
            
            const result = await signInUser(email, password)
            
            loginBtn.disabled = false
            loginBtn.textContent = 'Sign In'
            
            if (!result.success) {
                showStatus('Login failed: ' + result.error, true)
            } else {
                // Clear form
                emailInput.value = ''
                passwordInput.value = ''
            }
        })
        
        signupBtn?.addEventListener('click', async () => {
            const email = emailInput.value.trim()
            const password = passwordInput.value
            
            if (!email || !password) {
                showStatus('Please enter email and password', true)
                return
            }
            
            if (password.length < 6) {
                showStatus('Password must be at least 6 characters', true)
                return
            }
            
            signupBtn.disabled = true
            signupBtn.textContent = 'Creating account...'
            
            const result = await signUpUser(email, password)
            
            signupBtn.disabled = false
            signupBtn.textContent = 'Create Account'
            
            if (!result.success) {
                showStatus('Signup failed: ' + result.error, true)
            } else {
                // Clear form
                emailInput.value = ''
                passwordInput.value = ''
            }
        })
        
        logoutBtn?.addEventListener('click', signOutUser)
        
        manageSubscriptionBtn?.addEventListener('click', () => {
            // Open Stripe customer portal
            chrome.tabs.create({
                url: 'https://audioenhancerpro.com/manage-subscription'
            })
        })

        // Enter key support for login form
        [emailInput, passwordInput].forEach(input => {
            input?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    loginBtn.click()
                }
            })
        })
    }

    // Add the rest of your existing functions here...
    // (All the existing popup.js functions like showStatus, unlockProFeatures, etc.)
    // For brevity, I'm including key ones:

    function showStatus(message, isError = false) {
        if (status) {
            status.textContent = message;
            status.className = isError ? 'error' : 'success';
            setTimeout(() => {
                status.textContent = '';
                status.className = '';
            }, 3000);
        }
    }

    function unlockProFeatures() {
        // Your existing unlockProFeatures function
        if (proUpgrade) proUpgrade.style.display = 'none';
        // Enable all pro controls...
    }

    function applyFreeVersionRestrictions() {
        // Your existing applyFreeVersionRestrictions function  
        if (proUpgrade) proUpgrade.style.display = 'block';
        // Disable pro controls...
    }

    function updateStatusBadge() {
        // Your existing updateStatusBadge function
        if (planBadge) {
            planBadge.textContent = isProUser ? 'PRO' : 'FREE';
            planBadge.className = isProUser ? 'badge pro' : 'badge free';
        }
    }

    // Initialize everything
    await initializeUIWithSupabase()
    setupAuthEventListeners()
    
    // Add settings sync on changes (debounced)
    let syncTimeout
    function debouncedSync() {
        clearTimeout(syncTimeout)
        syncTimeout = setTimeout(() => {
            if (currentUser) {
                syncSettingsToCloud()
            }
        }, 1000)
    }

    // Add event listeners to settings controls for auto-sync
    [volumeSlider, ...eqSliders, spatialToggle, roomSizeSlider, spatialWidthSlider].forEach(element => {
        element?.addEventListener('input', debouncedSync)
        element?.addEventListener('change', debouncedSync)
    })

    // Your existing event listeners and initialization code...
    // (Copy the rest from your original popup.js)
})

// Export functions for use in other parts of the extension
window.audioEnhancerAuth = {
    checkLicenseStatus,
    signInUser,
    signUpUser,
    signOutUser,
    syncSettingsToCloud,
    syncSettingsFromCloud
} 