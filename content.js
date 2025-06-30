let processor = null;
let audioElements = new Set();
let isInitialized = false;
let extensionEnabled = true;
let mutationObserver = null;
let initializationAttempts = {};
let maxInitAttempts = 3;

// Function to safely disconnect audio processing and restore original audio
function disconnectAudioProcessing() {
    if (processor) {
        try {
            audioElements.forEach(element => {
                if (element && element._audioEnhancerConnected) {
                    processor.disconnectFromSource(element);
                }
            });
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error disconnecting:', error);
        }
    }
}

async function initializeAudioProcessor() {
    if (isInitialized) return;

    try {
        processor = new AudioProcessor();
        await processor.initialize();
        
        // Initialize spatial audio
        await processor.initializeSpatialAudio();
        
        isInitialized = true;
        console.log('[Audio Enhancer Debug] Audio processor initialized');
    } catch (error) {
        console.error('[Audio Enhancer Debug] Failed to initialize audio processor:', error);
        // Try to recover
        setTimeout(() => {
            isInitialized = false;
            initializeAudioProcessor();
        }, 2000);
    }
}

// Function to ensure proper reconnection after spatial audio toggle
function reconnectSourcesToEnsureVolumeChange() {
    if (!processor) return;
    
    try {
        // Get all current settings from local storage
        chrome.storage.local.get(['volume', 'roomSize', 'spatialWidth', 'spatialMode'], (settings) => {
            // Reconnect sources
            processor.reconnectSources();
            
            // Apply all settings in sequence to ensure proper restoration
            setTimeout(() => {
                // Apply volume
                if (settings.volume) {
                    processor.setVolume(settings.volume);
                }
                
                // Apply spatial mode first if it exists
                if (processor.spatialEnabled && settings.spatialMode) {
                    processor.setSpatialMode(settings.spatialMode);
                } 
                // Otherwise apply individual spatial settings
                else if (processor.spatialEnabled) {
                    // Apply room size if spatial is enabled
                    if (settings.roomSize !== undefined) {
                        processor.setRoomSize(settings.roomSize);
                    }
                    
                    // Apply spatial width if spatial is enabled
                    if (settings.spatialWidth !== undefined) {
                        processor.setSpatialWidth(settings.spatialWidth);
                    }
                }
                
                // Final volume application to ensure it takes effect
                if (settings.volume) {
                    processor.setVolume(settings.volume);
                }
            }, 50);
        });
    } catch (error) {
        console.error('[Audio Enhancer Debug] Error in settings reconnection:', error);
    }
}

async function connectToAudioElement(element) {
    if (!element || !extensionEnabled || element._audioEnhancerConnected) return;
    
    const elementId = element.id || Math.random().toString(36).substring(2, 15);
    
    // Track initialization attempts for this element
    initializationAttempts[elementId] = (initializationAttempts[elementId] || 0) + 1;
    
    // Don't try more than maxInitAttempts times
    if (initializationAttempts[elementId] > maxInitAttempts) {
        console.warn('[Audio Enhancer Debug] Giving up on element after multiple attempts');
        return;
    }
    
    try {
        if (!isInitialized) await initializeAudioProcessor();
        
        // Extra check for cross-origin content
        let isCrossOrigin = false;
        try {
            // This will throw if cross-origin restrictions apply
            const test = element.currentSrc;
        } catch (e) {
            console.warn('[Audio Enhancer Debug] Cross-origin restrictions detected, skipping element');
            isCrossOrigin = true;
        }
        
        if (!isCrossOrigin) {
            // Connect to the audio element
            await processor.connectToSource(element);
            element._audioEnhancerConnected = true;
            audioElements.add(element);
            
            // Apply saved settings
            chrome.storage.local.get(['volume', 'equalizer', 'aiEnhancement', 'spatialEnabled', 'roomSize', 'spatialWidth', 'spatialMode'], (result) => {
                processor.setVolume(result.volume || 100);

                if (result.equalizer) {
                    result.equalizer.forEach((value, index) => processor.setEqualizer(index, value));
                }

                if (result.aiEnhancement) {
                    processor.setAINoiseReduction(result.aiEnhancement.noiseReduction || 0);
                    processor.setAIClarity(result.aiEnhancement.audioClarity || 0);
                    processor.setAIDynamicRange(result.aiEnhancement.dynamicRange || 0);
                }
                
                // Apply spatial audio settings in correct order
                if (result.spatialEnabled !== undefined) {
                    processor.setSpatialEnabled(result.spatialEnabled);
                    
                    // Apply spatial settings if enabled
                    if (result.spatialEnabled) {
                        // Give some time for the spatial audio system to initialize
                        setTimeout(() => {
                            // First apply spatial mode if set (this will override individual settings)
                            if (result.spatialMode) {
                                processor.setSpatialMode(result.spatialMode);
                            } else {
                                // Otherwise apply individual settings
                                if (result.roomSize !== undefined) {
                                    processor.setRoomSize(result.roomSize);
                                }
                                
                                if (result.spatialWidth !== undefined) {
                                    processor.setSpatialWidth(result.spatialWidth);
                                }
                            }
                            
                            // Finally reapply volume to ensure it's properly connected
                            processor.setVolume(result.volume || 100);
                        }, 100);
                    }
                }
            });
            
            console.log('[Audio Enhancer Debug] Connected to element successfully');
        }
    } catch (error) {
        console.error('[Audio Enhancer Debug] Error connecting to element:', error);
        element._audioEnhancerConnected = false;
        
        // Try again after a delay if we haven't exceeded max attempts
        if (initializationAttempts[elementId] <= maxInitAttempts) {
            setTimeout(() => connectToAudioElement(element), 1000);
        }
    }
}

async function initializeAudioElement(element) {
    if (!element || element._audioEnhancerConnected || !extensionEnabled) return;

    // Handle specific types of media elements differently
    if (element.tagName === 'AUDIO' || element.tagName === 'VIDEO') {
        // For media that may not be loaded yet
        if (element.readyState >= 1) {
            await connectToAudioElement(element);
        } else {
            // Set up event listeners for when the media becomes available
            const handleMediaReady = async () => {
                await connectToAudioElement(element);
                // Remove the listeners once connected
                element.removeEventListener('loadedmetadata', handleMediaReady);
                element.removeEventListener('canplay', handleMediaReady);
            };
            
            element.addEventListener('loadedmetadata', handleMediaReady, { once: true });
            element.addEventListener('canplay', handleMediaReady, { once: true });
            
            // Fallback if events don't fire
            setTimeout(() => {
                if (!element._audioEnhancerConnected && element.readyState >= 1) {
                    connectToAudioElement(element);
                }
            }, 500);
        }
    }
}

// Process all audio and video elements in a document or shadow DOM
function processAudioElementsInNode(rootNode) {
    if (!extensionEnabled) return;
    
    // Process regular nodes
    const mediaElements = rootNode.querySelectorAll('audio, video');
    mediaElements.forEach(initializeAudioElement);
    
    // Process shadow DOM if available
    if (rootNode.querySelectorAll) {
        const potentialShadowHosts = rootNode.querySelectorAll('*');
        potentialShadowHosts.forEach(host => {
            if (host.shadowRoot) {
                processAudioElementsInNode(host.shadowRoot);
            }
        });
    }
}

// Process iframes if possible
function processIframes() {
    if (!extensionEnabled) return;
    
    try {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                // This will throw for cross-origin iframes
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                processAudioElementsInNode(iframeDoc);
                
                // Set up observer for this iframe if possible
                setupMutationObserverForNode(iframeDoc);
            } catch (e) {
                // Cross-origin iframe, can't access content
                console.log('[Audio Enhancer Debug] Cannot access iframe content (cross-origin)');
            }
        });
    } catch (e) {
        console.error('[Audio Enhancer Debug] Error processing iframes:', e);
    }
}

// New function to reapply AI enhancements after reconnection
async function reapplyAIEnhancements() {
    try {
        // Get current AI enhancement settings from storage
        const result = await chrome.storage.local.get(['aiEnhancement']);
        if (!result.aiEnhancement) return;
        
        const { noiseReduction, audioClarity, dynamicRange } = result.aiEnhancement;
        
        // Reapply settings to ensure they take effect
        if (noiseReduction !== undefined) {
            sendMessage({
                type: 'SET_AI_ENHANCEMENT',
                feature: 'noiseReduction',
                value: noiseReduction
            });
        }
        
        if (audioClarity !== undefined) {
            sendMessage({
                type: 'SET_AI_ENHANCEMENT',
                feature: 'audioClarity',
                value: audioClarity
            });
        }
        
        if (dynamicRange !== undefined) {
            sendMessage({
                type: 'SET_AI_ENHANCEMENT',
                feature: 'dynamicRange',
                value: dynamicRange
            });
        }
        
        console.log('[Audio Enhancer Debug] AI enhancement settings reapplied after reconnection');
    } catch (error) {
        console.error('[Audio Enhancer Debug] Error reapplying AI enhancements:', error);
    }
}

function initializeExistingAudioElements() {
    if (!extensionEnabled) return;
    
    // Process the main document
    processAudioElementsInNode(document);
    
    // Process iframes if possible
    processIframes();
    
    // Set up periodic scanning for dynamic content
    setInterval(() => {
        if (extensionEnabled) {
            processAudioElementsInNode(document);
            processIframes();
        }
    }, 5000);
    
    // Force reapply AI enhancement settings after reconnection
    setTimeout(() => {
        if (extensionEnabled) {
            reapplyAIEnhancements();
        }
    }, 1000);
}

// Set up mutation observer for a specific node
function setupMutationObserverForNode(node) {
    const observer = new MutationObserver(mutations => {
        if (!extensionEnabled) return;

        mutations.forEach(mutation => {
            // Handle added nodes
            mutation.addedNodes.forEach(addedNode => {
                // Direct audio/video elements
                if (addedNode.nodeName === 'AUDIO' || addedNode.nodeName === 'VIDEO') {
                    initializeAudioElement(addedNode);
                }
                
                // Elements that might contain audio/video
                if (addedNode.querySelectorAll) {
                    addedNode.querySelectorAll('audio, video').forEach(initializeAudioElement);
                    
                    // Check for shadow DOM
                    if (addedNode.shadowRoot) {
                        processAudioElementsInNode(addedNode.shadowRoot);
                    }
                    
                    // Check for iframes
                    addedNode.querySelectorAll('iframe').forEach(iframe => {
                        try {
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                            processAudioElementsInNode(iframeDoc);
                        } catch (e) {
                            // Cross-origin iframe
                        }
                    });
                }
            });
            
            // Handle attribute changes that might affect audio
            if (mutation.type === 'attributes') {
                const target = mutation.target;
                if ((target.nodeName === 'AUDIO' || target.nodeName === 'VIDEO') && 
                    ['src', 'autoplay', 'controls'].includes(mutation.attributeName)) {
                    initializeAudioElement(target);
                }
            }
        });
        
        // Check for newly added iframes
        processIframes();
    });

    observer.observe(node, { 
        childList: true, 
        subtree: true, 
        attributes: true, 
        attributeFilter: ['src', 'autoplay', 'controls'] 
    });
    
    return observer;
}

// Set up the main mutation observer
function setupMutationObserver() {
    if (mutationObserver) {
        mutationObserver.disconnect();
    }
    
    mutationObserver = setupMutationObserverForNode(document.documentElement);
    return mutationObserver;
}

// Handle play events on the page
function setupPlayEventListeners() {
    // This helps with sites that use JavaScript to create/initialize audio elements
    document.addEventListener('play', (event) => {
        const target = event.target;
        if ((target.nodeName === 'AUDIO' || target.nodeName === 'VIDEO') && extensionEnabled) {
            initializeAudioElement(target);
        }
    }, true); // Use capture phase to catch events before they're processed
    
    // Listen for custom HTML5 video events that some sites use
    document.addEventListener('videoInitialized', (event) => {
        if (extensionEnabled && event.target && 
            (event.target.nodeName === 'VIDEO' || event.target.nodeName === 'AUDIO')) {
            initializeAudioElement(event.target);
        }
    }, true);
}

// Handle user interaction to initialize audio context (needed for many browsers)
function setupUserInteractionHandlers() {
    const interactionEvents = ['click', 'touchend', 'keydown'];
    
    const handleUserInteraction = async () => {
        if (!isInitialized && extensionEnabled) {
            await initializeAudioProcessor();
            
            // Once initialized, we don't need these listeners anymore
            interactionEvents.forEach(event => {
                document.removeEventListener(event, handleUserInteraction);
            });
        }
    };
    
    interactionEvents.forEach(event => {
        document.addEventListener(event, handleUserInteraction, { once: false, capture: true });
    });
}

// Helper function for sending messages
function sendMessage(message) {
    try {
        chrome.runtime.sendMessage(message);
    } catch (error) {
        console.error('[Audio Enhancer Debug] Error sending message:', error);
    }
}

// Initialize extension state
chrome.storage.local.get(['enabled'], (result) => {
    extensionEnabled = result.enabled !== false;
    
    if (extensionEnabled) {
        // Set up all necessary listeners and observers
        setupUserInteractionHandlers();
        setupPlayEventListeners();
        setupMutationObserver();
        
        // Initial scan for existing elements
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeExistingAudioElements);
        } else {
            initializeExistingAudioElements();
        }
        
        // Secondary scan after window load (catches late-loading elements)
        window.addEventListener('load', initializeExistingAudioElements);
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'PING') {
        sendResponse({ success: true });
        return true;
    }

    if (request.type === 'SET_ENABLED') {
        extensionEnabled = request.value;
        if (extensionEnabled) {
            initializeExistingAudioElements();
            setupMutationObserver();
            
            // Add a second delay and force reapply AI enhancements again
            // This ensures settings are applied after audio chains are fully initialized
            setTimeout(() => {
                reapplyAIEnhancements();
                
                // Also force reconnection to ensure all settings take effect
                sendMessage({
                    type: 'FORCE_RECONNECT'
                });
            }, 2000);
        } else {
            disconnectAudioProcessing();
            
            if (mutationObserver) {
                mutationObserver.disconnect();
            }
        }
        sendResponse({ success: true });
        return true;
    }

    if (!isInitialized && extensionEnabled) {
        initializeAudioProcessor().then(() => handleMessage(request, sendResponse));
        return true;
    }

    handleMessage(request, sendResponse);
    return true;
});

function handleMessage(request, sendResponse) {
    try {
        if (!extensionEnabled) {
            sendResponse({ success: false, error: 'Extension is disabled' });
            return;
        }

        switch (request.type) {
            case 'SET_VOLUME':
                processor.setVolume(request.value);
                break;
            case 'SET_EQ':
                processor.setEqualizer(request.index, request.value);
                break;
            case 'SET_AI_ENHANCEMENT':
                if (request.feature === 'noiseReduction') processor.setAINoiseReduction(request.value);
                if (request.feature === 'audioClarity') processor.setAIClarity(request.value);
                if (request.feature === 'dynamicRange') processor.setAIDynamicRange(request.value);
                break;
                
            // Spatial Audio commands with improved restoration
            case 'SET_SPATIAL_ENABLED':
                processor.setSpatialEnabled(request.value);
                // Use the enhanced restore function
                reconnectSourcesToEnsureVolumeChange();
                break;
            case 'SET_ROOM_SIZE':
                processor.setRoomSize(request.value);
                break;
            case 'SET_SPATIAL_WIDTH':
                processor.setSpatialWidth(request.value);
                break;
            case 'SET_SPATIAL_MODE':
                processor.setSpatialMode(request.value);
                break;
                
            // New case to force reconnection of all audio elements
            case 'FORCE_RECONNECT':
                reconnectSourcesToEnsureVolumeChange();
                break;
                
            default:
                throw new Error('Unknown message type');
        }
        sendResponse({ success: true });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}

console.log('[Audio Enhancer Debug] Content script loaded successfully');