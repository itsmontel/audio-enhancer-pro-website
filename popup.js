document.addEventListener('DOMContentLoaded', async () => {
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
    const roomSizeValueSpan = roomSizeSlider.nextElementSibling;
    const spatialWidthValueSpan = spatialWidthSlider.nextElementSibling;

    // Elements for payment UI
    const paymentSection = document.getElementById('paymentSection');
    const trialSection = document.getElementById('trialSection');
    const subscriptionSection = document.getElementById('subscriptionSection');
    const priceOptions = document.querySelectorAll('.price-option');
    const customPriceSection = document.getElementById('customPriceSection');
    const customPriceInput = document.getElementById('customPrice');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    const changeSubscriptionBtn = document.getElementById('changeSubscriptionBtn');
    const currentAmountSpan = document.getElementById('currentAmount');
    const upgradeTitle = document.getElementById('upgradeTitle');
    const upgradeDesc = document.getElementById('upgradeDesc');
    
    // Custom preset elements
    const savePresetBtn = document.getElementById('savePresetBtn');
    const managePresetsBtn = document.getElementById('managePresetsBtn');
    const savePresetModal = document.getElementById('savePresetModal');
    const managePresetsModal = document.getElementById('managePresetsModal');
    const presetNameInput = document.getElementById('presetName');
    const confirmSavePresetBtn = document.getElementById('confirmSavePreset');
    const cancelSavePresetBtn = document.getElementById('cancelSavePreset');
    const closeManagePresetsBtn = document.getElementById('closeManagePresets');
    const presetsList = document.getElementById('presetsList');
    const noPresetsMessage = document.getElementById('noPresetsMessage');
    const overwriteWarning = document.querySelector('.overwrite-warning');

    // EQ enhancement variables
    let dbIndicator = null;
    let indicatorTimeout = null;
    let eqFills = {
        boost: [],
        cut: []
    };
    
    // A/B testing variables
    let isListeningToOriginal = false;
    let savedEQSettings = null;
    let savedPresetValue = null;  // Added to store the original preset value

    // Subscription variables
    let isProUser = false; // Default to free version
    let trialDaysLeft = 0;
    let subscriptionAmount = 0;
    let selectedAmount = 4.99; // Default selected amount
    let isTrialActive = false;
    
    // Custom presets array - will be populated from storage
    let customPresets = [];
    
    // Track if a preset is currently being edited
    let editingPresetIndex = -1;

    // Create the dB level indicator
    function createDbIndicator() {
        if (!dbIndicator) {
            dbIndicator = document.createElement('div');
            dbIndicator.className = 'db-level-indicator';
            document.body.appendChild(dbIndicator);
        }
        return dbIndicator;
    }

    // Show dB level indicator next to a slider
    function showDbIndicator(slider, value) {
        const indicator = createDbIndicator();
        const rect = slider.getBoundingClientRect();
        
        // Calculate position (0dB is in middle, -12dB at bottom, +12dB at top)
        const normalizedValue = (parseFloat(value) + 12) / 24; // Convert -12..12 to 0..1
        const posY = rect.top + (1 - normalizedValue) * rect.height;
        
        // Position indicator to the right of the slider with some offset
        indicator.style.left = `${rect.right + 8}px`;
        indicator.style.top = `${posY - 10}px`; // Center with thumb

        // Set indicator text
        const formattedValue = value > 0 ? `+${value} dB` : `${value} dB`;
        indicator.textContent = formattedValue;
        
        // Apply boost/cut styling
        indicator.classList.remove('boost', 'cut');
        if (value > 0) {
            indicator.classList.add('boost');
        } else if (value < 0) {
            indicator.classList.add('cut');
        }
        
        // Show the indicator
        indicator.classList.add('visible');
        
        // Clear previous timeout
        if (indicatorTimeout) {
            clearTimeout(indicatorTimeout);
        }
        
        // Hide after 1.5 seconds
        indicatorTimeout = setTimeout(() => {
            indicator.classList.remove('visible');
        }, 1500);
    }

    // Create zero line and fill elements for EQ sliders
    function createEQVisualElements() {
        const bands = document.querySelectorAll('.eq-band');
        
        bands.forEach((band, index) => {
            // Create zero reference line
            const zeroLine = document.createElement('div');
            zeroLine.className = 'eq-zero-line';
            band.appendChild(zeroLine);
            
            // Create boost fill (above zero line)
            const boostFill = document.createElement('div');
            boostFill.className = 'eq-fill-boost';
            band.appendChild(boostFill);
            eqFills.boost[index] = boostFill;
            
            // Create cut fill (below zero line)
            const cutFill = document.createElement('div');
            cutFill.className = 'eq-fill-cut';
            band.appendChild(cutFill);
            eqFills.cut[index] = cutFill;
            
            // Initialize fill based on slider value
            const slider = band.querySelector('.eq-slider');
            updateEQFill(slider, index);
        });
    }

    // Update EQ fill based on slider value
    function updateEQFill(slider, index) {
        const value = parseFloat(slider.value);
        const boostFill = eqFills.boost[index];
        const cutFill = eqFills.cut[index];
        
        if (value === 0) {
            // Reset fills at 0 dB
            boostFill.style.height = '0';
            boostFill.style.opacity = '0';
            cutFill.style.height = '0';
            cutFill.style.opacity = '0';
            return;
        }
        
        if (value > 0) {
            // Boosting - fill above zero line
            const height = (value / 12) * 50; // Proportional to slider value (50% height = max)
            const intensity = value / 12; // 0 to 1
            const opacity = 0.3 + (0.7 * intensity); // Higher value = more opaque
            const greenValue = Math.max(60, 175 - (intensity * 75)); // Darker green for higher values
            
            boostFill.style.height = `${height}%`;
            boostFill.style.opacity = '1';
            boostFill.style.backgroundColor = `rgba(76, ${greenValue}, 80, ${opacity})`;
            
            // Hide cut fill
            cutFill.style.height = '0';
            cutFill.style.opacity = '0';
        } else {
            // Cutting - fill below zero line
            const height = (Math.abs(value) / 12) * 50; // Proportional to slider value
            const intensity = Math.abs(value) / 12; // 0 to 1
            const opacity = 0.3 + (0.7 * intensity); // Higher value = more opaque
            const redValue = Math.max(180, 244 - (intensity * 60)); // Darker red for higher values
            
            cutFill.style.height = `${height}%`;
            cutFill.style.opacity = '1';
            cutFill.style.backgroundColor = `rgba(${redValue}, 67, 54, ${opacity})`;
            
            // Hide boost fill
            boostFill.style.height = '0';
            boostFill.style.opacity = '0';
        }
    }

    // Function to check license status
    async function checkLicenseStatus() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: 'CHECK_LICENSE' }, (response) => {
                isProUser = response?.isPro || false;
                
                // Check trial status and update UI
                if (response) {
                    checkTrialStatus({
                        isTrialActive: response.isTrialActive, 
                        trialEndDate: response.trialEndDate,
                        subscriptionAmount: response.subscriptionAmount
                    });
                }
                
                resolve(isProUser);
            });
        });
    }

    // Function to check trial status and update UI accordingly
    function checkTrialStatus(licenseData) {
        if (!licenseData) return;
        
        const now = new Date();
        const trialEndDate = licenseData.trialEndDate ? new Date(licenseData.trialEndDate) : null;
        subscriptionAmount = licenseData.subscriptionAmount || 0;
        isTrialActive = licenseData.isTrialActive || false;
        
        // Calculate days left in trial
        if (trialEndDate) {
            const diffTime = trialEndDate - now;
            trialDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        
        // Update UI based on subscription status
        if (subscriptionAmount > 0) {
            // User has an active subscription
            trialSection.style.display = 'none';
            paymentSection.style.display = 'none';
            subscriptionSection.style.display = 'block';
            
            currentAmountSpan.textContent = `$${subscriptionAmount.toFixed(2)}`;
            upgradeTitle.textContent = 'Pro Subscription Active';
            upgradeDesc.textContent = 'Thank you for supporting Audio Enhancer Pro!';
        } else if (isTrialActive && trialDaysLeft > 0) {
            // User is in trial period
            trialSection.style.display = 'block';
            paymentSection.style.display = 'none';
            subscriptionSection.style.display = 'none';
            
            // Add trial days counter
            const trialButtonText = trialDaysLeft <= 2 
                ? `<i class="fas fa-crown"></i> Trial Active <span id="trialCounter" class="trial-ending">${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left</span>`
                : `<i class="fas fa-crown"></i> Trial Active <span id="trialCounter">${trialDaysLeft} days left</span>`;
                
            upgradeBtn.innerHTML = trialButtonText;
            upgradeBtn.disabled = false;
            upgradeTitle.textContent = 'Pro Trial Active';
            upgradeDesc.textContent = 'Enjoying all premium features for free!';
        } else if (isTrialActive && trialDaysLeft <= 0) {
            // Trial has ended, show payment options
            trialSection.style.display = 'none';
            paymentSection.style.display = 'block';
            subscriptionSection.style.display = 'none';
            
            upgradeTitle.textContent = 'Trial Ended';
            upgradeDesc.textContent = 'Choose your subscription price to continue using Pro features.';
        } else {
            // No trial, no subscription (shouldn't happen with auto-trial, but just in case)
            trialSection.style.display = 'block';
            paymentSection.style.display = 'none';
            subscriptionSection.style.display = 'none';
            
            upgradeBtn.innerHTML = `<i class="fas fa-crown"></i> Start 7-Day Free Trial`;
            upgradeBtn.disabled = false;
        }
    }

    // Function to activate pro version (for demo purposes)
    async function activateProVersion() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: 'ACTIVATE_PRO' }, (response) => {
                isProUser = true;
                resolve(response?.success || false);
            });
        });
    }

    function showStatus(message, isError = false) {
        console.log('[Audio Enhancer Debug] Status:', message, isError ? '(error)' : '');
        status.textContent = message;
        status.style.color = isError ? '#f44336' : '#4CAF50';
        status.style.opacity = '1';
        setTimeout(() => {
            status.style.opacity = '0';
        }, 3000);
    }

    // Function to apply free version restrictions
    function applyFreeVersionRestrictions() {
        // 1. Limit volume to 150%
        volumeSlider.max = 150;
        if (volumeSlider.value > 150) {
            volumeSlider.value = 150;
            volumeValue.textContent = "150%";
        }
        
        // 2. Lock presets (only allow 'flat')
        const presetOptions = presetSelect.querySelectorAll('option');
        presetOptions.forEach(option => {
            if (option.value !== 'flat' && !option.dataset.custom) {
                option.disabled = true;
                option.textContent += ' (Pro)';
            }
        });
        presetSelect.value = 'flat'; // Enforce flat preset
        
        // 3. Disable AI enhancement controls
        if (noiseReductionSlider) noiseReductionSlider.disabled = true;
        if (audioClaritySlider) audioClaritySlider.disabled = true;
        if (dynamicRangeSlider) dynamicRangeSlider.disabled = true;
        
        // 4. Show upgrade section
        proUpgrade.style.display = 'block';
        
        // 5. Keep the PRO badges visible
        document.querySelectorAll('.pro-feature').forEach(badge => {
            badge.style.display = 'inline-block';
        });
        
        // 6. Add pro-only class to AI enhancement section
        document.querySelector('.ai-enhancement').classList.add('pro-only');
        
        // 7. Disable 3D Spatial Audio controls
        if (spatialToggle) spatialToggle.disabled = true;
        if (roomSizeSlider) roomSizeSlider.disabled = true;
        if (spatialWidthSlider) spatialWidthSlider.disabled = true;
        if (spatialPresetSelect) spatialPresetSelect.disabled = true;
        if (spatialModeSelect) spatialModeSelect.disabled = true;
        
        // 8. Add pro-only class to 3D Spatial Audio section
        document.querySelector('.spatial-audio').classList.add('pro-only');
    }

    // Function to unlock pro features
    function unlockProFeatures() {
        // 1. Unlock volume to 500%
        volumeSlider.max = 500;
        
        // 2. Unlock all presets
        const presetOptions = presetSelect.querySelectorAll('option');
        presetOptions.forEach(option => {
            if (!option.dataset.custom) {
                option.disabled = false;
                option.textContent = option.textContent.replace(' (Pro)', '');
            }
        });
        
        // 3. Enable AI enhancement controls
        if (noiseReductionSlider) noiseReductionSlider.disabled = false;
        if (audioClaritySlider) audioClaritySlider.disabled = false;
        if (dynamicRangeSlider) dynamicRangeSlider.disabled = false;
        
        // 4. Hide upgrade section
        proUpgrade.style.display = 'none';
        
        // 5. Hide the PRO badges
        document.querySelectorAll('.pro-feature').forEach(badge => {
            badge.style.display = 'none';
        });
        
        // 6. Remove pro-only classes
        document.querySelectorAll('.pro-only').forEach(element => {
            element.classList.remove('pro-only');
        });
        
        // 7. Enable 3D Spatial Audio controls
        if (spatialToggle) spatialToggle.disabled = false;
        if (roomSizeSlider) roomSizeSlider.disabled = false;
        if (spatialWidthSlider) spatialWidthSlider.disabled = false;
        if (spatialPresetSelect) spatialPresetSelect.disabled = false;
        if (spatialModeSelect) spatialModeSelect.disabled = false;
    }

    async function isPageSupported() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const supported = tab?.url && (tab.url.startsWith('http:') || tab.url.startsWith('https:'));
            return supported;
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error checking page:', error);
            return false;
        }
    }

    async function waitForContentScript(tabId, maxAttempts = 5) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
                if (response?.success) {
                    return true;
                }
            } catch (error) {
                if (attempt === maxAttempts - 1) {
                    throw new Error('Could not connect to the page. Please refresh and try again.');
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        return false;
    }

    async function sendMessage(message) {
        try {
            if (!await isPageSupported()) {
                throw new Error('Please open a regular website to use the audio controls.');
            }

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) {
                throw new Error('No active tab found.');
            }

            await waitForContentScript(tab.id);
            
            const response = await chrome.tabs.sendMessage(tab.id, message);
            if (!response?.success) {
                throw new Error(response?.error || 'Unknown error');
            }
            return response;
        } catch (error) {
            console.error('[Audio Enhancer Debug] Message send error:', error);
            throw error;
        }
    }

    // Helper functions for 3D spatial audio labels
    function updateRoomSizeLabel(value) {
        // Convert numeric value to descriptive text
        let label;
        if (value < 20) {
            label = 'Tiny';
        } else if (value < 40) {
            label = 'Small';
        } else if (value < 60) {
            label = 'Medium';
        } else if (value < 80) {
            label = 'Large';
        } else {
            label = 'Huge';
        }
        roomSizeValueSpan.textContent = label;
    }
    
    function updateSpatialWidthLabel(value) {
        // Convert numeric value to descriptive text
        let label;
        if (value < 25) {
            label = 'Narrow';
        } else if (value < 45) {
            label = 'Focused';
        } else if (value < 55) {
            label = 'Normal';
        } else if (value < 75) {
            label = 'Wide';
        } else {
            label = 'Expansive';
        }
        spatialWidthValueSpan.textContent = label;
    }
    
    // Load custom presets from storage
    async function loadCustomPresets() {
        try {
            const result = await chrome.storage.local.get('customPresets');
            customPresets = result.customPresets || [];
            
            // Update the preset dropdown with custom presets
            updateCustomPresetsInDropdown();
            
            console.log('[Audio Enhancer Debug] Loaded custom presets:', customPresets);
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error loading custom presets:', error);
        }
    }
    
    // Update the preset dropdown with custom presets
    function updateCustomPresetsInDropdown() {
        // Clear existing custom presets from dropdown
        const options = presetSelect.querySelectorAll('option');
        options.forEach(option => {
            if (option.dataset.custom === 'true') {
                option.remove();
            }
        });
        
        // Get the divider option
        const dividerOption = presetSelect.querySelector('option[disabled]:not([value="custom"])');
        
        // Add custom presets before the divider
        if (customPresets && customPresets.length > 0) {
            customPresets.forEach((preset, index) => {
                const option = document.createElement('option');
                option.value = `custom-${index}`;
                option.textContent = preset.name;
                option.dataset.custom = 'true';
                option.classList.add('custom-preset-label');
                presetSelect.insertBefore(option, dividerOption);
            });
        }
    }
    
    // Apply a custom preset
    async function applyCustomPreset(index) {
        try {
            const preset = customPresets[index];
            if (!preset) return;
            
            // Apply equalizer settings
            if (preset.equalizer) {
                eqSliders.forEach((slider, idx) => {
                    const value = preset.equalizer[idx] || 0;
                    slider.value = value;
                    
                    // Update the fill visualization
                    updateEQFill(slider, idx);
                    
                    // Send updates to content script
                    sendMessage({
                        type: 'SET_EQ',
                        index: idx,
                        value: value
                    });
                });
                
                // Save the equalizer settings
                await chrome.storage.local.set({ 
                    equalizer: preset.equalizer,
                    preset: `custom-${index}`
                });
            }
            
            // Apply volume if it exists
            if (preset.volume && volumeSlider) {
                let value = preset.volume;
                
                // If free user tries to exceed 150%, cap it
                if (!isProUser && value > 150) {
                    value = 150;
                    showStatus('Upgrade to Pro for volume boost up to 500%!', true);
                }
                
                volumeSlider.value = value;
                volumeValue.textContent = `${value}%`;
                
                await sendMessage({
                    type: 'SET_VOLUME',
                    value: parseFloat(value)
                });
                
                await chrome.storage.local.set({ volume: value });
            }
            
            // Apply AI enhancement settings if pro user
            if (isProUser && preset.aiEnhancement) {
                // Noise reduction
                if (preset.aiEnhancement.noiseReduction !== undefined && noiseReductionSlider) {
                    const value = preset.aiEnhancement.noiseReduction;
                    noiseReductionSlider.value = value;
                    aiEnhancementValueSpans[0].textContent = `${value}%`;
                    
                    await sendMessage({
                        type: 'SET_AI_ENHANCEMENT',
                        feature: 'noiseReduction',
                        value: value
                    });
                }
                
                // Audio clarity
                if (preset.aiEnhancement.audioClarity !== undefined && audioClaritySlider) {
                    const value = preset.aiEnhancement.audioClarity;
                    audioClaritySlider.value = value;
                    aiEnhancementValueSpans[1].textContent = `${value}%`;
                    
                    await sendMessage({
                        type: 'SET_AI_ENHANCEMENT',
                        feature: 'audioClarity',
                        value: value
                    });
                }
                
                // Dynamic range
                if (preset.aiEnhancement.dynamicRange !== undefined && dynamicRangeSlider) {
                    const value = preset.aiEnhancement.dynamicRange;
                    dynamicRangeSlider.value = value;
                    aiEnhancementValueSpans[2].textContent = `${value}%`;
                    
                    await sendMessage({
                        type: 'SET_AI_ENHANCEMENT',
                        feature: 'dynamicRange',
                        value: value
                    });
                }
                
                // Save AI enhancement settings
                await chrome.storage.local.set({ 
                    aiEnhancement: preset.aiEnhancement
                });
            }
            
            // Apply spatial audio settings if pro user
            if (isProUser && preset.spatialEnabled !== undefined && spatialToggle) {
                spatialToggle.checked = preset.spatialEnabled;
                
                // Show/hide controls based on toggle state
                document.querySelector('.spatial-controls').style.display = 
                    preset.spatialEnabled ? 'block' : 'none';
                
                await sendMessage({
                    type: 'SET_SPATIAL_ENABLED',
                    value: preset.spatialEnabled
                });
                
                await chrome.storage.local.set({ spatialEnabled: preset.spatialEnabled });
                
                // If spatial is enabled, apply other spatial settings
                if (preset.spatialEnabled) {
                    setTimeout(async () => {
                        // First apply spatial mode if available
                        if (preset.spatialMode && spatialModeSelect) {
                            spatialModeSelect.value = preset.spatialMode;
                            
                            await sendMessage({
                                type: 'SET_SPATIAL_MODE',
                                value: preset.spatialMode
                            });
                            
                            await chrome.storage.local.set({ spatialMode: preset.spatialMode });
                        }
                        
                        // Apply room size
                        if (preset.roomSize !== undefined && roomSizeSlider) {
                            roomSizeSlider.value = preset.roomSize;
                            updateRoomSizeLabel(preset.roomSize);
                            
                            await sendMessage({
                                type: 'SET_ROOM_SIZE', 
                                value: preset.roomSize
                            });
                            
                            await chrome.storage.local.set({ roomSize: preset.roomSize });
                        }
                        
                        // Apply spatial width
                        if (preset.spatialWidth !== undefined && spatialWidthSlider) {
                            spatialWidthSlider.value = preset.spatialWidth;
                            updateSpatialWidthLabel(preset.spatialWidth);
                            
                            await sendMessage({
                                type: 'SET_SPATIAL_WIDTH',
                                value: preset.spatialWidth
                            });
                            
                            await chrome.storage.local.set({ spatialWidth: preset.spatialWidth });
                        }
                    }, 300);
                }
            }
            
            showStatus(`Applied preset: ${preset.name}`);
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error applying custom preset:', error);
            showStatus('Error applying preset', true);
        }
    }
    
    // Save current settings as a custom preset
    async function saveCustomPreset(name) {
        try {
            const presetIndex = findPresetIndexByName(name);
            const isOverwriting = presetIndex >= 0;
            
            // Get current settings
            const currentVolume = parseInt(volumeSlider.value);
            
            // Get EQ settings
            const eqSettings = [];
            eqSliders.forEach(slider => {
                eqSettings.push(parseFloat(slider.value));
            });
            
            // Create preset object
            const preset = {
                name: name,
                volume: currentVolume,
                equalizer: eqSettings,
                dateCreated: new Date().toISOString()
            };
            
            // Add AI enhancement settings if pro user
            if (isProUser) {
                preset.aiEnhancement = {
                    noiseReduction: parseInt(noiseReductionSlider.value),
                    audioClarity: parseInt(audioClaritySlider.value),
                    dynamicRange: parseInt(dynamicRangeSlider.value)
                };
                
                // Add spatial audio settings
                preset.spatialEnabled = spatialToggle.checked;
                if (preset.spatialEnabled) {
                    preset.roomSize = parseInt(roomSizeSlider.value);
                    preset.spatialWidth = parseInt(spatialWidthSlider.value);
                    preset.spatialMode = spatialModeSelect.value;
                }
            }
            
            // If editing an existing preset, replace it
            if (editingPresetIndex >= 0) {
                customPresets[editingPresetIndex] = preset;
                editingPresetIndex = -1; // Reset editing state
            }
            // If overwriting an existing preset, replace it
            else if (isOverwriting) {
                customPresets[presetIndex] = preset;
            }
            // Otherwise add as a new preset
            else {
                customPresets.push(preset);
            }
            
            // Save to storage
            await chrome.storage.local.set({ customPresets: customPresets });
            
            // Update the dropdown
            updateCustomPresetsInDropdown();
            
            // Select the newly created preset in the dropdown
            const newIndex = findPresetIndexByName(name);
            if (newIndex >= 0) {
                presetSelect.value = `custom-${newIndex}`;
            }
            
            showStatus(`Preset "${name}" saved successfully!`);
            
            // Close the modal
            savePresetModal.style.display = 'none';
            
            // Clear the input
            presetNameInput.value = '';
            overwriteWarning.style.display = 'none';
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error saving custom preset:', error);
            showStatus('Error saving preset', true);
        }
    }
    
    // Find a preset by name
    function findPresetIndexByName(name) {
        return customPresets.findIndex(preset => preset.name.toLowerCase() === name.toLowerCase());
    }
    
    // Delete a custom preset
    async function deleteCustomPreset(index) {
        try {
            // Get the preset name for the status message
            const presetName = customPresets[index].name;
            
            // Remove from array
            customPresets.splice(index, 1);
            
            // Save to storage
            await chrome.storage.local.set({ customPresets: customPresets });
            
            // Update the dropdown
            updateCustomPresetsInDropdown();
            
            // Update the manage presets modal
            renderPresetsList();
            
            // If we were editing this preset, reset the editing state
            if (editingPresetIndex === index) {
                editingPresetIndex = -1;
            }
            
            showStatus(`Preset "${presetName}" deleted`);
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error deleting custom preset:', error);
            showStatus('Error deleting preset', true);
        }
    }
    
    // Edit a custom preset
    function editCustomPreset(index) {
        try {
            // Get the preset
            const preset = customPresets[index];
            
            // Set the preset name in the input
            presetNameInput.value = preset.name;
            
            // Set the editing preset index
            editingPresetIndex = index;
            
            // Show the save preset modal
            savePresetModal.style.display = 'block';
            
            // Focus the input
            presetNameInput.focus();
            
            // Hide the overwrite warning since we're explicitly editing
            overwriteWarning.style.display = 'none';
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error editing custom preset:', error);
            showStatus('Error editing preset', true);
        }
    }
    
    // Render the presets list in the manage presets modal
    function renderPresetsList() {
        // Clear the list
        presetsList.innerHTML = '';
        
        // Show/hide the no presets message
        if (customPresets.length === 0) {
            noPresetsMessage.style.display = 'block';
            presetsList.style.display = 'none';
        } else {
            noPresetsMessage.style.display = 'none';
            presetsList.style.display = 'block';
            
            // Add each preset to the list
            customPresets.forEach((preset, index) => {
                const li = document.createElement('li');
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'preset-name';
                nameSpan.textContent = preset.name;
                
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'preset-actions';
                
                const editButton = document.createElement('button');
                editButton.className = 'edit-preset';
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editButton.title = 'Edit preset';
                editButton.addEventListener('click', () => {
                    editCustomPreset(index);
                    managePresetsModal.style.display = 'none';
                });
                
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-preset';
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.title = 'Delete preset';
                deleteButton.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to delete the preset "${preset.name}"?`)) {
                        deleteCustomPreset(index);
                    }
                });
                
                actionsDiv.appendChild(editButton);
                actionsDiv.appendChild(deleteButton);
                
                li.appendChild(nameSpan);
                li.appendChild(actionsDiv);
                
                presetsList.appendChild(li);
            });
        }
    }
    
    // Check if a preset name already exists
    function checkPresetNameExists() {
        const name = presetNameInput.value.trim();
        
        // Ignore the current editing preset
        if (editingPresetIndex >= 0) {
            const currentPreset = customPresets[editingPresetIndex];
            if (currentPreset && currentPreset.name.toLowerCase() === name.toLowerCase()) {
                overwriteWarning.style.display = 'none';
                return false;
            }
        }
        
        const exists = findPresetIndexByName(name) >= 0;
        overwriteWarning.style.display = exists ? 'block' : 'none';
        return exists;
    }

    // Hard reset function for complete audio processor reset
    async function resetAllSettings() {
        try {
            // Show status to user that reset is in progress
            showStatus('Resetting audio settings...');
            
            // Default settings
            const defaultSettings = {
                volume: 100,
                equalizer: new Array(10).fill(0),
                preset: 'flat',
                aiEnhancement: {
                    noiseReduction: 0,
                    audioClarity: 0,
                    dynamicRange: 0
                },
                spatialEnabled: false,
                roomSize: 40,
                spatialWidth: 50,
                spatialMode: 'music'
            };
            
            // 1. Reset UI elements first
            
            // Reset volume
            volumeSlider.value = defaultSettings.volume;
            volumeValue.textContent = `${defaultSettings.volume}%`;
            
            // Reset equalizer sliders
            eqSliders.forEach((slider, index) => {
                slider.value = 0;
                updateEQFill(slider, index);
            });
            
            // Reset preset selector
            presetSelect.value = 'flat';
            
            // Reset AI enhancement sliders
            if (noiseReductionSlider) {
                noiseReductionSlider.value = 0;
                if (aiEnhancementValueSpans[0]) {
                    aiEnhancementValueSpans[0].textContent = '0%';
                }
            }
            
            if (audioClaritySlider) {
                audioClaritySlider.value = 0;
                if (aiEnhancementValueSpans[1]) {
                    aiEnhancementValueSpans[1].textContent = '0%';
                }
            }
            
            if (dynamicRangeSlider) {
                dynamicRangeSlider.value = 0;
                if (aiEnhancementValueSpans[2]) {
                    aiEnhancementValueSpans[2].textContent = '0%';
                }
            }
            
            // Reset spatial audio UI
            if (spatialToggle) {
                spatialToggle.checked = false;
                document.querySelector('.spatial-controls').style.display = 'none';
            }
            
            if (roomSizeSlider) {
                roomSizeSlider.value = defaultSettings.roomSize;
                updateRoomSizeLabel(defaultSettings.roomSize);
            }
            
            if (spatialWidthSlider) {
                spatialWidthSlider.value = defaultSettings.spatialWidth;
                updateSpatialWidthLabel(defaultSettings.spatialWidth);
            }
            
            if (spatialModeSelect) {
                spatialModeSelect.value = defaultSettings.spatialMode;
            }
            
            // 2. Save default settings to storage first
            await chrome.storage.local.set(defaultSettings);
            
            // 3. HARD RESET - Completely disable and re-enable the extension
            // This will force a complete rebuild of the audio processor
            
            // First, disable the extension
            await sendMessage({ 
                type: 'SET_ENABLED',
                value: false
            });
            
            // Wait for extension to fully disable
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Now re-enable the extension with default settings
            await sendMessage({ 
                type: 'SET_ENABLED',
                value: true
            });
            
            // Wait for extension to fully re-initialize
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Make sure volume is reset to default
            await sendMessage({
                type: 'SET_VOLUME',
                value: defaultSettings.volume
            });
            
            // 4. Force another reconnection to ensure all changes take effect
            await sendMessage({
                type: 'FORCE_RECONNECT'
            });
            
            showStatus('All settings reset to default');
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error during hard reset:', error);
            showStatus('Error resetting settings', true);
        }
    }

    // Show confirmation dialog before resetting
    function showResetConfirmDialog() {
        // Create dialog element
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        
        const dialogContent = document.createElement('div');
        dialogContent.className = 'confirm-dialog-content';
        
        const title = document.createElement('h3');
        title.textContent = 'Reset All Settings?';
        
        const message = document.createElement('p');
        message.textContent = 'This will reset all audio settings to their default values. This action cannot be undone.';
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'confirm-dialog-buttons';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-btn';
        cancelBtn.textContent = 'Cancel';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'confirm-btn';
        confirmBtn.textContent = 'Reset';
        
        // Build dialog structure
        buttonsDiv.appendChild(cancelBtn);
        buttonsDiv.appendChild(confirmBtn);
        
        dialogContent.appendChild(title);
        dialogContent.appendChild(message);
        dialogContent.appendChild(buttonsDiv);
        
        dialog.appendChild(dialogContent);
        
        // Add to document
        document.body.appendChild(dialog);
        
        // Event handlers
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        confirmBtn.addEventListener('click', async () => {
            document.body.removeChild(dialog);
            await resetAllSettings();
        });
        
        // Close when clicking outside
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
            }
        });
    }

    // Initialize UI state
    async function initializeUI() {
        try {
            console.log('[Audio Enhancer Debug] Initializing popup');

            if (!await isPageSupported()) {
                showStatus('Please open a regular website to use the audio controls.', true);
                return;
            }

            // Check license status including trial information
            await checkLicenseStatus();
            
            // Update status badge
            updateStatusBadge();
            
            // Apply appropriate restrictions based on license
            if (isProUser) {
                unlockProFeatures();
            } else {
                applyFreeVersionRestrictions();
            }

            // Initialize EQ visualization elements
            createEQVisualElements();
            createDbIndicator();

            // Load custom presets
            await loadCustomPresets();

            // Load saved settings
            const settings = await chrome.storage.local.get([
                'enabled',
                'volume',
                'equalizer',
                'aiEnhancement',
                'preset',
                'spatialEnabled',
                'roomSize',
                'spatialWidth',
                'spatialMode'
            ]);
            
            // Set master toggle state
            masterToggle.checked = settings.enabled !== false;
            
            if (settings.volume) {
                // For free users, cap at 150%
                const volumeVal = !isProUser && settings.volume > 150 ? 150 : settings.volume;
                volumeSlider.value = volumeVal;
                volumeValue.textContent = `${volumeVal}%`;
            }
            
            if (settings.equalizer) {
                settings.equalizer.forEach((value, index) => {
                    if (eqSliders[index]) {
                        eqSliders[index].value = value;
                        // Update the fill visualization
                        updateEQFill(eqSliders[index], index);
                    }
                });
            }
            
            if (settings.aiEnhancement && isProUser) {
                if (noiseReductionSlider) {
                    noiseReductionSlider.value = settings.aiEnhancement.noiseReduction || 0;
                    aiEnhancementValueSpans[0].textContent = `${settings.aiEnhancement.noiseReduction || 0}%`;
                }
                if (audioClaritySlider) {
                    audioClaritySlider.value = settings.aiEnhancement.audioClarity || 0;
                    aiEnhancementValueSpans[1].textContent = `${settings.aiEnhancement.audioClarity || 0}%`;
                }
                if (dynamicRangeSlider) {
                    dynamicRangeSlider.value = settings.aiEnhancement.dynamicRange || 0;
                    aiEnhancementValueSpans[2].textContent = `${settings.aiEnhancement.dynamicRange || 0}%`;
                }
            }
            
            // Set preset dropdown to saved value or flat for free users
            if (settings.preset && presetSelect) {
                if (settings.preset.startsWith('custom-')) {
                    // For custom presets, we need to wait for them to load
                    // Now try to set the value
                    try {
                        presetSelect.value = settings.preset;
                    } catch (e) {
                        // If the custom preset no longer exists, fall back to flat
                        presetSelect.value = 'flat';
                    }
                } else if (isProUser || settings.preset === 'flat') {
                    presetSelect.value = settings.preset;
                } else {
                    presetSelect.value = 'flat';
                }
            }
            
            // Set 3D spatial audio settings
            if (spatialToggle) {
                spatialToggle.checked = settings.spatialEnabled === true;
                // Show/hide controls based on toggle state
                document.querySelector('.spatial-controls').style.display = 
                    spatialToggle.checked ? 'block' : 'none';
            }
            
            // Set room size slider
            if (roomSizeSlider && settings.roomSize !== undefined) {
                roomSizeSlider.value = settings.roomSize;
                updateRoomSizeLabel(settings.roomSize);
            }
            
            // Set spatial width slider
            if (spatialWidthSlider && settings.spatialWidth !== undefined) {
                spatialWidthSlider.value = settings.spatialWidth;
                updateSpatialWidthLabel(settings.spatialWidth);
            }
            
            // Set spatial preset dropdown to match room size if possible
            if (spatialPresetSelect && settings.roomSize !== undefined) {
                const roomTypes = [
                    'tiny-room',
                    'small-room',
                    'medium-room',
                    'large-room',
                    'concert-hall',
                    'cathedral'
                ];
                
                const index = Math.min(
                    Math.floor(settings.roomSize / (100 / roomTypes.length)),
                    roomTypes.length - 1
                );
                
                spatialPresetSelect.value = roomTypes[index];
            }
            
            // Set spatial mode if saved
            if (spatialModeSelect && settings.spatialMode) {
                spatialModeSelect.value = settings.spatialMode;
            }

            await sendMessage({ type: 'PING' });
            showStatus('Connected successfully!');
        } catch (error) {
            console.error('[Audio Enhancer Debug] Initialization error:', error);
            showStatus(error.message, true);
        }
    }

    // Update status badge based on license status
    function updateStatusBadge() {
        if (isProUser) {
            if (isTrialActive && trialDaysLeft > 0) {
                // In trial mode
                planBadge.classList.add('pro');
                planBadge.innerHTML = `<i class="fas fa-crown"></i> <span>Pro Trial</span>`;
            } else if (subscriptionAmount > 0) {
                // Paid subscription
                planBadge.classList.add('pro');
                planBadge.innerHTML = `<i class="fas fa-crown"></i> <span>Pro Plan</span>`;
            } else {
                // Standard Pro
                planBadge.classList.add('pro');
                planBadge.innerHTML = `<i class="fas fa-crown"></i> <span>Pro Plan</span>`;
            }
        } else {
            planBadge.classList.remove('pro');
            planBadge.innerHTML = '<i class="fas fa-user"></i> <span>Free Plan</span>';
        }
    }

    // Toggle dark mode
    darkModeToggle.addEventListener('change', () => {
        const theme = darkModeToggle.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        chrome.storage.local.set({ theme: theme });
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const newTheme = e.matches ? 'dark' : 'light';
        
        // Only apply if user hasn't manually set theme
        chrome.storage.local.get('theme', (result) => {
            if (!result.theme) {
                document.documentElement.setAttribute('data-theme', newTheme);
                darkModeToggle.checked = e.matches;
            }
        });
    });

    // Initialize theme
    getColorPreference();

    // Check for saved theme preference or use system preference
    function getColorPreference() {
        // Check if theme is saved in storage
        chrome.storage.local.get('theme', (result) => {
            if (result.theme) {
                document.documentElement.setAttribute('data-theme', result.theme);
                darkModeToggle.checked = result.theme === 'dark';
            } else {
                // Check system preference
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    darkModeToggle.checked = true;
                }
            }
        });
    }

    // Master toggle handler
    masterToggle.addEventListener('change', async (e) => {
        try {
            const enabled = e.target.checked;
            await chrome.storage.local.set({ enabled });
            await sendMessage({ 
                type: 'SET_ENABLED',
                value: enabled
            });
            
            // If enabling, wait a moment then force reapply AI enhancements
            if (enabled) {
                // Get current AI enhancement values
                const aiEnhancementValues = {
                    noiseReduction: noiseReductionSlider ? parseInt(noiseReductionSlider.value) : 0,
                    audioClarity: audioClaritySlider ? parseInt(audioClaritySlider.value) : 0,
                    dynamicRange: dynamicRangeSlider ? parseInt(dynamicRangeSlider.value) : 0
                };
                
                // Save current AI enhancement values again to ensure they're up to date
                await chrome.storage.local.set({ 
                    aiEnhancement: aiEnhancementValues
                });
                
                // Wait 2 seconds for extension to initialize, then force reapply each enhancement setting
                setTimeout(async () => {
                    try {
                        // Reapply each enhancement individually
                        if (aiEnhancementValues.noiseReduction > 0) {
                            await sendMessage({
                                type: 'SET_AI_ENHANCEMENT',
                                feature: 'noiseReduction',
                                value: aiEnhancementValues.noiseReduction
                            });
                        }
                        
                        if (aiEnhancementValues.audioClarity > 0) {
                            await sendMessage({
                                type: 'SET_AI_ENHANCEMENT',
                                feature: 'audioClarity',
                                value: aiEnhancementValues.audioClarity
                            });
                        }
                        
                        if (aiEnhancementValues.dynamicRange > 0) {
                            await sendMessage({
                                type: 'SET_AI_ENHANCEMENT',
                                feature: 'dynamicRange',
                                value: aiEnhancementValues.dynamicRange
                            });
                        }
                        
                        // Force reconnection to ensure settings take full effect
                        await sendMessage({
                            type: 'FORCE_RECONNECT'
                        });
                        
                        console.log('[Audio Enhancer Debug] AI Enhancements reapplied after toggle');
                    } catch (error) {
                        console.error('[Audio Enhancer Debug] Error reapplying AI enhancements:', error);
                    }
                }, 2000);
            }
            
            showStatus(enabled ? 'Extension enabled' : 'Extension disabled');
        } catch (error) {
            showStatus(error.message, true);
            e.target.checked = !e.target.checked; // Revert on error
        }
    });

    // Volume control handler
    volumeSlider.addEventListener('input', async (e) => {
        try {
            let value = parseInt(e.target.value);
            
            // If free user tries to exceed 150%, cap it
            if (!isProUser && value > 150) {
                value = 150;
                volumeSlider.value = 150;
                showStatus('Upgrade to Pro for volume boost up to 500%!', true);
            }
            
            volumeValue.textContent = `${value}%`;
            
            await sendMessage({
                type: 'SET_VOLUME',
                value: parseFloat(value)
            });
            await chrome.storage.local.set({ volume: value });
        } catch (error) {
            showStatus(error.message, true);
        }
    });

    // Equalizer control handlers
    eqSliders.forEach((slider, index) => {
        slider.addEventListener('input', async (e) => {
            try {
                const value = parseFloat(e.target.value);
                
                // Show dB level indicator
                showDbIndicator(slider, value);
                
                // Update EQ fill visualization
                updateEQFill(slider, index);
                
                await sendMessage({
                    type: 'SET_EQ',
                    index: index,
                    value: value
                });

                const settings = await chrome.storage.local.get('equalizer');
                const eq = settings.equalizer || new Array(10).fill(0);
                eq[index] = value;
                await chrome.storage.local.set({ equalizer: eq });
            } catch (error) {
                showStatus(error.message, true);
            }
        });
    });

    // Reset EQ button handler
    resetEQButton.addEventListener('click', async () => {
        try {
            // Reset all sliders to 0
            eqSliders.forEach((slider, index) => {
                slider.value = 0;
                
                // Reset colored fills
                updateEQFill(slider, index);
                
                // Send updates to content script
                sendMessage({
                    type: 'SET_EQ',
                    index: index,
                    value: 0
                });
            });
            
            // Save the reset EQ settings
            const resetValues = new Array(10).fill(0);
            await chrome.storage.local.set({ 
                equalizer: resetValues,
                preset: 'flat'
            });
            
            // Update preset dropdown
            presetSelect.value = 'flat';
            
            showStatus('Equalizer reset to default');
        } catch (error) {
            showStatus(error.message, true);
        }
    });
    
    // Preset select handler
    presetSelect.addEventListener('change', async () => {
        try {
            const presetValue = presetSelect.value;
            
            // Check if this is a custom preset
            if (presetValue.startsWith('custom-')) {
                const index = parseInt(presetValue.replace('custom-', ''));
                applyCustomPreset(index);
                return;
            }
            
            // Handle built-in presets
            const presetName = presetValue;
            
            // If trying to use a non-flat preset in free mode, show upgrade message
            if (!isProUser && presetName !== 'flat') {
                showStatus('Upgrade to Pro to unlock all presets!', true);
                presetSelect.value = 'flat'; // Reset to flat
                return;
            }
            
            const presetValues = eqPresets[presetName];
            
            if (!presetValues) return;
            
            // Apply preset values to sliders
            eqSliders.forEach((slider, index) => {
                slider.value = presetValues[index];
                
                // Update colored fills
                updateEQFill(slider, index);
                
                // Send updates to content script
                sendMessage({
                    type: 'SET_EQ',
                    index: index,
                    value: presetValues[index]
                });
            });
            
            // Save the preset settings
            await chrome.storage.local.set({ 
                equalizer: presetValues,
                preset: presetName 
            });
            
            showStatus(`${presetName.charAt(0).toUpperCase() + presetName.slice(1)} preset applied`);
        } catch (error) {
            showStatus(error.message, true);
        }
    });

    // AI Enhancement handlers
    const updateAIEnhancement = async (feature, value) => {
        try {
            await sendMessage({
                type: 'SET_AI_ENHANCEMENT',
                feature: feature,
                value: value
            });

            const settings = await chrome.storage.local.get('aiEnhancement');
            const aiSettings = settings.aiEnhancement || {
                noiseReduction: 0,
                audioClarity: 0,
                dynamicRange: 0
            };
            aiSettings[feature] = value;
            await chrome.storage.local.set({ aiEnhancement: aiSettings });
        } catch (error) {
            showStatus(error.message, true);
        }
    };

    if (noiseReductionSlider) {
        noiseReductionSlider.addEventListener('input', (e) => {
            if (!isProUser) {
                e.preventDefault();
                noiseReductionSlider.value = 0;
                showStatus('Upgrade to Pro to use AI Enhancement!', true);
                return;
            }
            
            const value = parseInt(e.target.value);
            aiEnhancementValueSpans[0].textContent = `${value}%`;
            updateAIEnhancement('noiseReduction', value);
            
            // If value is 0 or changed to 0, force a reconnection to ensure proper reset
            if (value === 0) {
                setTimeout(() => {
                    sendMessage({
                        type: 'FORCE_RECONNECT'
                    });
                }, 300);
            }
        });
    }

    if (audioClaritySlider) {
        audioClaritySlider.addEventListener('input', (e) => {
            if (!isProUser) {
                e.preventDefault();
                audioClaritySlider.value = 0;
                showStatus('Upgrade to Pro to use AI Enhancement!', true);
                return;
            }
            
            const value = parseInt(e.target.value);
            aiEnhancementValueSpans[1].textContent = `${value}%`;
            
            // Apply the setting immediately
            updateAIEnhancement('audioClarity', value);
            
            // If value is 0 or changed to 0, force a reconnection to ensure proper reset
            if (value === 0) {
                setTimeout(() => {
                    sendMessage({
                        type: 'FORCE_RECONNECT'
                    });
                }, 300);
            }
        });
    }

    if (dynamicRangeSlider) {
        dynamicRangeSlider.addEventListener('input', (e) => {
            if (!isProUser) {
                e.preventDefault();
                dynamicRangeSlider.value = 0;
                showStatus('Upgrade to Pro to use AI Enhancement!', true);
                return;
            }
            
            const value = parseInt(e.target.value);
            aiEnhancementValueSpans[2].textContent = `${value}%`;
            updateAIEnhancement('dynamicRange', value);
            
            // If value is 0 or changed to 0, force a reconnection to ensure proper reset
            if (value === 0) {
                setTimeout(() => {
                    sendMessage({
                        type: 'FORCE_RECONNECT'
                    });
                }, 300);
            }
        });
    }
    
    // 3D Spatial Audio control handlers
    spatialToggle.addEventListener('change', async (e) => {
        try {
            if (!isProUser) {
                e.preventDefault();
                spatialToggle.checked = false;
                showStatus('Upgrade to Pro to use 3D Spatial Audio!', true);
                return;
            }
            
            const enabled = e.target.checked;
            
            // Show/hide controls based on toggle state
            document.querySelector('.spatial-controls').style.display = 
                enabled ? 'block' : 'none';
            
            // Get current settings before changing spatial state
            const settings = await chrome.storage.local.get(['volume', 'roomSize', 'spatialWidth', 'spatialMode']);
            const volumeValue = settings.volume || 100;
            const roomSizeValue = settings.roomSize || 40;
            const spatialWidthValue = settings.spatialWidth || 50;
            const spatialModeValue = settings.spatialMode || 'music';
            
            await sendMessage({
                type: 'SET_SPATIAL_ENABLED',
                value: enabled
            });
            
            await chrome.storage.local.set({ spatialEnabled: enabled });
            
            // Re-apply all spatial settings after toggling
            if (enabled) {
                setTimeout(async () => {
                    // First apply spatial mode if available
                    if (spatialModeValue) {
                        await sendMessage({
                            type: 'SET_SPATIAL_MODE',
                            value: spatialModeValue
                        });
                    } else {
                        // Otherwise apply individual settings
                        // First reapply volume
                        await sendMessage({
                            type: 'SET_VOLUME',
                            value: parseFloat(volumeValue)
                        });
                        
                        // Then reapply room size
                        await sendMessage({
                            type: 'SET_ROOM_SIZE', 
                            value: roomSizeValue
                        });
                        
                        // Finally reapply spatial width
                        await sendMessage({
                            type: 'SET_SPATIAL_WIDTH',
                            value: spatialWidthValue
                        });
                    }
                }, 300);
            }
            
            showStatus(`3D Spatial Audio ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            showStatus(error.message, true);
        }
    });
    
    roomSizeSlider.addEventListener('input', async (e) => {
        try {
            if (!isProUser) {
                e.preventDefault();
                roomSizeSlider.value = 40;
                showStatus('Upgrade to Pro to use 3D Spatial Audio!', true);
                return;
            }
            
            const value = parseInt(e.target.value);
            updateRoomSizeLabel(value);
            
            // Update the preset dropdown to match the room size
            const roomTypes = [
                'tiny-room',
                'small-room',
                'medium-room',
                'large-room',
                'concert-hall',
                'cathedral'
            ];
            
            const index = Math.min(
                Math.floor(value / (100 / roomTypes.length)),
                roomTypes.length - 1
            );
            
            spatialPresetSelect.value = roomTypes[index];
            
            await sendMessage({
                type: 'SET_ROOM_SIZE',
                value: value
            });
            
            await chrome.storage.local.set({ roomSize: value });
        } catch (error) {
            showStatus(error.message, true);
        }
    });
    
    spatialWidthSlider.addEventListener('input', async (e) => {
        try {
            if (!isProUser) {
                e.preventDefault();
                spatialWidthSlider.value = 50;
                showStatus('Upgrade to Pro to use 3D Spatial Audio!', true);
                return;
            }
            
            const value = parseInt(e.target.value);
            updateSpatialWidthLabel(value);
            
            await sendMessage({
                type: 'SET_SPATIAL_WIDTH',
                value: value
            });
            
            await chrome.storage.local.set({ spatialWidth: value });
        } catch (error) {
            showStatus(error.message, true);
        }
    });
    
    spatialPresetSelect.addEventListener('change', async () => {
        try {
            if (!isProUser) {
                showStatus('Upgrade to Pro to use 3D Spatial Audio!', true);
                spatialPresetSelect.value = 'small-room'; // Reset to default
                return;
            }
            
            const preset = spatialPresetSelect.value;
            
            // Map preset to room size value
            const roomTypes = [
                'tiny-room',
                'small-room',
                'medium-room',
                'large-room',
                'concert-hall',
                'cathedral'
            ];
            
            const index = roomTypes.indexOf(preset);
            const roomSizeValue = Math.round((index / (roomTypes.length - 1)) * 100);
            
            // Update slider to match preset
            roomSizeSlider.value = roomSizeValue;
            updateRoomSizeLabel(roomSizeValue);
            
            await sendMessage({
                type: 'SET_ROOM_SIZE',
                value: roomSizeValue
            });
            
            await chrome.storage.local.set({ roomSize: roomSizeValue });
            
            showStatus(`Applied ${preset.replace('-', ' ')} preset`);
        } catch (error) {
            showStatus(error.message, true);
        }
    });
    
    // Add event listener for spatial mode selection
    if (spatialModeSelect) {
        spatialModeSelect.addEventListener('change', async () => {
            try {
                if (!isProUser) {
                    spatialModeSelect.value = 'music'; // Reset to default
                    showStatus('Upgrade to Pro to use content-optimized spatial audio!', true);
                    return;
                }
                
                const mode = spatialModeSelect.value;
                
                await sendMessage({
                    type: 'SET_SPATIAL_MODE',
                    value: mode
                });
                
                // Update UI to match the selected mode's recommended settings
                if (mode === 'podcast') {
                    roomSizeSlider.value = 25;
                    spatialWidthSlider.value = 35;
                    updateRoomSizeLabel(25);
                    updateSpatialWidthLabel(35);
                } else if (mode === 'movie') {
                    roomSizeSlider.value = 65;
                    spatialWidthSlider.value = 60;
                    updateRoomSizeLabel(65);
                    updateSpatialWidthLabel(60);
                } else { // music
                    roomSizeSlider.value = 50;
                    spatialWidthSlider.value = 50;
                    updateRoomSizeLabel(50);
                    updateSpatialWidthLabel(50);
                }
                
                await chrome.storage.local.set({ 
                    spatialMode: mode,
                    roomSize: parseInt(roomSizeSlider.value),
                    spatialWidth: parseInt(spatialWidthSlider.value)
                });
                
                // Provide feedback on mode change
                const modeNames = {
                    'music': 'Music',
                    'podcast': 'Podcast',
                    'movie': 'Movie'
                };
                showStatus(`Applied ${modeNames[mode]} mode`);
            } catch (error) {
                showStatus(error.message, true);
            }
        });
    }
    
    // Upgrade button handler
    upgradeBtn.addEventListener('click', async () => {
        try {
            // Get current tab to pass extension context
            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            const currentTab = tabs[0];
            
            // Create unique session ID for this payment attempt
            const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            
            // Store session info for verification later
            await chrome.storage.local.set({
                paymentSession: {
                    sessionId: sessionId,
                    timestamp: Date.now(),
                    tabId: currentTab?.id
                }
            });
            
            // Build payment URL with extension context
            const paymentUrl = `https://audioenhancerpro.com/audio-enhancer-website/payment-integration.html?` +
                `session=${sessionId}&` +
                `extension=chrome-extension://${chrome.runtime.id}&` +
                `return=extension`;
            
            // Open payment page in new tab
            chrome.tabs.create({
                url: paymentUrl,
                active: true
            });
            
        } catch (error) {
            console.error('Error opening payment page:', error);
            showStatus('Error opening payment page. Please try again.', true);
        }
    });
    
    // Price option selection handler
    priceOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Clear previous selection
            priceOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Set new selection
            option.classList.add('selected');
            
            const amount = option.dataset.amount;
            
            if (amount === 'custom') {
                customPriceSection.style.display = 'block';
                selectedAmount = parseFloat(customPriceInput.value);
            } else {
                customPriceSection.style.display = 'none';
                selectedAmount = parseFloat(amount);
            }
        });
    });

    // Custom price input handler
    customPriceInput.addEventListener('input', (e) => {
        let value = parseFloat(e.target.value);
        
        // Enforce min/max limits
        if (value < 2) value = 2;
        if (value > 20) value = 20;
        
        selectedAmount = value;
    });

    // Confirm payment button handler
    confirmPaymentBtn.addEventListener('click', async () => {
        try {
            // Get current tab to pass extension context
            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            const currentTab = tabs[0];
            
            // Create unique session ID for this payment attempt
            const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            
            // Store session info for verification later
            await chrome.storage.local.set({
                paymentSession: {
                    sessionId: sessionId,
                    timestamp: Date.now(),
                    tabId: currentTab?.id,
                    amount: selectedAmount
                }
            });
            
            // Build payment URL with extension context and amount
            const paymentUrl = `https://audioenhancerpro.com/audio-enhancer-website/payment-integration.html?` +
                `session=${sessionId}&` +
                `extension=chrome-extension://${chrome.runtime.id}&` +
                `amount=${selectedAmount}&` +
                `return=extension`;
            
            // Open payment page in new tab
            chrome.tabs.create({
                url: paymentUrl,
                active: true
            });
            
        } catch (error) {
            console.error('Error opening payment page:', error);
            showStatus('Error opening payment page. Please try again.', true);
        }
    });

    // Change subscription button handler
    changeSubscriptionBtn.addEventListener('click', () => {
        // Hide subscription section
        subscriptionSection.style.display = 'none';
        
        // Show payment section
        paymentSection.style.display = 'block';
        
        // Pre-select current amount or closest option
        let foundMatch = false;
        
        priceOptions.forEach(option => {
            option.classList.remove('selected');
            
            if (option.dataset.amount !== 'custom') {
                const optionAmount = parseFloat(option.dataset.amount);
                
                if (optionAmount === subscriptionAmount) {
                    option.classList.add('selected');
                    foundMatch = true;
                    customPriceSection.style.display = 'none';
                }
            }
        });
        
        // If no matching option, select custom
        if (!foundMatch) {
            const customOption = document.querySelector('.price-option[data-amount="custom"]');
            customOption.classList.add('selected');
            customPriceSection.style.display = 'block';
            customPriceInput.value = subscriptionAmount.toFixed(2);
        }
        
        selectedAmount = subscriptionAmount;
        
        upgradeTitle.textContent = 'Update Your Subscription';
        upgradeDesc.textContent = 'Choose a new amount for your monthly subscription.';
    });
    
    // Event listeners for custom presets
    savePresetBtn.addEventListener('click', () => {
        savePresetModal.style.display = 'block';
        presetNameInput.focus();
        
        // Auto-generate a name based on the current URL
        if (presetNameInput.value.trim() === '') {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0] && tabs[0].url) {
                    try {
                        const url = new URL(tabs[0].url);
                        const domain = url.hostname.replace('www.', '');
                        
                        // Generate a name based on the domain
                        let siteName = domain.split('.')[0];
                        
                        // Capitalize first letter
                        siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
                        
                        presetNameInput.value = `${siteName} Sound`;
                        
                        // Check if this name already exists
                        checkPresetNameExists();
                    } catch (e) {
                        console.error('[Audio Enhancer Debug] Error generating preset name:', e);
                    }
                }
            });
        }
    });
    
    managePresetsBtn.addEventListener('click', () => {
        renderPresetsList();
        managePresetsModal.style.display = 'block';
    });
    
    presetNameInput.addEventListener('input', checkPresetNameExists);
    
    confirmSavePresetBtn.addEventListener('click', () => {
        const name = presetNameInput.value.trim();
        
        if (name === '') {
            alert('Please enter a preset name');
            return;
        }
        
        if (name.length > 30) {
            alert('Preset name must be 30 characters or less');
            return;
        }
        
        saveCustomPreset(name);
    });
    
    cancelSavePresetBtn.addEventListener('click', () => {
        savePresetModal.style.display = 'none';
        presetNameInput.value = '';
        editingPresetIndex = -1;
        overwriteWarning.style.display = 'none';
    });
    
    closeManagePresetsBtn.addEventListener('click', () => {
        managePresetsModal.style.display = 'none';
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === savePresetModal) {
            savePresetModal.style.display = 'none';
            presetNameInput.value = '';
            editingPresetIndex = -1;
            overwriteWarning.style.display = 'none';
        }
        if (e.target === managePresetsModal) {
            managePresetsModal.style.display = 'none';
        }
    });
    
    // Close modals when clicking the X
    document.querySelectorAll('.close-modal').forEach(closeButton => {
        closeButton.addEventListener('click', () => {
            savePresetModal.style.display = 'none';
            managePresetsModal.style.display = 'none';
            presetNameInput.value = '';
            editingPresetIndex = -1;
            overwriteWarning.style.display = 'none';
        });
    });
    
    // Save current EQ settings and preset selection
    function saveCurrentEQSettings() {
        // Save original preset value
        savedPresetValue = presetSelect.value;
        
        // Save EQ settings
        savedEQSettings = [];
        eqSliders.forEach((slider) => {
            savedEQSettings.push(slider.value);
        });
        
        return savedEQSettings;
    }
    
    // Apply flat (neutral) EQ settings
    async function applyFlatEQ() {
        try {
            // Set all sliders to 0
            eqSliders.forEach((slider, index) => {
                slider.value = 0;
                
                // Update the fill visualization
                updateEQFill(slider, index);
                
                // Send updates to content script
                sendMessage({
                    type: 'SET_EQ',
                    index: index,
                    value: 0
                });
            });
            
            // Update preset dropdown to flat
            presetSelect.value = 'flat';
            
            abStatus.textContent = 'Original Audio';
            abStatus.classList.remove('enhanced');
            abStatus.classList.add('original');
            abTestButton.classList.add('active');
            abTestButton.innerHTML = '<i class="fas fa-exchange-alt"></i> Release to Compare';
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error applying flat EQ:', error);
        }
    }
    
    // Restore saved EQ settings and preset selection
    async function restoreEQSettings() {
        if (!savedEQSettings) return;
        
        try {
            eqSliders.forEach((slider, index) => {
                const value = parseFloat(savedEQSettings[index]);
                slider.value = value;
                
                // Update the fill visualization
                updateEQFill(slider, index);
                
                // Send updates to content script
                sendMessage({
                    type: 'SET_EQ',
                    index: index,
                    value: value
                });
            });
            
            // Restore the original preset selection
            if (savedPresetValue) {
                presetSelect.value = savedPresetValue;
            }
            
            abStatus.textContent = 'Enhanced Audio';
            abStatus.classList.remove('original');
            abStatus.classList.add('enhanced');
            abTestButton.classList.remove('active');
            abTestButton.innerHTML = '<i class="fas fa-exchange-alt"></i> Compare Original';
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error restoring EQ settings:', error);
        }
    }
    
    // Handle A/B testing button mousedown
    abTestButton.addEventListener('mousedown', async () => {
        if (isListeningToOriginal) return;
        
        isListeningToOriginal = true;
        saveCurrentEQSettings();
        await applyFlatEQ();
    });
    
    // Handle A/B testing button mouseup
    abTestButton.addEventListener('mouseup', async () => {
        if (!isListeningToOriginal) return;
        
        isListeningToOriginal = false;
        await restoreEQSettings();
    });
    
    // Handle A/B testing button mouse leave (in case user drags out of the button)
    abTestButton.addEventListener('mouseleave', async () => {
        if (!isListeningToOriginal) return;
        
        isListeningToOriginal = false;
        await restoreEQSettings();
    });
    
    // Handle A/B testing for touch devices
    abTestButton.addEventListener('touchstart', async (e) => {
        e.preventDefault(); // Prevent default touch behavior
        if (isListeningToOriginal) return;
        
        isListeningToOriginal = true;
        saveCurrentEQSettings();
        await applyFlatEQ();
    });
    
    abTestButton.addEventListener('touchend', async (e) => {
        e.preventDefault(); // Prevent default touch behavior
        if (!isListeningToOriginal) return;
        
        isListeningToOriginal = false;
        await restoreEQSettings();
    });
    
    // Master reset button click event
    masterResetBtn.addEventListener('click', showResetConfirmDialog);

    // Call the initialization when DOM is ready
    initializeUI();
    
    // Add payment success message listener
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'PAYMENT_SUCCESS') {
            handlePaymentSuccess(message.data);
            sendResponse({success: true});
        } else if (message.type === 'PAYMENT_FAILED') {
            handlePaymentFailure(message.data);
            sendResponse({success: true});
        }
        return true;
    });
    
    // Function to handle successful payment
    async function handlePaymentSuccess(paymentData) {
        try {
            // Verify this payment session belongs to this extension instance
            const storedSession = await chrome.storage.local.get('paymentSession');
            
            if (!storedSession.paymentSession || 
                storedSession.paymentSession.sessionId !== paymentData.sessionId) {
                console.warn('Payment session mismatch');
                return;
            }
            
            // Activate pro features
            await chrome.storage.local.set({
                license: {
                    isPro: true,
                    purchaseDate: new Date().toISOString(),
                    amount: paymentData.amount || 4.99,
                    stripePaymentIntentId: paymentData.paymentIntentId
                }
            });
            
            // Update UI
            isProUser = true;
            subscriptionAmount = paymentData.amount || 4.99;
            
            // Update all UI sections
            trialSection.style.display = 'none';
            paymentSection.style.display = 'none';
            subscriptionSection.style.display = 'block';
            
            currentAmountSpan.textContent = `$${subscriptionAmount.toFixed(2)}`;
            upgradeTitle.textContent = 'Pro Subscription Active';
            upgradeDesc.textContent = 'Thank you for supporting Audio Enhancer Pro!';
            
            // Unlock pro features and update badge
            unlockProFeatures();
            updateStatusBadge();
            
            // Clear payment session
            await chrome.storage.local.remove('paymentSession');
            
            showStatus('Payment successful! Pro features activated.', false);
            
        } catch (error) {
            console.error('Error handling payment success:', error);
            showStatus('Error activating pro features. Please contact support.', true);
        }
    }
    
    // Function to handle payment failure
    async function handlePaymentFailure(failureData) {
        try {
            // Clear payment session
            await chrome.storage.local.remove('paymentSession');
            
            showStatus('Payment was cancelled or failed. Please try again.', true);
            
        } catch (error) {
            console.error('Error handling payment failure:', error);
        }
    }
});