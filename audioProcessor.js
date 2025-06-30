class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.sources = new Map();  // Track sources by element
        this.gainNode = null;
        this.equalizers = [];
        this.frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
        this.connectedElements = new Set();
        this.initialized = false;
        this.noiseReductionNode = null;
        this.clarityNode = null;
        this.dynamicRangeNode = null;
        this.processingChains = new Map(); // Track processing chains by element
        
        // Spatial Audio properties
        this.spatialEnabled = false;
        this.currentRoom = 'natural';
        this.spatialWidth = 50;
        this.spatialMode = 'music'; // Default mode: music, podcast, movie
        
        // Premium Spatial Audio System
        this.directPath = null;            // Direct clean signal path
        this.ambientPath = null;           // Spatial ambient path
        this.directGain = null;            // Controls direct signal level
        this.ambientGain = null;           // Controls ambient level
        this.frontLeftNode = null;         // Front left virtual speaker
        this.frontRightNode = null;        // Front right virtual speaker
        this.surroundLeftNode = null;      // Surround left virtual speaker
        this.surroundRightNode = null;     // Surround right virtual speaker
        this.topNode = null;               // Overhead virtual speaker
        this.speakerGains = {};            // Gain for each virtual speaker
        this.headTrackingEnabled = false;  // Simulated head tracking
        this.directEQ = null;              // Preserves clarity in direct path
        this.transientEnhancer = null;     // Preserves attack transients
        this.spectralProcessor = null;     // HRTF spectral cues without reverb
        this.virtualizer = null;           // 3D virtualization
        this.spatialPreservation = null;   // Preserves stereo information
        this.immersionControl = null;      // Controls immersion depth
        this.midSideProcessor = null;      // Mid-side processing for stereo enhancement
        
        // Enhanced spatial audio components
        this.harmonicExciter = null;       // Adds subtle saturation in high frequencies
        this.multibandTransient = null;    // Frequency-specific transient processing
        this.spatialModulator = null;      // Adds subtle movement to the spatial field
        this.concertAmbience = null;       // Simulates festival/concert ambience
        
        // Content-specific EQ bands
        this.vocalPresenceEQ = null;       // Enhances vocal presence (2.5-3.5kHz)
        this.vocalFundamentalsEQ = null;   // Enhances vocal fundamentals (800Hz)
        this.dialogEQ = null;              // Enhances dialog clarity for movies (1.5-2.5kHz)
        
        // Track current settings for reconnections
        this.currentVolumeValue = 1.0;
        this.currentRoomSize = 40;         // Default room size
        this.currentSpatialWidth = 50;     // Default spatial width
        
        // Head tracking properties - NEW
        this.headOrientation = {
            alpha: 0,    // z-axis rotation (0-360) - looking left/right
            beta: 0,     // x-axis rotation (0-180) - looking up/down
            gamma: 0     // y-axis rotation (-90-90) - tilting left/right
        };
        this.orientationListener = null;
        this.headModel = {
            earSpacing: 0.21,  // Average ear spacing in meters
            pinna: {           // Outer ear parameters for externalization
                elevation: 0,
                azimuth: 0,
                cavum: 1.0     // Concha cavity resonance factor
            }
        };
        
        // Expanded speaker configuration properties - NEW
        this.topFrontLeftNode = null;
        this.topFrontRightNode = null;
        this.topRearLeftNode = null;
        this.topRearRightNode = null;
        this.centerNode = null;
        this.subwooferNode = null;
        
        // Voice isolation properties - NEW
        this.voiceIsolationEnabled = false;
        this.voiceFilter = null;
        this.voiceGain = null;
        this.ambienceGain = null;
        this.voiceAnalyser = null;
        
        // Enhanced Voice Isolation properties - NEW
        this.voiceIsolationNode = null;      // Main voice bandpass filter
        this.voiceLowPass = null;            // Upper frequency limit for voice
        this.voiceHighPass = null;           // Lower frequency limit for voice
        this.voiceFormantEQ = null;          // Voice formant enhancement
        this.speechClarityEQ = null;         // Speech clarity enhancement
        this.voiceSplitterNode = null;       // Crossfader for voice/background balance
        this.backgroundNoiseNode = null;     // Background audio path
        this.voiceDynamicsProcessor = null;  // Compressor for voice consistency
        this.noiseGateNode = null;           // Noise gate to reduce background
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Use proper options to improve compatibility
            const contextOptions = {
                latencyHint: 'interactive',
                sampleRate: 48000,
            };
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)(contextOptions);
            
            // If context is suspended (autoplay policy), try to resume
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.gainNode = this.audioContext.createGain();

            // Initialize AI Enhancement Nodes
            this.noiseReductionNode = this.audioContext.createBiquadFilter();
            this.noiseReductionNode.type = "lowpass";
            this.noiseReductionNode.frequency.value = 20000; // Default to no filtering

            this.clarityNode = this.audioContext.createBiquadFilter();
            this.clarityNode.type = "peaking";
            this.clarityNode.frequency.value = 3000;
            this.clarityNode.gain.value = 0; // Default no enhancement

            this.dynamicRangeNode = this.audioContext.createDynamicsCompressor();
            this.dynamicRangeNode.threshold.value = -24;
            this.dynamicRangeNode.knee.value = 30;
            this.dynamicRangeNode.ratio.value = 1; // Default to no compression
            this.dynamicRangeNode.attack.value = 0.003;
            this.dynamicRangeNode.release.value = 0.25;

            // Equalizer bands
            this.equalizers = this.frequencies.map(freq => {
                const eq = this.audioContext.createBiquadFilter();
                eq.type = 'peaking';
                eq.frequency.value = freq;
                eq.Q.value = 1;
                eq.gain.value = 0;
                return eq;
            });

            // Initialize voice isolation components
            await this.initializeVoiceIsolation();

            this.initialized = true;
            console.log('[Audio Enhancer Debug] Audio context initialized successfully');
        } catch (error) {
            console.error('[Audio Enhancer Debug] Audio context initialization error:', error);
            throw error;
        }
    }

    // Initialize voice isolation components
    async initializeVoiceIsolation() {
        if (!this.audioContext) return;
        
        // Create voice isolation components if they don't exist
        if (!this.voiceIsolationNode) {
            // Main voice bandpass filter - tightly tuned to speech frequencies
            this.voiceIsolationNode = this.audioContext.createBiquadFilter();
            this.voiceIsolationNode.type = 'bandpass';
            this.voiceIsolationNode.frequency.value = 2000; // Core speech frequency
            this.voiceIsolationNode.Q.value = 0.5; // Moderate width for speech range
            
            // Secondary filters for enhanced voice clarity
            this.voiceLowPass = this.audioContext.createBiquadFilter();
            this.voiceLowPass.type = 'lowpass';
            this.voiceLowPass.frequency.value = 3500; // Upper limit of speech
            this.voiceLowPass.Q.value = 0.7;
            
            this.voiceHighPass = this.audioContext.createBiquadFilter();
            this.voiceHighPass.type = 'highpass';
            this.voiceHighPass.frequency.value = 300; // Lower limit of speech
            this.voiceHighPass.Q.value = 0.7;
            
            // Voice formant enhancement
            this.voiceFormantEQ = this.audioContext.createBiquadFilter();
            this.voiceFormantEQ.type = 'peaking';
            this.voiceFormantEQ.frequency.value = 2800; // Presence boost for clarity
            this.voiceFormantEQ.Q.value = 2;
            this.voiceFormantEQ.gain.value = 6;
            
            // Speech intelligibility enhancement
            this.speechClarityEQ = this.audioContext.createBiquadFilter();
            this.speechClarityEQ.type = 'peaking';
            this.speechClarityEQ.frequency.value = 1800; // Speech intelligibility range
            this.speechClarityEQ.Q.value = 1.5;
            this.speechClarityEQ.gain.value = 4;
            
            // Create crossover network for isolating voice vs background
            this.voiceSplitterNode = this.audioContext.createGain();
            this.backgroundNoiseNode = this.audioContext.createGain();
            
            // Dynamic processor for voice
            this.voiceDynamicsProcessor = this.audioContext.createDynamicsCompressor();
            this.voiceDynamicsProcessor.threshold.value = -30;
            this.voiceDynamicsProcessor.knee.value = 6;
            this.voiceDynamicsProcessor.ratio.value = 4;
            this.voiceDynamicsProcessor.attack.value = 0.003;
            this.voiceDynamicsProcessor.release.value = 0.25;
            
            // Noise gate for silencing between speech
            this.noiseGateNode = this.createNoiseGate();
            
            // Default: Voice isolation disabled
            this.voiceSplitterNode.gain.value = 0;
            this.backgroundNoiseNode.gain.value = 1;
            
            console.log('[Audio Enhancer Debug] Voice isolation components initialized');
        }
    }

    // Create a simple noise gate to reduce background noise between speech
    createNoiseGate() {
        const gateNode = this.audioContext.createGain();
        gateNode.gain.value = 1;
        
        // We'll control this with the voice detection system later
        return gateNode;
    }

    // Configure the voice isolation based on the clarity value
    configureVoiceIsolation(amount) {
        if (!this.voiceSplitterNode || !this.backgroundNoiseNode) return;
        
        // Progressively adjust parameters based on amount (0-1)
        
        // Voice isolation gets stronger as amount increases
        this.voiceSplitterNode.gain.setTargetAtTime(amount, this.audioContext.currentTime, 0.1);
        
        // Background noise gets reduced as amount increases
        this.backgroundNoiseNode.gain.setTargetAtTime(1 - (amount * 0.9), this.audioContext.currentTime, 0.1);
        
        // Adjust bandpass filter Q to be narrower at higher isolation levels
        if (this.voiceIsolationNode) {
            // Q increases from 0.5 (broad) to 1.5 (narrow) as isolation increases
            const newQ = 0.5 + (amount * 1.0);
            this.voiceIsolationNode.Q.setTargetAtTime(newQ, this.audioContext.currentTime, 0.1);
        }
        
        // Adjust formant enhancement to be stronger at higher isolation levels
        if (this.voiceFormantEQ) {
            const formantGain = amount * 8; // Scale up to 8dB boost at maximum
            this.voiceFormantEQ.gain.setTargetAtTime(formantGain, this.audioContext.currentTime, 0.1);
        }
        
        // Adjust speech clarity enhancement 
        if (this.speechClarityEQ) {
            const speechGain = amount * 6; // Scale up to 6dB boost at maximum
            this.speechClarityEQ.gain.setTargetAtTime(speechGain, this.audioContext.currentTime, 0.1);
        }
        
        // Adjust dynamics processing as isolation increases
        if (this.voiceDynamicsProcessor) {
            // More compression at higher isolation levels
            const ratio = 2 + (amount * 6); // 2:1 to 8:1 ratio
            this.voiceDynamicsProcessor.ratio.setTargetAtTime(ratio, this.audioContext.currentTime, 0.1);
            
            // Lower threshold at higher isolation levels
            const threshold = -24 - (amount * 16); // -24dB to -40dB 
            this.voiceDynamicsProcessor.threshold.setTargetAtTime(threshold, this.audioContext.currentTime, 0.1);
        }
    }

    // Apply voice isolation to a specific audio chain
    configureChainVoiceIsolation(chain, amount) {
        if (!chain || !chain.voiceIsolationNode) return;
        
        // Voice isolation gets stronger as amount increases
        chain.voiceSplitterNode.gain.setTargetAtTime(amount, this.audioContext.currentTime, 0.1);
        
        // Background noise gets reduced as amount increases
        chain.backgroundNoiseNode.gain.setTargetAtTime(1 - (amount * 0.9), this.audioContext.currentTime, 0.1);
        
        // Adjust bandpass filter Q to be narrower at higher isolation levels
        if (chain.voiceIsolationNode) {
            const newQ = 0.5 + (amount * 1.0); 
            chain.voiceIsolationNode.Q.setTargetAtTime(newQ, this.audioContext.currentTime, 0.1);
        }
        
        // Adjust formant enhancement
        if (chain.voiceFormantEQ) {
            const formantGain = amount * 8;
            chain.voiceFormantEQ.gain.setTargetAtTime(formantGain, this.audioContext.currentTime, 0.1);
        }
        
        // Adjust speech clarity
        if (chain.speechClarityEQ) {
            const speechGain = amount * 6;
            chain.speechClarityEQ.gain.setTargetAtTime(speechGain, this.audioContext.currentTime, 0.1);
        }
        
        // Adjust dynamics processing
        if (chain.voiceDynamicsProcessor) {
            const ratio = 2 + (amount * 6);
            chain.voiceDynamicsProcessor.ratio.setTargetAtTime(ratio, this.audioContext.currentTime, 0.1);
            
            const threshold = -24 - (amount * 16);
            chain.voiceDynamicsProcessor.threshold.setTargetAtTime(threshold, this.audioContext.currentTime, 0.1);
        }
    }

    // Apple/Sony-style Premium Spatial Audio initialization
    async initializeSpatialAudio() {
        try {
            // Create direct signal path (preserves clarity)
            this.directPath = this.audioContext.createGain();
            this.directGain = this.audioContext.createGain();
            this.directGain.gain.value = 0.75; // ADJUSTED: Increased to reduce muddy sound

            // Create ambient path (adds spatialization)
            this.ambientPath = this.audioContext.createGain();
            this.ambientGain = this.audioContext.createGain();
            this.ambientGain.gain.value = 0.38; // ADJUSTED: Reduced to prevent overload
            
            // Create virtual speaker positions for 360° sound
            // ADJUSTED: Reduced angles for more natural sound field
            this.frontLeftNode = this.createVirtualSpeaker(-30, 0, -1);
            this.frontRightNode = this.createVirtualSpeaker(30, 0, -1);
            this.surroundLeftNode = this.createVirtualSpeaker(-110, 0, 0);
            this.surroundRightNode = this.createVirtualSpeaker(110, 0, 0);
            this.topNode = this.createVirtualSpeaker(0, 40, -1);
            
            // Store gains for each speaker
            this.speakerGains = {
                frontLeft: this.audioContext.createGain(),
                frontRight: this.audioContext.createGain(),
                surroundLeft: this.audioContext.createGain(),
                surroundRight: this.audioContext.createGain(),
                top: this.audioContext.createGain()
            };
            
            // ADJUSTED: Lowered all gain values to prevent clipping
            this.speakerGains.frontLeft.gain.value = 0.35;
            this.speakerGains.frontRight.gain.value = 0.35;
            this.speakerGains.surroundLeft.gain.value = 0.30;
            this.speakerGains.surroundRight.gain.value = 0.30;
            this.speakerGains.top.gain.value = 0.25;
            
            // Create spectral processing for spatial cues without reverb
            this.spectralProcessor = this.createSpectralProcessor();
            
            // Create EQ to preserve and enhance clarity in direct path
            this.directEQ = this.createDirectPathEQ();
            
            // Create improved transient enhancer for punchier sound
            this.transientEnhancer = this.createTransientEnhancer();
            
            // Create stereo field preservation
            this.spatialPreservation = this.createSpatialPreservation();
            
            // Create mid-side processing for wider stereo enhancement
            this.midSideProcessor = {
                splitter: this.audioContext.createChannelSplitter(2),
                merger: this.audioContext.createChannelMerger(2),
                midGain: this.audioContext.createGain(),
                sideGain: this.audioContext.createGain()
            };
            
            // ADJUSTED: Less extreme mid-side processing
            this.midSideProcessor.midGain.gain.value = 0.85;
            this.midSideProcessor.sideGain.gain.value = 1.10;
            
            // Main immersion control
            this.immersionControl = this.audioContext.createGain();
            this.immersionControl.gain.value = 0.52; // ADJUSTED: Lowered gain
            
            // Create multi-band virtualization processor
            this.virtualizer = {
                lowBand: this.createBandVirtualizer(20, 300),
                midBand: this.createBandVirtualizer(300, 3500),
                highBand: this.createBandVirtualizer(3500, 20000)
            };
            
            // Create harmonic exciter for top-end saturation
            this.harmonicExciter = this.createHarmonicExciter();
            
            // Create multiband transient processor for punchier sound
            this.multibandTransient = this.createMultibandTransient();
            
            // Create spatial modulator for subtle movement (festival feel)
            this.spatialModulator = this.createSpatialModulator();
            
            // Create concert ambience simulator
            this.concertAmbience = this.createConcertAmbience();
            
            // Create content-specific EQ bands
            this.vocalPresenceEQ = this.createResonantFilter(3000, 1.5, 0);
            this.vocalFundamentalsEQ = this.createResonantFilter(800, 1.3, 0);
            this.dialogEQ = this.createResonantFilter(2200, 1.8, 0);
            
            this.spatialEnabled = false;
            console.log('[Audio Enhancer Debug] Enhanced premium spatial audio system initialized');
        } catch (error) {
            console.error('[Audio Enhancer Debug] Failed to initialize spatial audio:', error);
        }
    }
    
    // Create a virtual speaker positioned in 3D space
    createVirtualSpeaker(azimuth, elevation, distance) {
        const panner = this.audioContext.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 10000;
        panner.rolloffFactor = 0.5;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 360;
        panner.coneOuterGain = 1;
        
        // Convert spherical to cartesian coordinates
        const azimuthRad = azimuth * Math.PI / 180;
        const elevationRad = elevation * Math.PI / 180;
        const x = Math.sin(azimuthRad) * Math.cos(elevationRad) * distance;
        const y = Math.sin(elevationRad) * distance;
        const z = -Math.cos(azimuthRad) * Math.cos(elevationRad) * distance;
        
        panner.positionX.value = x;
        panner.positionY.value = y;
        panner.positionZ.value = z;
        
        return panner;
    }
    
    // Create a frequency-dependent spectral processor for improved spatial cues
    createSpectralProcessor() {
        // ADJUSTED: Reduced the gain values to prevent harshness
        return {
            concha1: this.createResonantFilter(5000, 8.5, 2.8),
            concha2: this.createResonantFilter(10000, 6.5, 1.7),
            pinna1: this.createResonantFilter(4000, 3.2, 2.5),
            pinna2: this.createResonantFilter(8000, 6.5, 2.0),
            headShadow: this.createLowShelfFilter(1000, -1.2) // Less aggressive cut
        };
    }
    
    // Creates a resonant filter for HRTF spectral cues
    createResonantFilter(frequency, Q, gain) {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = frequency;
        filter.Q.value = Q;
        filter.gain.value = gain;
        return filter;
    }
    
    // Creates a low shelf filter for head shadow effects
    createLowShelfFilter(frequency, gain) {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowshelf';
        filter.frequency.value = frequency;
        filter.gain.value = gain;
        return filter;
    }
    
    // Create direct path EQ for more crispness and clarity
    createDirectPathEQ() {
        // ADJUSTED: More balanced EQ with less extreme changes
        return {
            highShelf: this.createHighShelfFilter(7500, 2),
            presence: this.createResonantFilter(2800, 1, 1),
            upperMid: this.createResonantFilter(5000, 0.8, 0.5),
            lowControl: this.createLowShelfFilter(250, -0.5) // Less bass cut
        };
    }
    
    // Creates a high shelf filter for clarity
    createHighShelfFilter(frequency, gain) {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highshelf';
        filter.frequency.value = frequency;
        filter.gain.value = gain;
        return filter;
    }
    
    // Create a transient enhancer that better preserves attacks
    createTransientEnhancer() {
        // ADJUSTED: Less aggressive compression for cleaner transients
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.value = -30;
        compressor.knee.value = 6;
        compressor.ratio.value = 3;
        compressor.attack.value = 0.001;
        compressor.release.value = 0.050;
        return compressor;
    }
    
    // Create a harmonic exciter for top-end saturation
    createHarmonicExciter() {
        const highpassFilter = this.audioContext.createBiquadFilter();
        highpassFilter.type = 'highpass';
        highpassFilter.frequency.value = 3500;
        highpassFilter.Q.value = 0.7;
        
        const waveshaper = this.audioContext.createWaveShaper();
        
        // ADJUSTED: Less aggressive distortion curve
        const curve = new Float32Array(44100);
        const amount = 2.5; // Reduced from 4
        
        for (let i = 0; i < 44100; i++) {
            const x = (i * 2) / 44100 - 1;
            // Softer saturation formula
            curve[i] = (Math.tanh(amount * x) + x * 0.03) / (1 + amount * Math.abs(x));
        }
        
        waveshaper.curve = curve;
        waveshaper.oversample = '4x';
        
        // ADJUSTED: Less wet signal to reduce harshness
        const dryGain = this.audioContext.createGain();
        dryGain.gain.value = 0.90;
        
        const wetGain = this.audioContext.createGain();
        wetGain.gain.value = 0.18; // Reduced saturation
        
        return {
            highpass: highpassFilter,
            waveshaper: waveshaper,
            dryGain: dryGain,
            wetGain: wetGain
        };
    }
    
    // Create a multiband transient processor for frequency-specific punch
    createMultibandTransient() {
        // ADJUSTED: Less aggressive processing for each band to maintain cleanliness
        const lowBand = {
            crossover: this.audioContext.createBiquadFilter(),
            compressor: this.audioContext.createDynamicsCompressor()
        };
        
        const midBand = {
            lowCrossover: this.audioContext.createBiquadFilter(),
            highCrossover: this.audioContext.createBiquadFilter(),
            compressor: this.audioContext.createDynamicsCompressor()
        };
        
        const highBand = {
            crossover: this.audioContext.createBiquadFilter(),
            compressor: this.audioContext.createDynamicsCompressor()
        };
        
        // Set up low band (20Hz - 250Hz)
        lowBand.crossover.type = 'lowpass';
        lowBand.crossover.frequency.value = 250;
        lowBand.crossover.Q.value = 0.7;
        
        lowBand.compressor.threshold.value = -24;
        lowBand.compressor.knee.value = 6;
        lowBand.compressor.ratio.value = 2.5; // Less compression
        lowBand.compressor.attack.value = 0.005;
        lowBand.compressor.release.value = 0.05;
        
        // Set up mid band (250Hz - 3500Hz)
        midBand.lowCrossover.type = 'highpass';
        midBand.lowCrossover.frequency.value = 250;
        midBand.lowCrossover.Q.value = 0.7;
        
        midBand.highCrossover.type = 'lowpass';
        midBand.highCrossover.frequency.value = 3500;
        midBand.highCrossover.Q.value = 0.7;
        
        midBand.compressor.threshold.value = -28;
        midBand.compressor.knee.value = 4;
        midBand.compressor.ratio.value = 3; // Less compression
        midBand.compressor.attack.value = 0.001;
        midBand.compressor.release.value = 0.03;
        
        // Set up high band (3500Hz+)
        highBand.crossover.type = 'highpass';
        highBand.crossover.frequency.value = 3500;
        highBand.crossover.Q.value = 0.7;
        
        highBand.compressor.threshold.value = -30;
        highBand.compressor.knee.value = 3;
        highBand.compressor.ratio.value = 4; // Less compression
        highBand.compressor.attack.value = 0.0005;
        highBand.compressor.release.value = 0.02;
        
        return {
            lowBand: lowBand,
            midBand: midBand,
            highBand: highBand
        };
    }
    
    // Create a spatial modulator for subtle movement (festival feel)
    createSpatialModulator() {
        // ADJUSTED: Even more subtle movement to prevent phasing issues
        const lfoRate = this.audioContext.createOscillator();
        lfoRate.type = 'sine';
        lfoRate.frequency.value = 0.12;
        
        const lfoDepth = this.audioContext.createGain();
        lfoDepth.gain.value = 0.04; // Reduced movement
        
        const lfoRate2 = this.audioContext.createOscillator();
        lfoRate2.type = 'sine';
        lfoRate2.frequency.value = 0.18;
        
        const lfoDepth2 = this.audioContext.createGain();
        lfoDepth2.gain.value = 0.03; // Reduced movement
        
        // Start oscillators
        lfoRate.start();
        lfoRate2.start();
        
        // Connect oscillators to depth controls
        lfoRate.connect(lfoDepth);
        lfoRate2.connect(lfoDepth2);
        
        return {
            lfoRate: lfoRate,
            lfoDepth: lfoDepth,
            lfoRate2: lfoRate2,
            lfoDepth2: lfoDepth2
        };
    }
    
    // Create concert ambience simulation
    createConcertAmbience() {
        // ADJUSTED: Less pronounced ambience to reduce muddy sound
        const earlyFilter = this.audioContext.createBiquadFilter();
        earlyFilter.type = 'bandpass';
        earlyFilter.frequency.value = 2000;
        earlyFilter.Q.value = 0.5;
        
        const earlyGain = this.audioContext.createGain();
        earlyGain.gain.value = 0.10; // Reduced reflections
        
        const crowdFilter = this.audioContext.createBiquadFilter();
        crowdFilter.type = 'bandpass';
        crowdFilter.frequency.value = 800;
        crowdFilter.Q.value = 1.2;
        
        const crowdGain = this.audioContext.createGain();
        crowdGain.gain.value = 0.08; // Reduced crowd ambience
        
        return {
            earlyFilter: earlyFilter,
            earlyGain: earlyGain,
            crowdFilter: crowdFilter,
            crowdGain: crowdGain
        };
    }
    
    // Creates stereo field preservation
    createSpatialPreservation() {
        // ADJUSTED: Less extreme stereo enhancement
        const midFilter = this.audioContext.createBiquadFilter();
        midFilter.type = 'peaking';
        midFilter.frequency.value = 3000;
        midFilter.Q.value = 0.5;
        midFilter.gain.value = 1;
        
        const sideFilter = this.audioContext.createBiquadFilter();
        sideFilter.type = 'peaking';
        sideFilter.frequency.value = 6000;
        sideFilter.Q.value = 0.65;
        sideFilter.gain.value = 2.5; // Reduced enhancement
        
        return {
            mid: midFilter,
            side: sideFilter
        };
    }
    
    // Creates a frequency band-specific virtualizer
    createBandVirtualizer(lowFreq, highFreq) {
        const lowpass = this.audioContext.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = highFreq;
        lowpass.Q.value = 0.7;
        
        const highpass = this.audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = lowFreq;
        highpass.Q.value = 0.7;
        
        return {
            lowpass: lowpass,
            highpass: highpass,
            gain: this.audioContext.createGain()
        };
    }

    createProcessingChainForElement(source) {
        try {
            // Create a new chain for this source
            const chain = {
                noiseReduction: this.audioContext.createBiquadFilter(),
                clarity: this.audioContext.createBiquadFilter(),
                dynamicRange: this.audioContext.createDynamicsCompressor(),
                equalizers: []
            };
            
            // Initialize with same settings as main nodes
            chain.noiseReduction.type = "lowpass";
            chain.noiseReduction.frequency.value = this.noiseReductionNode.frequency.value;
            
            chain.clarity.type = "peaking";
            chain.clarity.frequency.value = this.clarityNode.frequency.value;
            chain.clarity.gain.value = this.clarityNode.gain.value;
            
            chain.dynamicRange.threshold.value = this.dynamicRangeNode.threshold.value;
            chain.dynamicRange.knee.value = this.dynamicRangeNode.knee.value;
            chain.dynamicRange.ratio.value = this.dynamicRangeNode.ratio.value;
            chain.dynamicRange.attack.value = this.dynamicRangeNode.attack.value;
            chain.dynamicRange.release.value = this.dynamicRangeNode.release.value;
            
            // Create EQ bands
            chain.equalizers = this.frequencies.map(freq => {
                const eq = this.audioContext.createBiquadFilter();
                eq.type = 'peaking';
                eq.frequency.value = freq;
                eq.Q.value = 1;
                eq.gain.value = 0;
                return eq;
            });

            // Create voice isolation components for this chain
            chain.voiceIsolationNode = this.audioContext.createBiquadFilter();
            chain.voiceIsolationNode.type = 'bandpass';
            chain.voiceIsolationNode.frequency.value = 2000;
            chain.voiceIsolationNode.Q.value = 0.5;

            chain.voiceLowPass = this.audioContext.createBiquadFilter();
            chain.voiceLowPass.type = 'lowpass';
            chain.voiceLowPass.frequency.value = 3500;
            chain.voiceLowPass.Q.value = 0.7;

            chain.voiceHighPass = this.audioContext.createBiquadFilter();
            chain.voiceHighPass.type = 'highpass';
            chain.voiceHighPass.frequency.value = 300;
            chain.voiceHighPass.Q.value = 0.7;

            chain.voiceFormantEQ = this.audioContext.createBiquadFilter();
            chain.voiceFormantEQ.type = 'peaking';
            chain.voiceFormantEQ.frequency.value = 2800;
            chain.voiceFormantEQ.Q.value = 2;
            chain.voiceFormantEQ.gain.value = 0; // Start at 0

            chain.speechClarityEQ = this.audioContext.createBiquadFilter();
            chain.speechClarityEQ.type = 'peaking';
            chain.speechClarityEQ.frequency.value = 1800;
            chain.speechClarityEQ.Q.value = 1.5;
            chain.speechClarityEQ.gain.value = 0; // Start at 0

            chain.voiceSplitterNode = this.audioContext.createGain();
            chain.backgroundNoiseNode = this.audioContext.createGain();

            chain.voiceDynamicsProcessor = this.audioContext.createDynamicsCompressor();
            chain.voiceDynamicsProcessor.threshold.value = -24;
            chain.voiceDynamicsProcessor.knee.value = 6;
            chain.voiceDynamicsProcessor.ratio.value = 2;
            chain.voiceDynamicsProcessor.attack.value = 0.003;
            chain.voiceDynamicsProcessor.release.value = 0.25;

            chain.noiseGateNode = this.createNoiseGate();

            // Default: Voice isolation disabled
            chain.voiceSplitterNode.gain.value = 0;
            chain.backgroundNoiseNode.gain.value = 1;
            
            // Connect the chain
            let currentNode = source;
            
            currentNode.connect(chain.noiseReduction);
            currentNode = chain.noiseReduction;
            
            currentNode.connect(chain.clarity);
            currentNode = chain.clarity;
            
            currentNode.connect(chain.dynamicRange);
            currentNode = chain.dynamicRange;
            
            // Connect through EQ bands
            chain.equalizers.forEach(eq => {
                currentNode.connect(eq);
                currentNode = eq;
            });
            
            // Create a gain node for this chain
            chain.gain = this.audioContext.createGain();
            chain.gain.gain.value = this.currentVolumeValue || 1.0;
            
            // Insert spatial processing if enabled
            if (this.spatialEnabled) {
                const usedPremiumSpatial = this.createSpatialChainForElement(chain, currentNode);
                
                // If premium spatial failed, connect directly to gain
                if (!usedPremiumSpatial) {
                    // Connect the main audio path through the background path
                    currentNode.connect(chain.backgroundNoiseNode);
                    chain.backgroundNoiseNode.connect(chain.gain);

                    // Also connect through voice processing path
                    currentNode.connect(chain.voiceHighPass);
                    chain.voiceHighPass.connect(chain.voiceLowPass);
                    chain.voiceLowPass.connect(chain.voiceIsolationNode);
                    chain.voiceIsolationNode.connect(chain.voiceFormantEQ);
                    chain.voiceFormantEQ.connect(chain.speechClarityEQ);
                    chain.speechClarityEQ.connect(chain.voiceDynamicsProcessor);
                    chain.voiceDynamicsProcessor.connect(chain.noiseGateNode);
                    chain.noiseGateNode.connect(chain.voiceSplitterNode);
                    chain.voiceSplitterNode.connect(chain.gain);
                }
            } else {
                // No spatial, connect with voice isolation
                // Connect the main audio path through the background path
                currentNode.connect(chain.backgroundNoiseNode);
                chain.backgroundNoiseNode.connect(chain.gain);

                // Also connect through voice processing path
                currentNode.connect(chain.voiceHighPass);
                chain.voiceHighPass.connect(chain.voiceLowPass);
                chain.voiceLowPass.connect(chain.voiceIsolationNode);
                chain.voiceIsolationNode.connect(chain.voiceFormantEQ);
                chain.voiceFormantEQ.connect(chain.speechClarityEQ);
                chain.speechClarityEQ.connect(chain.voiceDynamicsProcessor);
                chain.voiceDynamicsProcessor.connect(chain.noiseGateNode);
                chain.noiseGateNode.connect(chain.voiceSplitterNode);
                chain.voiceSplitterNode.connect(chain.gain);
            }
            
            // Connect the final gain to destination
            chain.gain.connect(this.audioContext.destination);
            
            // Store the source element reference for reconnections
            chain.element = source._element;
            
            return chain;
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error creating processing chain:', error);
            return null;
        }
    }

    // Creates a premium spatial audio chain for an element - OPTIMIZED for better sound quality
    createSpatialChainForElement(chain, sourceNode) {
        if (!this.spatialEnabled) return false;
        
        try {
            // Initialize direct and ambient paths for this chain
            chain.directPath = this.audioContext.createGain();
            chain.directGain = this.audioContext.createGain();
            chain.directGain.gain.value = 0.75; // ADJUSTED: Increased for cleaner sound
            
            chain.ambientPath = this.audioContext.createGain();
            chain.ambientGain = this.audioContext.createGain();
            chain.ambientGain.gain.value = 0.38; // ADJUSTED: Decreased to reduce muddiness
            
            // Create content-specific EQ bands for this chain
            chain.vocalPresenceEQ = this.createResonantFilter(3000, 1.5, 0);
            chain.vocalFundamentalsEQ = this.createResonantFilter(800, 1.3, 0);
            chain.dialogEQ = this.createResonantFilter(2200, 1.8, 0);
            
            // Create virtual speakers for 360° sound with moderate positioning
            chain.frontLeftNode = this.createVirtualSpeaker(-30, 0, -1);
            chain.frontRightNode = this.createVirtualSpeaker(30, 0, -1);
            chain.surroundLeftNode = this.createVirtualSpeaker(-110, 0, 0);
            chain.surroundRightNode = this.createVirtualSpeaker(110, 0, 0);
            chain.topNode = this.createVirtualSpeaker(0, 40, -1);
            
            // NEW: Expanded 7.1.4 speaker configuration (with reduced gains)
            chain.centerNode = this.createVirtualSpeaker(0, 0, -1);
            chain.topFrontLeftNode = this.createVirtualSpeaker(-35, 40, -0.8);
            chain.topFrontRightNode = this.createVirtualSpeaker(35, 40, -0.8);
            chain.topRearLeftNode = this.createVirtualSpeaker(-120, 40, 0.5);
            chain.topRearRightNode = this.createVirtualSpeaker(120, 40, 0.5);
            chain.subwooferNode = this.createVirtualSpeaker(0, -10, 0);
            
            // Create gains for each speaker (with REDUCED values to prevent clipping)
            chain.speakerGains = {
                frontLeft: this.audioContext.createGain(),
                frontRight: this.audioContext.createGain(),
                surroundLeft: this.audioContext.createGain(),
                surroundRight: this.audioContext.createGain(),
                top: this.audioContext.createGain(),
                // NEW: Additional speaker gains
                center: this.audioContext.createGain(),
                topFrontLeft: this.audioContext.createGain(),
                topFrontRight: this.audioContext.createGain(),
                topRearLeft: this.audioContext.createGain(),
                topRearRight: this.audioContext.createGain(),
                subwoofer: this.audioContext.createGain()
            };
            
            // Set speaker gains with LOWER values
            chain.speakerGains.frontLeft.gain.value = 0.35;
            chain.speakerGains.frontRight.gain.value = 0.35;
            chain.speakerGains.surroundLeft.gain.value = 0.30;
            chain.speakerGains.surroundRight.gain.value = 0.30;
            chain.speakerGains.top.gain.value = 0.25;
            
            // NEW: Set gains for additional speakers
            chain.speakerGains.center.gain.value = 0.40;
            chain.speakerGains.topFrontLeft.gain.value = 0.20;
            chain.speakerGains.topFrontRight.gain.value = 0.20;
            chain.speakerGains.topRearLeft.gain.value = 0.15;
            chain.speakerGains.topRearRight.gain.value = 0.15;
            chain.speakerGains.subwoofer.gain.value = 0.35;
            
            // Create spectral processor with milder settings
            chain.spectralProcessor = {
                concha1: this.createResonantFilter(5000, 8.5, 2.5),
                concha2: this.createResonantFilter(10000, 6.5, 1.5),
                pinna1: this.createResonantFilter(4000, 3.2, 2.0),
                pinna2: this.createResonantFilter(8000, 6.5, 1.5),
                headShadow: this.createLowShelfFilter(1000, -1)
            };
            
            // Create direct path EQ with balanced values
            chain.directEQ = {
                highShelf: this.createHighShelfFilter(7500, 2),
                presence: this.createResonantFilter(2800, 1, 1),
                upperMid: this.createResonantFilter(5000, 0.8, 0.5),
                lowControl: this.createLowShelfFilter(250, -0.5)
            };
            
            // Create improved transient enhancer with gentler settings
            chain.transientEnhancer = this.audioContext.createDynamicsCompressor();
            chain.transientEnhancer.threshold.value = -30;
            chain.transientEnhancer.knee.value = 6;
            chain.transientEnhancer.ratio.value = 3;
            chain.transientEnhancer.attack.value = 0.001;
            chain.transientEnhancer.release.value = 0.050;
            
            // Create spatial preservation with less extreme settings
            chain.spatialPreservation = {
                mid: this.audioContext.createBiquadFilter(),
                side: this.audioContext.createBiquadFilter()
            };
            chain.spatialPreservation.mid.type = 'peaking';
            chain.spatialPreservation.mid.frequency.value = 3000;
            chain.spatialPreservation.mid.Q.value = 0.5;
            chain.spatialPreservation.mid.gain.value = 1;
            
            chain.spatialPreservation.side.type = 'peaking';
            chain.spatialPreservation.side.frequency.value = 6000;
            chain.spatialPreservation.side.Q.value = 0.65;
            chain.spatialPreservation.side.gain.value = 2.5;
            
            // Create multiband virtualizer with milder band splitting
            chain.virtualizer = {
                lowBand: this.createBandVirtualizer(20, 250),
                midBand: this.createBandVirtualizer(250, 4000),
                highBand: this.createBandVirtualizer(4000, 20000)
            };
            
            // Create immersion control with reduced gain
            chain.immersionControl = this.audioContext.createGain();
            chain.immersionControl.gain.value = 0.52;
            
            // Create mid-side processing splitter with moderate values
            chain.midSideProcessor = {
                splitter: this.audioContext.createChannelSplitter(2),
                merger: this.audioContext.createChannelMerger(2),
                midGain: this.audioContext.createGain(),
                sideGain: this.audioContext.createGain()
            };
            
            // Set mid-side gains based on spatial width but with less extreme values
            const scaledWidth = (this.spatialWidth - 50) / 100;
            chain.midSideProcessor.midGain.gain.value = 0.85;
            chain.midSideProcessor.sideGain.gain.value = 1.10;
            
            // Create harmonic exciter for this chain - GENTLER settings
            chain.harmonicExciter = {
                highpass: this.audioContext.createBiquadFilter(),
                waveshaper: this.audioContext.createWaveShaper(),
                dryGain: this.audioContext.createGain(),
                wetGain: this.audioContext.createGain()
            };
            
            // Set up harmonic exciter parameters
            chain.harmonicExciter.highpass.type = 'highpass';
            chain.harmonicExciter.highpass.frequency.value = 4000; // Higher cutoff to reduce mud
            chain.harmonicExciter.highpass.Q.value = 0.7;
            
            // Create saturation curve
            const curve = new Float32Array(44100);
            const amount = 2.5; // REDUCED amount
            
            for (let i = 0; i < 44100; i++) {
                const x = (i * 2) / 44100 - 1;
                curve[i] = (Math.tanh(amount * x) + x * 0.03) / (1 + amount * Math.abs(x));
            }
            
            chain.harmonicExciter.waveshaper.curve = curve;
            chain.harmonicExciter.waveshaper.oversample = '4x';
            
            chain.harmonicExciter.dryGain.gain.value = 0.90;
            chain.harmonicExciter.wetGain.gain.value = 0.18; // REDUCED for less distortion
            
            // Create multiband transient processor - GENTLER settings
            chain.multibandTransient = {
                lowBand: {
                    crossover: this.audioContext.createBiquadFilter(),
                    compressor: this.audioContext.createDynamicsCompressor()
                },
                midBand: {
                    lowCrossover: this.audioContext.createBiquadFilter(),
                    highCrossover: this.audioContext.createBiquadFilter(),
                    compressor: this.audioContext.createDynamicsCompressor()
                },
                highBand: {
                    crossover: this.audioContext.createBiquadFilter(),
                    compressor: this.audioContext.createDynamicsCompressor()
                }
            };
            
            // Set up multiband transient with GENTLER compression
            // Low band
            chain.multibandTransient.lowBand.crossover.type = 'lowpass';
            chain.multibandTransient.lowBand.crossover.frequency.value = 250;
            chain.multibandTransient.lowBand.crossover.Q.value = 0.7;
            
            chain.multibandTransient.lowBand.compressor.threshold.value = -24;
            chain.multibandTransient.lowBand.compressor.knee.value = 6;
            chain.multibandTransient.lowBand.compressor.ratio.value = 2.5;
            chain.multibandTransient.lowBand.compressor.attack.value = 0.005;
            chain.multibandTransient.lowBand.compressor.release.value = 0.05;
            
            // Mid band
            chain.multibandTransient.midBand.lowCrossover.type = 'highpass';
            chain.multibandTransient.midBand.lowCrossover.frequency.value = 250;
            chain.multibandTransient.midBand.lowCrossover.Q.value = 0.7;
            
            chain.multibandTransient.midBand.highCrossover.type = 'lowpass';
            chain.multibandTransient.midBand.highCrossover.frequency.value = 4000;
            chain.multibandTransient.midBand.highCrossover.Q.value = 0.7;
            
            chain.multibandTransient.midBand.compressor.threshold.value = -28;
            chain.multibandTransient.midBand.compressor.knee.value = 4;
            chain.multibandTransient.midBand.compressor.ratio.value = 3;
            chain.multibandTransient.midBand.compressor.attack.value = 0.001;
            chain.multibandTransient.midBand.compressor.release.value = 0.03;
            
            // High band
            chain.multibandTransient.highBand.crossover.type = 'highpass';
            chain.multibandTransient.highBand.crossover.frequency.value = 4000;
            chain.multibandTransient.highBand.crossover.Q.value = 0.7;
            
            chain.multibandTransient.highBand.compressor.threshold.value = -30;
            chain.multibandTransient.highBand.compressor.knee.value = 3;
            chain.multibandTransient.highBand.compressor.ratio.value = 4;
            chain.multibandTransient.highBand.compressor.attack.value = 0.0005;
            chain.multibandTransient.highBand.compressor.release.value = 0.02;
            
            // Create spatial modulator - SUBTLE movement
            chain.spatialModulator = {
                lfoRate: this.audioContext.createOscillator(),
                lfoDepth: this.audioContext.createGain(),
                lfoRate2: this.audioContext.createOscillator(),
                lfoDepth2: this.audioContext.createGain()
            };
            
            chain.spatialModulator.lfoRate.type = 'sine';
            chain.spatialModulator.lfoRate.frequency.value = 0.12;
            chain.spatialModulator.lfoDepth.gain.value = 0.04;
            
            chain.spatialModulator.lfoRate2.type = 'sine';
            chain.spatialModulator.lfoRate2.frequency.value = 0.18;
            chain.spatialModulator.lfoDepth2.gain.value = 0.03;
            
            // Start oscillators
            chain.spatialModulator.lfoRate.start();
            chain.spatialModulator.lfoRate2.start();
            
            // Connect oscillators to depth controls
            chain.spatialModulator.lfoRate.connect(chain.spatialModulator.lfoDepth);
            chain.spatialModulator.lfoRate2.connect(chain.spatialModulator.lfoDepth2);
            
            // Create concert ambience with SUBTLE settings
            chain.concertAmbience = {
                earlyFilter: this.audioContext.createBiquadFilter(),
                earlyGain: this.audioContext.createGain(),
                crowdFilter: this.audioContext.createBiquadFilter(),
                crowdGain: this.audioContext.createGain()
            };
            
            chain.concertAmbience.earlyFilter.type = 'bandpass';
            chain.concertAmbience.earlyFilter.frequency.value = 2000;
            chain.concertAmbience.earlyFilter.Q.value = 0.5;
            chain.concertAmbience.earlyGain.gain.value = 0.10;
            
            chain.concertAmbience.crowdFilter.type = 'bandpass';
            chain.concertAmbience.crowdFilter.frequency.value = 800;
            chain.concertAmbience.crowdFilter.Q.value = 1.2;
            chain.concertAmbience.crowdGain.gain.value = 0.08;
            
            // NEW: Voice isolation processing path - GENTLE settings
            chain.voiceFilter = this.createVoiceBandpassFilter();
            chain.voiceGain = this.audioContext.createGain();
            chain.voiceGain.gain.value = 0.50; // Lower to prevent distortion
            
            chain.ambienceFilter = this.audioContext.createBiquadFilter();
            chain.ambienceFilter.type = 'notch';
            chain.ambienceFilter.frequency.value = 2500;
            chain.ambienceFilter.Q.value = 0.7;
            chain.ambienceGain = this.audioContext.createGain();
            chain.ambienceGain.gain.value = 0.40; // Lower to prevent muddiness
            
            // NEW: Create voice detection analyser
            chain.voiceAnalyser = this.audioContext.createAnalyser();
            chain.voiceAnalyser.fftSize = 1024;
            chain.voiceAnalyser.smoothingTimeConstant = 0.8;
            
            // NEW: Create frequency band-specific processing paths - SIMPLER approach
            chain.lowFrequencyPath = this.createFrequencyBandPath('lowpass', 150);
            chain.midFrequencyPath = this.createFrequencyBandPath('bandpass', 2500);
            chain.highFrequencyPath = this.createFrequencyBandPath('highpass', 8000);
            
            // NEW: Create externalization processing components - GENTLE settings
            chain.earlyReflections = this.createEarlyReflections();
            chain.pinnaSimulation = this.createPinnaSimulation();
            chain.distanceSimulation = this.createDistanceSimulation();
            
            // OUTPUT MIXER - final mixer for all virtual speaker outputs
            chain.outputMixer = this.audioContext.createGain();
            
            // ================================================================================
            // STREAMLINED CONNECTION APPROACH FOR BETTER SOUND QUALITY
            // ================================================================================
            
            // Create a cleaner audio graph with fewer parallel paths
            
            // DIRECT PATH - clean signal for clarity
            sourceNode.connect(chain.directPath);
            chain.directPath.connect(chain.directEQ.lowControl);
            chain.directEQ.lowControl.connect(chain.directEQ.presence);
            chain.directEQ.presence.connect(chain.directEQ.upperMid);
            chain.directEQ.upperMid.connect(chain.directEQ.highShelf);
            chain.directEQ.highShelf.connect(chain.directGain);
            chain.directGain.connect(chain.gain);
            
            // SPATIAL PATH - for ambience and immersion
            sourceNode.connect(chain.ambientPath);
            
            // Apply basic spatial processing
            chain.ambientPath.connect(chain.speakerGains.frontLeft);
            chain.ambientPath.connect(chain.speakerGains.frontRight);
            chain.ambientPath.connect(chain.speakerGains.surroundLeft);
            chain.ambientPath.connect(chain.speakerGains.surroundRight);
            chain.ambientPath.connect(chain.speakerGains.top);
            
            // NEW: Connect to additional speakers with balanced gains
            chain.ambientPath.connect(chain.speakerGains.center);
            chain.ambientPath.connect(chain.speakerGains.topFrontLeft);
            chain.ambientPath.connect(chain.speakerGains.topFrontRight);
            chain.ambientPath.connect(chain.speakerGains.topRearLeft);
            chain.ambientPath.connect(chain.speakerGains.topRearRight);
            
            // Dedicated voice handling - simplified but effective
            sourceNode.connect(chain.voiceFilter);
            chain.voiceFilter.connect(chain.voiceGain);
            chain.voiceGain.connect(chain.speakerGains.center);
            
            // Subwoofer path for clean bass
            sourceNode.connect(chain.lowFrequencyPath.filter);
            chain.lowFrequencyPath.filter.connect(chain.lowFrequencyPath.gain);
            chain.lowFrequencyPath.gain.connect(chain.speakerGains.subwoofer);
            
            // Connect all speakers to the virtual speaker nodes
            chain.speakerGains.frontLeft.connect(chain.frontLeftNode);
            chain.speakerGains.frontRight.connect(chain.frontRightNode);
            chain.speakerGains.surroundLeft.connect(chain.surroundLeftNode);
            chain.speakerGains.surroundRight.connect(chain.surroundRightNode);
            chain.speakerGains.top.connect(chain.topNode);
            chain.speakerGains.center.connect(chain.centerNode);
            chain.speakerGains.subwoofer.connect(chain.subwooferNode);
            chain.speakerGains.topFrontLeft.connect(chain.topFrontLeftNode);
            chain.speakerGains.topFrontRight.connect(chain.topFrontRightNode);
            chain.speakerGains.topRearLeft.connect(chain.topRearLeftNode);
            chain.speakerGains.topRearRight.connect(chain.topRearRightNode);
            
            // Connect all virtual speakers to the output mixer
            chain.frontLeftNode.connect(chain.outputMixer);
            chain.frontRightNode.connect(chain.outputMixer);
            chain.surroundLeftNode.connect(chain.outputMixer);
            chain.surroundRightNode.connect(chain.outputMixer);
            chain.topNode.connect(chain.outputMixer);
            chain.centerNode.connect(chain.outputMixer);
            chain.subwooferNode.connect(chain.outputMixer);
            chain.topFrontLeftNode.connect(chain.outputMixer);
            chain.topFrontRightNode.connect(chain.outputMixer);
            chain.topRearLeftNode.connect(chain.outputMixer);
            chain.topRearRightNode.connect(chain.outputMixer);
            
            // Connect the output mixer to the gain node with subtle enhancement
            chain.outputMixer.connect(chain.transientEnhancer);
            chain.transientEnhancer.connect(chain.ambientGain);
            chain.ambientGain.connect(chain.gain);
            
            // Initialize head tracking if enabled
            if (this.headTrackingEnabled) {
                this.applyHeadOrientationToChain(chain);
            }
            
            // Initialize voice detection processing
            this.initializeVoiceDetection(chain);
            
            // Apply initial spatial mode
            if (this.spatialMode) {
                this.applyModeToChain(chain, this.spatialMode);
            }

            // Connect the voice isolation components along with spatial audio
            // Connect the main audio path through the background path
            sourceNode.connect(chain.backgroundNoiseNode);
            chain.backgroundNoiseNode.connect(chain.gain);

            // Also connect through voice processing path
            sourceNode.connect(chain.voiceHighPass);
            chain.voiceHighPass.connect(chain.voiceLowPass);
            chain.voiceLowPass.connect(chain.voiceIsolationNode);
            chain.voiceIsolationNode.connect(chain.voiceFormantEQ);
            chain.voiceFormantEQ.connect(chain.speechClarityEQ);
            chain.speechClarityEQ.connect(chain.voiceDynamicsProcessor);
            chain.voiceDynamicsProcessor.connect(chain.noiseGateNode);
            chain.noiseGateNode.connect(chain.voiceSplitterNode);
            chain.voiceSplitterNode.connect(chain.gain);
            
            console.log('[Audio Enhancer Debug] Enhanced premium spatial audio chain created');
            return true;
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error creating spatial chain:', error);
            return false;
        }
    }

    // NEW METHODS FOR ENHANCED FEATURES

    // Initialize head tracking
    initializeHeadTracking() {
        if (!this.headTrackingEnabled && window.DeviceOrientationEvent) {
            try {
                // Define the orientation listener function
                this.orientationListener = (event) => {
                    // Update orientation values with smoothing
                    if (event.alpha !== null) {
                        this.headOrientation.alpha = this.smoothValue(this.headOrientation.alpha, event.alpha, 0.3);
                    }
                    if (event.beta !== null) {
                        this.headOrientation.beta = this.smoothValue(this.headOrientation.beta, event.beta, 0.3);
                    }
                    if (event.gamma !== null) {
                        this.headOrientation.gamma = this.smoothValue(this.headOrientation.gamma, event.gamma, 0.3);
                    }
                    
                    // Apply head orientation to all active spatial chains
                    this.applyHeadOrientationToAudioChains();
                };
                
                // Check if we need permission for device orientation
                if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                    // iOS 13+ requires permission
                    DeviceOrientationEvent.requestPermission()
                        .then(permissionState => {
                            if (permissionState === 'granted') {
                                window.addEventListener('deviceorientation', this.orientationListener);
                                this.headTrackingEnabled = true;
                                console.log('[Audio Enhancer Debug] Head tracking enabled (iOS)');
                            } else {
                                console.warn('[Audio Enhancer Debug] Head tracking permission denied');
                            }
                        })
                        .catch(console.error);
                } else {
                    // Standard implementation for other browsers
                    window.addEventListener('deviceorientation', this.orientationListener);
                    this.headTrackingEnabled = true;
                    console.log('[Audio Enhancer Debug] Head tracking enabled');
                }
            } catch (error) {
                console.error('[Audio Enhancer Debug] Error initializing head tracking:', error);
            }
        }
    }

    // Helper function to smooth orientation changes
    smoothValue(currentValue, newValue, alpha) {
        // Apply exponential smoothing to prevent jerky movements
        // alpha determines smoothing amount (0-1, lower = more smoothing)
        return currentValue * (1 - alpha) + newValue * alpha;
    }

    // Apply head orientation to all active spatial chains
    applyHeadOrientationToAudioChains() {
        if (!this.headTrackingEnabled) return;
        
        this.processingChains.forEach(chain => {
            if (chain.frontLeftNode && chain.spatialEnabled) {
                // Apply orientation offsets to speaker positions
                this.applyHeadOrientationToChain(chain);
            }
        });
    }

    // Apply head orientation to a specific chain
    applyHeadOrientationToChain(chain) {
        if (!chain) return;
        
        // Calculate offsets based on head orientation
        const alphaRad = (this.headOrientation.alpha * Math.PI) / 180;
        const betaRad = (this.headOrientation.beta * Math.PI) / 180;
        const gammaRad = (this.headOrientation.gamma * Math.PI) / 180;
        
        // Apply rotations to all virtual speakers
        this.rotateVirtualSpeaker(chain.frontLeftNode, alphaRad, betaRad, gammaRad);
        this.rotateVirtualSpeaker(chain.frontRightNode, alphaRad, betaRad, gammaRad);
        this.rotateVirtualSpeaker(chain.surroundLeftNode, alphaRad, betaRad, gammaRad);
        this.rotateVirtualSpeaker(chain.surroundRightNode, alphaRad, betaRad, gammaRad);
        this.rotateVirtualSpeaker(chain.topNode, alphaRad, betaRad, gammaRad);
        
        // Apply to expanded speaker configuration if available
        if (chain.centerNode) this.rotateVirtualSpeaker(chain.centerNode, alphaRad, betaRad, gammaRad);
        if (chain.subwooferNode) this.rotateVirtualSpeaker(chain.subwooferNode, alphaRad, betaRad, gammaRad);
        if (chain.topFrontLeftNode) this.rotateVirtualSpeaker(chain.topFrontLeftNode, alphaRad, betaRad, gammaRad);
        if (chain.topFrontRightNode) this.rotateVirtualSpeaker(chain.topFrontRightNode, alphaRad, betaRad, gammaRad);
        if (chain.topRearLeftNode) this.rotateVirtualSpeaker(chain.topRearLeftNode, alphaRad, betaRad, gammaRad);
        if (chain.topRearRightNode) this.rotateVirtualSpeaker(chain.topRearRightNode, alphaRad, betaRad, gammaRad);
    }

    // Rotate a single virtual speaker based on head orientation
    rotateVirtualSpeaker(speaker, alphaRad, betaRad, gammaRad) {
        if (!speaker) return;
        
        // Get the current speaker position
        const x = speaker.positionX.value;
        const y = speaker.positionY.value;
        const z = speaker.positionZ.value;
        
        // Apply rotation transformations (simplified version)
        // First, rotate around Y axis (alpha - looking left/right)
        const x1 = x * Math.cos(alphaRad) - z * Math.sin(alphaRad);
        const z1 = x * Math.sin(alphaRad) + z * Math.cos(alphaRad);
        
        // Then rotate around X axis (beta - looking up/down)
        const y2 = y * Math.cos(betaRad) - z1 * Math.sin(betaRad);
        const z2 = y * Math.sin(betaRad) + z1 * Math.cos(betaRad);
        
        // Finally rotate around Z axis (gamma - tilting head)
        const x3 = x1 * Math.cos(gammaRad) - y2 * Math.sin(gammaRad);
        const y3 = x1 * Math.sin(gammaRad) + y2 * Math.cos(gammaRad);
        
        // Apply new positions with smooth transitions
        speaker.positionX.setTargetAtTime(x3, this.audioContext.currentTime, 0.1);
        speaker.positionY.setTargetAtTime(y3, this.audioContext.currentTime, 0.1);
        speaker.positionZ.setTargetAtTime(z2, this.audioContext.currentTime, 0.1);
    }

    // Clean up head tracking when done
    disableHeadTracking() {
        if (this.headTrackingEnabled && this.orientationListener) {
            window.removeEventListener('deviceorientation', this.orientationListener);
            this.headTrackingEnabled = false;
            console.log('[Audio Enhancer Debug] Head tracking disabled');
        }
    }

    // Voice isolation bandpass filter with GENTLER settings
    createVoiceBandpassFilter() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2500; // Center of human voice range
        filter.Q.value = 0.7; // Wider band for natural sound
        return filter;
    }

    // Create a frequency band-specific processing path
    createFrequencyBandPath(filterType, frequency) {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = frequency;
        filter.Q.value = 0.7;
        
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.7; // REDUCED gain to prevent distortion
        
        return {
            filter: filter,
            gain: gain
        };
    }

    // Create early reflections for externalization - GENTLER settings
    createEarlyReflections() {
        const delay = this.audioContext.createDelay(0.1);
        delay.delayTime.value = 0.04; // 40ms delay for first reflection
        
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.2; // REDUCED to 20% of direct sound
        
        return {
            delay: delay,
            gain: gain
        };
    }

    // Create pinna (outer ear) simulation - GENTLER settings
    createPinnaSimulation() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = 8000; // Typical pinna resonance
        filter.Q.value = 3;
        filter.gain.value = 3; // REDUCED boost from 5 to 3
        
        return {
            filter: filter
        };
    }

    // Create distance simulation - GENTLER settings
    createDistanceSimulation() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 18000; // Slight roll-off of highs
        
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.9;
        
        return {
            filter: filter,
            gain: gain
        };
    }

    // Initialize voice detection - OPTIMIZED for less CPU usage
    initializeVoiceDetection(chain) {
        if (!chain.voiceAnalyser) return;
        
        const analyser = chain.voiceAnalyser;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        // Run voice detection every 150ms instead of 100ms
        const detectVoice = () => {
            if (!chain.element || !chain.element._audioEnhancerConnected) return;
            
            analyser.getByteFrequencyData(dataArray);
            
            // Calculate energy in voice frequency range (roughly 250-3500 Hz)
            const sampleRate = this.audioContext.sampleRate;
            const binSize = sampleRate / analyser.fftSize;
            
            // Calculate bin indices for voice range
            const lowBin = Math.floor(250 / binSize);
            const highBin = Math.floor(3500 / binSize);
            
            // Calculate average energy in voice range
            let voiceEnergy = 0;
            for (let i = lowBin; i <= highBin; i++) {
                voiceEnergy += dataArray[i];
            }
            voiceEnergy /= (highBin - lowBin + 1);
            
            // Normalize to 0-1 range
            voiceEnergy /= 255;
            
            // If voice energy is significant, boost center channel with GENTLER settings
            if (voiceEnergy > 0.35) { // Higher threshold for more accuracy
                // Gradually increase voice gain with LOWER max value
                chain.voiceGain.gain.setTargetAtTime(
                    Math.min(0.65, 0.4 + voiceEnergy * 0.4), // REDUCED max value
                    this.audioContext.currentTime,
                    0.15 // Slower attack for smoother transitions
                );
                
                // Reduce other channels slightly with GENTLER reduction
                chain.ambienceGain.gain.setTargetAtTime(
                    Math.max(0.3, 0.5 - voiceEnergy * 0.2), // GENTLER reduction
                    this.audioContext.currentTime,
                    0.25 // Slower release
                );
            } else {
                // Gradually return to normal balance with BALANCED values
                chain.voiceGain.gain.setTargetAtTime(0.4, this.audioContext.currentTime, 0.3);
                chain.ambienceGain.gain.setTargetAtTime(0.5, this.audioContext.currentTime, 0.3);
            }
            
            // Continue detection if still connected (less frequent check)
            if (chain.element && chain.element._audioEnhancerConnected) {
                setTimeout(detectVoice, 150); // Increased from 100ms
            }
        };
        
        // Start voice detection
        detectVoice();
    }

    // Public method to toggle head tracking
    setHeadTrackingEnabled(enabled) {
        if (enabled && !this.headTrackingEnabled) {
            this.initializeHeadTracking();
        } else if (!enabled && this.headTrackingEnabled) {
            this.disableHeadTracking();
        }
        
        return this.headTrackingEnabled;
    }

    async connectToSource(audioElement) {
        if (!this.initialized) await this.initialize();
        if (this.connectedElements.has(audioElement)) return;

        try {
            // Resume audio context if it's suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Create new MediaElementSource only if not already created
            let source;
            if (this.sources.has(audioElement)) {
                source = this.sources.get(audioElement);
                // If source exists but is disconnected, we need to reconnect
                try {
                    source.connect(this.audioContext.destination);
                    source.disconnect();
                } catch (e) {
                    // Source is invalid, create a new one
                    source = this.audioContext.createMediaElementSource(audioElement);
                    this.sources.set(audioElement, source);
                }
            } else {
                // Create a new source
                source = this.audioContext.createMediaElementSource(audioElement);
                this.sources.set(audioElement, source);
            }
            
            // Store reference to the element for reconnections
            source._element = audioElement;
            
            // Create and connect the processing chain
            const chain = this.createProcessingChainForElement(source);
            if (chain) {
                this.processingChains.set(audioElement, chain);
                this.connectedElements.add(audioElement);
                audioElement._audioEnhancerConnected = true;
                console.log('[Audio Enhancer Debug] Connected to audio element successfully');
            }
        } catch (e) {
            console.error('[Audio Enhancer Debug] Connection Error:', e);
            // Try to recover from failed connection
            this.disconnectFromSource(audioElement);
        }
    }

    disconnectFromSource(audioElement) {
        if (!this.connectedElements.has(audioElement)) return;

        try {
            const source = this.sources.get(audioElement);
            const chain = this.processingChains.get(audioElement);
            
            if (source) {
                // First disconnect from all destinations
                try {
                    source.disconnect();
                } catch (e) {
                    console.log('[Audio Enhancer Debug] Source already disconnected');
                }
                
                // Reconnect directly to output
                try {
                    source.connect(this.audioContext.destination);
                } catch (e) {
                    console.error('[Audio Enhancer Debug] Error reconnecting source to destination:', e);
                }
            }
            
            // Clean up the processing chain
            if (chain) {
                // Disconnect basic audio processing nodes
                chain.noiseReduction.disconnect();
                chain.clarity.disconnect();
                chain.dynamicRange.disconnect();
                chain.equalizers.forEach(eq => eq.disconnect());
                
                // Disconnect content-specific EQ bands if they exist
                if (chain.vocalPresenceEQ) chain.vocalPresenceEQ.disconnect();
                if (chain.vocalFundamentalsEQ) chain.vocalFundamentalsEQ.disconnect();
                if (chain.dialogEQ) chain.dialogEQ.disconnect();
                
                // Disconnect premium spatial audio nodes
                if (chain.directPath) chain.directPath.disconnect();
                if (chain.directGain) chain.directGain.disconnect();
                if (chain.ambientPath) chain.ambientPath.disconnect();
                if (chain.ambientGain) chain.ambientGain.disconnect();
                
                // Disconnect virtual speakers
                if (chain.frontLeftNode) chain.frontLeftNode.disconnect();
                if (chain.frontRightNode) chain.frontRightNode.disconnect();
                if (chain.surroundLeftNode) chain.surroundLeftNode.disconnect();
                if (chain.surroundRightNode) chain.surroundRightNode.disconnect();
                if (chain.topNode) chain.topNode.disconnect();
                
                // Disconnect expanded speaker array
                if (chain.centerNode) chain.centerNode.disconnect();
                if (chain.subwooferNode) chain.subwooferNode.disconnect();
                if (chain.topFrontLeftNode) chain.topFrontLeftNode.disconnect();
                if (chain.topFrontRightNode) chain.topFrontRightNode.disconnect();
                if (chain.topRearLeftNode) chain.topRearLeftNode.disconnect();
                if (chain.topRearRightNode) chain.topRearRightNode.disconnect();
                
                // Disconnect speaker gains
                if (chain.speakerGains) {
                    Object.values(chain.speakerGains).forEach(gain => {
                        if (gain) gain.disconnect();
                    });
                }
                
                // Disconnect spectral processor
                if (chain.spectralProcessor) {
                    Object.values(chain.spectralProcessor).forEach(node => {
                        if (node) node.disconnect();
                    });
                }
                
                // Disconnect direct EQ
                if (chain.directEQ) {
                    Object.values(chain.directEQ).forEach(node => {
                        if (node) node.disconnect();
                    });
                }
                
                // Disconnect other spatial nodes
                if (chain.transientEnhancer) chain.transientEnhancer.disconnect();
                if (chain.immersionControl) chain.immersionControl.disconnect();
                if (chain.outputMixer) chain.outputMixer.disconnect();
                
                // Disconnect mid-side processor
                if (chain.midSideProcessor) {
                    if (chain.midSideProcessor.splitter) chain.midSideProcessor.splitter.disconnect();
                    if (chain.midSideProcessor.merger) chain.midSideProcessor.merger.disconnect();
                    if (chain.midSideProcessor.midGain) chain.midSideProcessor.midGain.disconnect();
                    if (chain.midSideProcessor.sideGain) chain.midSideProcessor.sideGain.disconnect();
                }
                
                // Disconnect virtualizers
                if (chain.virtualizer) {
                    Object.values(chain.virtualizer).forEach(band => {
                        if (band) {
                            if (band.lowpass) band.lowpass.disconnect();
                            if (band.highpass) band.highpass.disconnect();
                            if (band.gain) band.gain.disconnect();
                        }
                    });
                }
                
                // Disconnect enhanced components
                
                // Disconnect harmonic exciter
                if (chain.harmonicExciter) {
                    if (chain.harmonicExciter.highpass) chain.harmonicExciter.highpass.disconnect();
                    if (chain.harmonicExciter.waveshaper) chain.harmonicExciter.waveshaper.disconnect();
                    if (chain.harmonicExciter.dryGain) chain.harmonicExciter.dryGain.disconnect();
                    if (chain.harmonicExciter.wetGain) chain.harmonicExciter.wetGain.disconnect();
                }
                
                // Disconnect multiband transient
                if (chain.multibandTransient) {
                    if (chain.multibandTransient.lowBand) {
                        if (chain.multibandTransient.lowBand.crossover) chain.multibandTransient.lowBand.crossover.disconnect();
                        if (chain.multibandTransient.lowBand.compressor) chain.multibandTransient.lowBand.compressor.disconnect();
                    }
                    if (chain.multibandTransient.midBand) {
                        if (chain.multibandTransient.midBand.lowCrossover) chain.multibandTransient.midBand.lowCrossover.disconnect();
                        if (chain.multibandTransient.midBand.highCrossover) chain.multibandTransient.midBand.highCrossover.disconnect();
                        if (chain.multibandTransient.midBand.compressor) chain.multibandTransient.midBand.compressor.disconnect();
                    }
                    if (chain.multibandTransient.highBand) {
                        if (chain.multibandTransient.highBand.crossover) chain.multibandTransient.highBand.crossover.disconnect();
                        if (chain.multibandTransient.highBand.compressor) chain.multibandTransient.highBand.compressor.disconnect();
                    }
                }
                
                // Disconnect spatial modulator
                if (chain.spatialModulator) {
                    if (chain.spatialModulator.lfoRate) chain.spatialModulator.lfoRate.disconnect();
                    if (chain.spatialModulator.lfoDepth) chain.spatialModulator.lfoDepth.disconnect();
                    if (chain.spatialModulator.lfoRate2) chain.spatialModulator.lfoRate2.disconnect();
                    if (chain.spatialModulator.lfoDepth2) chain.spatialModulator.lfoDepth2.disconnect();
                    
                    // Stop oscillators
                    try {
                        if (chain.spatialModulator.lfoRate) chain.spatialModulator.lfoRate.stop();
                        if (chain.spatialModulator.lfoRate2) chain.spatialModulator.lfoRate2.stop();
                    } catch (e) {
                        // Ignore errors from already stopped oscillators
                    }
                }
                
                // Disconnect concert ambience
                if (chain.concertAmbience) {
                    if (chain.concertAmbience.earlyFilter) chain.concertAmbience.earlyFilter.disconnect();
                    if (chain.concertAmbience.earlyGain) chain.concertAmbience.earlyGain.disconnect();
                    if (chain.concertAmbience.crowdFilter) chain.concertAmbience.crowdFilter.disconnect();
                    if (chain.concertAmbience.crowdGain) chain.concertAmbience.crowdGain.disconnect();
                }
                
                // Disconnect voice isolation nodes
                if (chain.voiceFilter) chain.voiceFilter.disconnect();
                if (chain.voiceGain) chain.voiceGain.disconnect();
                if (chain.ambienceFilter) chain.ambienceFilter.disconnect();
                if (chain.ambienceGain) chain.ambienceGain.disconnect();
                if (chain.voiceAnalyser) chain.voiceAnalyser.disconnect();
                
                // Disconnect frequency-dependent paths
                if (chain.lowFrequencyPath) {
                    if (chain.lowFrequencyPath.filter) chain.lowFrequencyPath.filter.disconnect();
                    if (chain.lowFrequencyPath.gain) chain.lowFrequencyPath.gain.disconnect();
                }
                if (chain.midFrequencyPath) {
                    if (chain.midFrequencyPath.filter) chain.midFrequencyPath.filter.disconnect();
                    if (chain.midFrequencyPath.gain) chain.midFrequencyPath.gain.disconnect();
                }
                if (chain.highFrequencyPath) {
                    if (chain.highFrequencyPath.filter) chain.highFrequencyPath.filter.disconnect();
                    if (chain.highFrequencyPath.gain) chain.highFrequencyPath.gain.disconnect();
                }
                
                // Disconnect externalization nodes
                if (chain.earlyReflections) {
                    if (chain.earlyReflections.delay) chain.earlyReflections.delay.disconnect();
                    if (chain.earlyReflections.gain) chain.earlyReflections.gain.disconnect();
                }
                if (chain.pinnaSimulation && chain.pinnaSimulation.filter) {
                    chain.pinnaSimulation.filter.disconnect();
                }
                if (chain.distanceSimulation) {
                    if (chain.distanceSimulation.filter) chain.distanceSimulation.filter.disconnect();
                    if (chain.distanceSimulation.gain) chain.distanceSimulation.gain.disconnect();
                }
                
                // Disconnect enhanced voice isolation nodes
                if (chain.voiceIsolationNode) chain.voiceIsolationNode.disconnect();
                if (chain.voiceLowPass) chain.voiceLowPass.disconnect();
                if (chain.voiceHighPass) chain.voiceHighPass.disconnect();
                if (chain.voiceFormantEQ) chain.voiceFormantEQ.disconnect();
                if (chain.speechClarityEQ) chain.speechClarityEQ.disconnect();
                if (chain.voiceSplitterNode) chain.voiceSplitterNode.disconnect();
                if (chain.backgroundNoiseNode) chain.backgroundNoiseNode.disconnect();
                if (chain.voiceDynamicsProcessor) chain.voiceDynamicsProcessor.disconnect();
                if (chain.noiseGateNode) chain.noiseGateNode.disconnect();
                
                // Disconnect final gain
                chain.gain.disconnect();
                
                this.processingChains.delete(audioElement);
            }
            
            this.connectedElements.delete(audioElement);
            audioElement._audioEnhancerConnected = false;
            console.log('[Audio Enhancer Debug] Disconnected from audio element successfully');
        } catch (error) {
            console.error('[Audio Enhancer Debug] Disconnection Error:', error);
        }
    }

    setVolume(value) {
        // OPTIMIZED for clean gain without clipping
        // Cap the maximum volume for safety (no matter what the UI allows)
        const maxSafeGain = 5.0; // Maximum safe gain value
        const gainValue = Math.min(Math.max(value / 100, 0), maxSafeGain);
        
        // Store the current value for reconnections
        this.currentVolumeValue = gainValue;
        
        // Set main gain node
        if (this.gainNode) {
            this.gainNode.gain.setTargetAtTime(gainValue, this.audioContext.currentTime, 0.01);
        }
        
        // Set gain for each individual chain with more reliable method
        this.processingChains.forEach((chain) => {
            if (chain.gain) {
                chain.gain.gain.setValueAtTime(gainValue, this.audioContext.currentTime);
                // Also apply with setTargetAtTime for smoother transitions
                chain.gain.gain.setTargetAtTime(gainValue, this.audioContext.currentTime, 0.01);
            }
        });
    }

    setEqualizer(bandIndex, value) {
        // Set main equalizers
        if (this.equalizers[bandIndex]) {
            this.equalizers[bandIndex].gain.setTargetAtTime(value, this.audioContext.currentTime, 0.01);
        }
        
        // Set each chain's equalizers
        this.processingChains.forEach((chain) => {
            if (chain.equalizers && chain.equalizers[bandIndex]) {
                chain.equalizers[bandIndex].gain.setTargetAtTime(value, this.audioContext.currentTime, 0.01);
            }
        });
    }

    setAINoiseReduction(value) {
        const frequencyValue = 20000 - ((value / 100) * 18000);
        
        // Set main noise reduction
        this.noiseReductionNode.frequency.setTargetAtTime(frequencyValue, this.audioContext.currentTime, 0.01);
        
        // Set each chain's noise reduction
        this.processingChains.forEach((chain) => {
            if (chain.noiseReduction) {
                chain.noiseReduction.frequency.setTargetAtTime(frequencyValue, this.audioContext.currentTime, 0.01);
            }
        });
    }

    // Enhanced setAIClarity method with voice isolation
    setAIClarity(value) {
        const gainValue = (value / 100) * 10;
        const voiceIsolationAmount = value / 100;
        
        // Set main clarity
        this.clarityNode.gain.setTargetAtTime(gainValue, this.audioContext.currentTime, 0.01);
        
        // Configure voice isolation based on clarity value
        this.configureVoiceIsolation(voiceIsolationAmount);
        
        // Set each chain's clarity
        this.processingChains.forEach((chain) => {
            if (chain.clarity) {
                chain.clarity.gain.setTargetAtTime(gainValue, this.audioContext.currentTime, 0.01);
            }
            
            // Apply voice isolation to individual chains
            if (chain.voiceIsolationNode && chain.voiceSplitterNode && chain.backgroundNoiseNode) {
                this.configureChainVoiceIsolation(chain, voiceIsolationAmount);
            }
        });
    }

    setAIDynamicRange(value) {
        const ratio = 1 + ((value / 100) * 19);
        const threshold = -50 * (value / 100);
        
        // Set main dynamic range
        this.dynamicRangeNode.ratio.setTargetAtTime(ratio, this.audioContext.currentTime, 0.01);
        this.dynamicRangeNode.threshold.setTargetAtTime(threshold, this.audioContext.currentTime, 0.01);
        
        // Set each chain's dynamic range
        this.processingChains.forEach((chain) => {
            if (chain.dynamicRange) {
                chain.dynamicRange.ratio.setTargetAtTime(ratio, this.audioContext.currentTime, 0.01);
                chain.dynamicRange.threshold.setTargetAtTime(threshold, this.audioContext.currentTime, 0.01);
            }
        });
    }
    
    // Set direct/ambient balance for more immersive festival feel - OPTIMIZED for cleaner sound
    setRoomSize(size) {
        if (!this.spatialEnabled) return;
        
        // Store current setting for reconnections
        this.currentRoomSize = size;
        
        // MODIFIED: More conservative values to prevent distortion
        let directLevel, ambientLevel;
        
        // Adjust room size characteristics based on spatial mode with MILDER scaling
        if (this.spatialMode === 'podcast') {
            // Podcast: Higher direct level for speech clarity
            directLevel = 0.9 - (size / 300); // Range: 0.9 to 0.56
            ambientLevel = 0.15 + (size / 200); // Range: 0.15 to 0.65
        } else if (this.spatialMode === 'movie') {
            // Movie: Balance for both clarity and immersion
            directLevel = 0.85 - (size / 250); // Range: 0.85 to 0.45
            ambientLevel = 0.20 + (size / 180); // Range: 0.20 to 0.75
        } else {
            // Music: Enhanced immersion with safe levels
            directLevel = 0.80 - (size / 250); // Range: 0.80 to 0.40
            ambientLevel = 0.25 + (size / 170); // Range: 0.25 to 0.84
        }
        
        // Set gains for direct and ambient paths
        if (this.directGain) {
            this.directGain.gain.setTargetAtTime(directLevel, this.audioContext.currentTime, 0.05);
        }
        
        if (this.ambientGain) {
            this.ambientGain.gain.setTargetAtTime(ambientLevel, this.audioContext.currentTime, 0.05);
        }
        
        // Update positioning for virtualizers
        this.updateVirtualSpeakerPositioning(size);
        
        // Apply to all chains
        this.processingChains.forEach(chain => {
            if (chain.directGain) {
                chain.directGain.gain.setTargetAtTime(directLevel, this.audioContext.currentTime, 0.05);
            }
            if (chain.ambientGain) {
                chain.ambientGain.gain.setTargetAtTime(ambientLevel, this.audioContext.currentTime, 0.05);
            }
            
            // Update chain-specific speaker positions
            this.updateChainSpeakerPositioning(chain, size);
            
            // Adjust concert ambience with MILDER settings
            if (chain.concertAmbience) {
                let earlyReflections, crowdLevel, bandpassFreq;
                
                if (this.spatialMode === 'podcast') {
                    // Podcast: Minimal reflections, almost no crowd
                    earlyReflections = Math.min(0.05 + (size / 1000), 0.15);
                    crowdLevel = Math.min(0.02 + (size / 1200), 0.10);
                    bandpassFreq = 1200 + (size * 2);
                } else if (this.spatialMode === 'movie') {
                    // Movie: Moderate reflections
                    earlyReflections = Math.min(0.08 + (size / 900), 0.19);
                    crowdLevel = Math.min(0.05 + (size / 1000), 0.15);
                    bandpassFreq = 1000 + (size * 2.5);
                } else {
                    // Music: Full concert ambience but still gentle
                    earlyReflections = Math.min(0.10 + (size / 800), 0.22);
                    crowdLevel = Math.min(0.08 + (size / 700), 0.22);
                    bandpassFreq = 800 + (size * 3);
                }
                
                chain.concertAmbience.earlyGain.gain.setTargetAtTime(earlyReflections, this.audioContext.currentTime, 0.05);
                chain.concertAmbience.crowdGain.gain.setTargetAtTime(crowdLevel, this.audioContext.currentTime, 0.05);
                chain.concertAmbience.crowdFilter.frequency.setTargetAtTime(bandpassFreq, this.audioContext.currentTime, 0.05);
            }
        });
    }
    
    // Adjust virtual speaker positions - OPTIMIZED for natural sound field
    updateVirtualSpeakerPositioning(size) {
        // Map size to distance/spread with MILDER positioning
        let distance, spread, surroundDistance, surroundAngleBase;
        
        if (this.spatialMode === 'podcast') {
            // Podcast: Closer, narrower placement for speech focus
            distance = 0.9 + (size / 60); // Range: 0.9 to 2.56
            spread = 0.8 + (size / 300); // Range: 0.8 to 1.13 (narrower)
            surroundDistance = distance * 0.95; // Surrounds closer
            surroundAngleBase = 90; // Narrower surround angle
        } else if (this.spatialMode === 'movie') {
            // Movie: Medium distance, wide spread for cinematic effect
            distance = 1.0 + (size / 55); // Range: 1.0 to 2.81
            spread = 0.85 + (size / 250); // Range: 0.85 to 1.25 (wider)
            surroundDistance = distance * 0.9; // Surrounds slightly closer
            surroundAngleBase = 100; // Medium surround
        } else {
            // Music: Standard immersive configuration
            distance = 1.1 + (size / 50); // Range: 1.1 to 3.1
            spread = 0.9 + (size / 230); // Range: 0.9 to 1.33
            surroundDistance = distance * 0.85; // Surrounds slightly closer
            surroundAngleBase = 100; // Wide surround
        }
        
        // Set z-distance of front speakers (closer or further)
        if (this.frontLeftNode && this.frontRightNode) {
            this.frontLeftNode.positionZ.setTargetAtTime(-distance, this.audioContext.currentTime, 0.05);
            this.frontRightNode.positionZ.setTargetAtTime(-distance, this.audioContext.currentTime, 0.05);
            
            // Adjust spread (x-position)
            let frontAngleBase = this.spatialMode === 'podcast' ? 25 : 30; // REDUCED angles
            const leftX = -frontAngleBase * spread;
            const rightX = frontAngleBase * spread;
            this.frontLeftNode.positionX.setTargetAtTime(leftX / 50, this.audioContext.currentTime, 0.05);
            this.frontRightNode.positionX.setTargetAtTime(rightX / 50, this.audioContext.currentTime, 0.05);
        }
        
        // Adjust surround speaker positions with more natural angles
        if (this.surroundLeftNode && this.surroundRightNode) {
            const surroundAngle = surroundAngleBase + (size / (this.spatialMode === 'podcast' ? 12 : 10));
            
            // Convert angles to positions for surround
            const leftAngleRad = -surroundAngle * Math.PI / 180;
            const rightAngleRad = surroundAngle * Math.PI / 180;
            
            this.surroundLeftNode.positionX.setTargetAtTime(Math.sin(leftAngleRad) * surroundDistance, this.audioContext.currentTime, 0.05);
            this.surroundLeftNode.positionZ.setTargetAtTime(Math.cos(leftAngleRad) * surroundDistance, this.audioContext.currentTime, 0.05);
            
            this.surroundRightNode.positionX.setTargetAtTime(Math.sin(rightAngleRad) * surroundDistance, this.audioContext.currentTime, 0.05);
            this.surroundRightNode.positionZ.setTargetAtTime(Math.cos(rightAngleRad) * surroundDistance, this.audioContext.currentTime, 0.05);
        }
        
        // Adjust top speaker height with milder elevation
        if (this.topNode) {
            // Less overhead for podcast, more for movie and music
            const heightMultiplier = this.spatialMode === 'podcast' ? 150 : (this.spatialMode === 'movie' ? 130 : 120);
            const height = 0.4 + (size / heightMultiplier); // MILDER height range
            this.topNode.positionY.setTargetAtTime(height, this.audioContext.currentTime, 0.05);
        }
    }
    
    // Update chain-specific speaker positioning with more natural values
    updateChainSpeakerPositioning(chain, size) {
        if (!chain) return;
        
        // Map size to distance/spread with MILDER positioning
        let distance, spread, surroundDistance, surroundAngleBase;
        
        if (this.spatialMode === 'podcast') {
            // Podcast: Closer, narrower placement for speech focus
            distance = 0.9 + (size / 60);
            spread = 0.8 + (size / 300);
            surroundDistance = distance * 0.95;
            surroundAngleBase = 90;
        } else if (this.spatialMode === 'movie') {
            // Movie: Medium distance, wide spread for cinematic effect
            distance = 1.0 + (size / 55);
            spread = 0.85 + (size / 250);
            surroundDistance = distance * 0.9;
            surroundAngleBase = 100;
        } else {
            // Music: Standard immersive configuration
            distance = 1.1 + (size / 50);
            spread = 0.9 + (size / 230);
            surroundDistance = distance * 0.85;
            surroundAngleBase = 100;
        }
        
        // Set z-distance of front speakers (closer or further)
        if (chain.frontLeftNode && chain.frontRightNode) {
            chain.frontLeftNode.positionZ.setTargetAtTime(-distance, this.audioContext.currentTime, 0.05);
            chain.frontRightNode.positionZ.setTargetAtTime(-distance, this.audioContext.currentTime, 0.05);
            
            // Adjust spread (x-position)
            let frontAngleBase = this.spatialMode === 'podcast' ? 25 : 30;
            const leftX = -frontAngleBase * spread;
            const rightX = frontAngleBase * spread;
            chain.frontLeftNode.positionX.setTargetAtTime(leftX / 50, this.audioContext.currentTime, 0.05);
            chain.frontRightNode.positionX.setTargetAtTime(rightX / 50, this.audioContext.currentTime, 0.05);
        }
        
        // Adjust surround speaker positions with more moderate angles
        if (chain.surroundLeftNode && chain.surroundRightNode) {
            const surroundAngle = surroundAngleBase + (size / (this.spatialMode === 'podcast' ? 12 : 10));
            
            // Convert angles to positions for surround
            const leftAngleRad = -surroundAngle * Math.PI / 180;
            const rightAngleRad = surroundAngle * Math.PI / 180;
            
            chain.surroundLeftNode.positionX.setTargetAtTime(Math.sin(leftAngleRad) * surroundDistance, this.audioContext.currentTime, 0.05);
            chain.surroundLeftNode.positionZ.setTargetAtTime(Math.cos(leftAngleRad) * surroundDistance, this.audioContext.currentTime, 0.05);
            
            chain.surroundRightNode.positionX.setTargetAtTime(Math.sin(rightAngleRad) * surroundDistance, this.audioContext.currentTime, 0.05);
            chain.surroundRightNode.positionZ.setTargetAtTime(Math.cos(rightAngleRad) * surroundDistance, this.audioContext.currentTime, 0.05);
        }
        
        // Adjust top speaker height with milder elevation
        if (chain.topNode) {
            const heightMultiplier = this.spatialMode === 'podcast' ? 150 : (this.spatialMode === 'movie' ? 130 : 120);
            const height = 0.4 + (size / heightMultiplier);
            chain.topNode.positionY.setTargetAtTime(height, this.audioContext.currentTime, 0.05);
        }

        // Center speaker positioning - keep centered but adjust distance
        if (chain.centerNode) {
            // Center speaker is always front and center, but adjust distance
            chain.centerNode.positionZ.setTargetAtTime(-distance * 0.95, this.audioContext.currentTime, 0.05);
        }

        // Subwoofer intensity but with gentler scaling
        if (chain.subwooferNode && chain.speakerGains.subwoofer) {
            // Subwoofer stays in position but intensity varies with room size
            const subGain = 0.3 + (size / 400); // GENTLE gain scaling
            chain.speakerGains.subwoofer.gain.setTargetAtTime(subGain, this.audioContext.currentTime, 0.05);
        }

        // Adjust height speakers with moderate elevation
        if (chain.topFrontLeftNode && chain.topFrontRightNode) {
            const topFrontDistance = distance * 0.9;
            const topHeightBase = this.spatialMode === 'podcast' ? 0.25 : 0.35;
            const topHeight = topHeightBase + (size / 200);
            
            // Front height speakers
            chain.topFrontLeftNode.positionY.setTargetAtTime(topHeight, this.audioContext.currentTime, 0.05);
            chain.topFrontRightNode.positionY.setTargetAtTime(topHeight, this.audioContext.currentTime, 0.05);
            chain.topFrontLeftNode.positionZ.setTargetAtTime(-topFrontDistance, this.audioContext.currentTime, 0.05);
            chain.topFrontRightNode.positionZ.setTargetAtTime(-topFrontDistance, this.audioContext.currentTime, 0.05);
            
            // Adjust spread
            const topFrontAngleBase = this.spatialMode === 'podcast' ? 35 : 45;
            const leftX = -topFrontAngleBase * spread;
            const rightX = topFrontAngleBase * spread;
            chain.topFrontLeftNode.positionX.setTargetAtTime(leftX / 50, this.audioContext.currentTime, 0.05);
            chain.topFrontRightNode.positionX.setTargetAtTime(rightX / 50, this.audioContext.currentTime, 0.05);
        }
        
        // Adjust rear height speakers
        if (chain.topRearLeftNode && chain.topRearRightNode) {
            const topRearDistance = surroundDistance * 0.9;
            const topHeightBase = this.spatialMode === 'podcast' ? 0.3 : 0.5;
            const topHeight = topHeightBase + (size / 200);
            
            // Apply height
            chain.topRearLeftNode.positionY.setTargetAtTime(topHeight, this.audioContext.currentTime, 0.05);
            chain.topRearRightNode.positionY.setTargetAtTime(topHeight, this.audioContext.currentTime, 0.05);
            
            // Calculate rear positions based on angle
            const rearAngle = surroundAngleBase + 10 + (size / (this.spatialMode === 'podcast' ? 12 : 10));
            const leftRearAngleRad = -rearAngle * Math.PI / 180;
            const rightRearAngleRad = rearAngle * Math.PI / 180;
            
            chain.topRearLeftNode.positionX.setTargetAtTime(Math.sin(leftRearAngleRad) * topRearDistance, this.audioContext.currentTime, 0.05);
            chain.topRearLeftNode.positionZ.setTargetAtTime(Math.cos(leftRearAngleRad) * topRearDistance, this.audioContext.currentTime, 0.05);
            
            chain.topRearRightNode.positionX.setTargetAtTime(Math.sin(rightRearAngleRad) * topRearDistance, this.audioContext.currentTime, 0.05);
            chain.topRearRightNode.positionZ.setTargetAtTime(Math.cos(rightRearAngleRad) * topRearDistance, this.audioContext.currentTime, 0.05);
        }
    }

    // Set spatial width with enhanced stereo field
    setSpatialWidth(width) {
        if (!this.spatialEnabled) return;
        
        // Store the current width setting for reconnections
        this.spatialWidth = width;
        this.currentSpatialWidth = width;
        
        // Calculate scaled width (-1 to 1 range centered at 0)
        const scaledWidth = (width - 50) / 50;
        
        // Adjust mid/side balance for wider stereo enhancement
        // Different settings based on content type
        let midGain, sideGain, frontAngleBase, surroundAngleBase;
        
        if (this.spatialMode === 'podcast') {
            // Podcast: More centered, less stereo width
            midGain = Math.max(0.55, 1 - Math.abs(scaledWidth) * 0.45);
            sideGain = 1 + scaledWidth * 0.90;
            frontAngleBase = 30; // Narrower front angle
            surroundAngleBase = 100; // Narrower surround 
        } else if (this.spatialMode === 'movie') {
            // Movie: Medium stereo width
            midGain = Math.max(0.48, 1 - Math.abs(scaledWidth) * 0.55);
            sideGain = 1 + scaledWidth * 1.05;
            frontAngleBase = 35; // Medium front angle
            surroundAngleBase = 110; // Medium surround
        } else {
            // Music: Full stereo width
            midGain = Math.max(0.42, 1 - Math.abs(scaledWidth) * 0.60);
            sideGain = 1 + scaledWidth * 1.18;
            frontAngleBase = 38; // Wider front angle
            surroundAngleBase = 118; // Wider surround
        }
        
        if (this.midSideProcessor) {
            this.midSideProcessor.midGain.gain.setTargetAtTime(midGain, this.audioContext.currentTime, 0.05);
            this.midSideProcessor.sideGain.gain.setTargetAtTime(sideGain, this.audioContext.currentTime, 0.05);
        }
        
        // Adjust speaker positions for wider/narrower soundstage
        const frontAngle = frontAngleBase + (scaledWidth * (this.spatialMode === 'podcast' ? 12 : 18));
        const surroundAngle = surroundAngleBase + (scaledWidth * (this.spatialMode === 'podcast' ? 8 : 13));
        
        // Set front speaker angles
        if (this.frontLeftNode && this.frontRightNode) {
            const leftAngleRad = -frontAngle * Math.PI / 180;
            const rightAngleRad = frontAngle * Math.PI / 180;
            
            this.frontLeftNode.positionX.setTargetAtTime(Math.sin(leftAngleRad), this.audioContext.currentTime, 0.05);
            this.frontLeftNode.positionZ.setTargetAtTime(-Math.cos(leftAngleRad), this.audioContext.currentTime, 0.05);
            
            this.frontRightNode.positionX.setTargetAtTime(Math.sin(rightAngleRad), this.audioContext.currentTime, 0.05);
            this.frontRightNode.positionZ.setTargetAtTime(-Math.cos(rightAngleRad), this.audioContext.currentTime, 0.05);
        }
        
        // Set surround speaker angles
        if (this.surroundLeftNode && this.surroundRightNode) {
            const leftAngleRad = -surroundAngle * Math.PI / 180;
            const rightAngleRad = surroundAngle * Math.PI / 180;
            
            this.surroundLeftNode.positionX.setTargetAtTime(Math.sin(leftAngleRad), this.audioContext.currentTime, 0.05);
            this.surroundLeftNode.positionZ.setTargetAtTime(Math.cos(leftAngleRad), this.audioContext.currentTime, 0.05);
            
            this.surroundRightNode.positionX.setTargetAtTime(Math.sin(rightAngleRad), this.audioContext.currentTime, 0.05);
            this.surroundRightNode.positionZ.setTargetAtTime(Math.cos(rightAngleRad), this.audioContext.currentTime, 0.05);
        }
        
        // NEW: Adjust the expanded speaker configuration based on width
        if (this.topFrontLeftNode && this.topFrontRightNode) {
            // Top front speakers get wider with stereo width
            const topFrontAngle = frontAngleBase + 3 + (scaledWidth * (this.spatialMode === 'podcast' ? 10 : 16));
            const leftAngleRad = -topFrontAngle * Math.PI / 180;
            const rightAngleRad = topFrontAngle * Math.PI / 180;
            
            this.topFrontLeftNode.positionX.setTargetAtTime(Math.sin(leftAngleRad), this.audioContext.currentTime, 0.05);
            this.topFrontLeftNode.positionZ.setTargetAtTime(-Math.cos(leftAngleRad), this.audioContext.currentTime, 0.05);
            
            this.topFrontRightNode.positionX.setTargetAtTime(Math.sin(rightAngleRad), this.audioContext.currentTime, 0.05);
            this.topFrontRightNode.positionZ.setTargetAtTime(-Math.cos(rightAngleRad), this.audioContext.currentTime, 0.05);
        }
        
        if (this.topRearLeftNode && this.topRearRightNode) {
            // Top rear speakers also get wider with stereo width
            const topRearAngle = surroundAngleBase + 3 + (scaledWidth * (this.spatialMode === 'podcast' ? 6 : 11));
            const leftAngleRad = -topRearAngle * Math.PI / 180;
            const rightAngleRad = topRearAngle * Math.PI / 180;
            
            this.topRearLeftNode.positionX.setTargetAtTime(Math.sin(leftAngleRad), this.audioContext.currentTime, 0.05);
            this.topRearLeftNode.positionZ.setTargetAtTime(Math.cos(leftAngleRad), this.audioContext.currentTime, 0.05);
            
            this.topRearRightNode.positionX.setTargetAtTime(Math.sin(rightAngleRad), this.audioContext.currentTime, 0.05);
            this.topRearRightNode.positionZ.setTargetAtTime(Math.cos(rightAngleRad), this.audioContext.currentTime, 0.05);
        }
        
        // Adjust center channel spread - as width increases, reduce center channel slightly
        if (this.centerNode) {
            // For dialog coherence, the center channel level is inversely proportional to width
            const centerLevel = 0.7 - (Math.abs(scaledWidth) * 0.2);
            if (this.speakerGains.center) {
                this.speakerGains.center.gain.setTargetAtTime(centerLevel, this.audioContext.currentTime, 0.05);
            }
        }
        
        // Adjust direct/ambient balance for wider soundstage
        // Content-specific adjustments
        let directLevel;
        if (this.spatialMode === 'podcast') {
            // Podcast: More direct sound for clarity regardless of width
            directLevel = Math.max(0.55, 1 - (Math.abs(scaledWidth) * 0.28));
        } else if (this.spatialMode === 'movie') {
            // Movie: Moderate reduction in direct sound
            directLevel = Math.max(0.48, 1 - (Math.abs(scaledWidth) * 0.33));
        } else {
            // Music: More reduction for wider stereo
            directLevel = Math.max(0.42, 1 - (Math.abs(scaledWidth) * 0.38));
        }
        
        if (this.directGain) {
            this.directGain.gain.setTargetAtTime(directLevel, this.audioContext.currentTime, 0.05);
        }
        
        // Apply to all chains
        this.processingChains.forEach(chain => {
            // Adjust mid/side balance
            if (chain.midSideProcessor) {
                chain.midSideProcessor.midGain.gain.setTargetAtTime(midGain, this.audioContext.currentTime, 0.05);
                chain.midSideProcessor.sideGain.gain.setTargetAtTime(sideGain, this.audioContext.currentTime, 0.05);
            }
            
            // Adjust speaker positions
            if (chain.frontLeftNode && chain.frontRightNode) {
                const leftAngleRad = -frontAngle * Math.PI / 180;
                const rightAngleRad = frontAngle * Math.PI / 180;
                
                chain.frontLeftNode.positionX.setTargetAtTime(Math.sin(leftAngleRad), this.audioContext.currentTime, 0.05);
                chain.frontLeftNode.positionZ.setTargetAtTime(-Math.cos(leftAngleRad), this.audioContext.currentTime, 0.05);
                
                chain.frontRightNode.positionX.setTargetAtTime(Math.sin(rightAngleRad), this.audioContext.currentTime, 0.05);
                chain.frontRightNode.positionZ.setTargetAtTime(-Math.cos(rightAngleRad), this.audioContext.currentTime, 0.05);
            }
            
            if (chain.surroundLeftNode && chain.surroundRightNode) {
                const leftAngleRad = -surroundAngle * Math.PI / 180;
                const rightAngleRad = surroundAngle * Math.PI / 180;
                
                chain.surroundLeftNode.positionX.setTargetAtTime(Math.sin(leftAngleRad), this.audioContext.currentTime, 0.05);
                chain.surroundLeftNode.positionZ.setTargetAtTime(Math.cos(leftAngleRad), this.audioContext.currentTime, 0.05);
                
                chain.surroundRightNode.positionX.setTargetAtTime(Math.sin(rightAngleRad), this.audioContext.currentTime, 0.05);
                chain.surroundRightNode.positionZ.setTargetAtTime(Math.cos(rightAngleRad), this.audioContext.currentTime, 0.05);
            }
            
            // Adjust direct level
            if (chain.directGain) {
                chain.directGain.gain.setTargetAtTime(directLevel, this.audioContext.currentTime, 0.05);
            }
            
            // Adjust center channel level
            if (chain.speakerGains && chain.speakerGains.center) {
                const centerLevel = 0.7 - (Math.abs(scaledWidth) * 0.2);
                chain.speakerGains.center.gain.setTargetAtTime(centerLevel, this.audioContext.currentTime, 0.05);
            }
            
            // Adjust expanded speaker configuration
            if (chain.topFrontLeftNode && chain.topFrontRightNode) {
                const topFrontAngle = frontAngleBase + 3 + (scaledWidth * (this.spatialMode === 'podcast' ? 10 : 16));
                const leftAngleRad = -topFrontAngle * Math.PI / 180;
                const rightAngleRad = topFrontAngle * Math.PI / 180;
                
                chain.topFrontLeftNode.positionX.setTargetAtTime(Math.sin(leftAngleRad), this.audioContext.currentTime, 0.05);
                chain.topFrontLeftNode.positionZ.setTargetAtTime(-Math.cos(leftAngleRad), this.audioContext.currentTime, 0.05);
                
                chain.topFrontRightNode.positionX.setTargetAtTime(Math.sin(rightAngleRad), this.audioContext.currentTime, 0.05);
                chain.topFrontRightNode.positionZ.setTargetAtTime(-Math.cos(rightAngleRad), this.audioContext.currentTime, 0.05);
            }
            
            if (chain.topRearLeftNode && chain.topRearRightNode) {
                const topRearAngle = surroundAngleBase + 3 + (scaledWidth * (this.spatialMode === 'podcast' ? 6 : 11));
                const leftAngleRad = -topRearAngle * Math.PI / 180;
                const rightAngleRad = topRearAngle * Math.PI / 180;
                
                chain.topRearLeftNode.positionX.setTargetAtTime(Math.sin(leftAngleRad), this.audioContext.currentTime, 0.05);
                chain.topRearLeftNode.positionZ.setTargetAtTime(Math.cos(leftAngleRad), this.audioContext.currentTime, 0.05);
                
                chain.topRearRightNode.positionX.setTargetAtTime(Math.sin(rightAngleRad), this.audioContext.currentTime, 0.05);
                chain.topRearRightNode.positionZ.setTargetAtTime(Math.cos(rightAngleRad), this.audioContext.currentTime, 0.05);
            }
            
            // Adjust harmonic exciter intensity based on width
            if (chain.harmonicExciter) {
                // Content-specific saturation levels
                let wetLevel;
                if (this.spatialMode === 'podcast') {
                    // Podcast: Less saturation to keep speech clean
                    wetLevel = 0.22 + (Math.abs(scaledWidth) * 0.08);
                } else if (this.spatialMode === 'movie') {
                    // Movie: Medium saturation
                    wetLevel = 0.25 + (Math.abs(scaledWidth) * 0.09);
                } else {
                    // Music: Full saturation range
                    wetLevel = 0.28 + (Math.abs(scaledWidth) * 0.10);
                }
                
                chain.harmonicExciter.wetGain.gain.setTargetAtTime(wetLevel, this.audioContext.currentTime, 0.05);
            }
        });
    }

    // Spatial Audio Enabled state with enhanced settings preservation
    setSpatialEnabled(enabled) {
        try {
            console.log(`[Audio Enhancer Debug] Setting spatial enabled to ${enabled}`);
            
            // Store all settings before changing the spatial state
            const currentSettings = new Map();
            
            this.processingChains.forEach((chain, element) => {
                if (chain) {
                    currentSettings.set(element, {
                        gain: chain.gain ? chain.gain.gain.value : this.currentVolumeValue,
                        // Store spatial parameters
                        roomSize: this.currentRoomSize,
                        spatialWidth: this.currentSpatialWidth,
                        spatialMode: this.spatialMode
                    });
                }
            });
            
            // Update state
            this.spatialEnabled = enabled;
            
            // If disabling, also turn off head tracking
            if (!enabled && this.headTrackingEnabled) {
                this.disableHeadTracking();
            }
            
            // Re-create processing chains with new spatial setting
            if (typeof this.reconnectSources === 'function') {
                this.reconnectSources();
            } else {
                console.error('[Audio Enhancer Debug] reconnectSources is not a function');
            }
            
            // After reconnection, restore all settings in sequence
            setTimeout(() => {
                currentSettings.forEach((settings, element) => {
                    const chain = this.processingChains.get(element);
                    if (chain && chain.gain) {
                        // First restore volume
                        chain.gain.gain.setValueAtTime(settings.gain, this.audioContext.currentTime);
                    }
                });
                
                // If spatial is now enabled, apply spatial settings to all chains
                if (enabled) {
                    // First apply spatial mode if set
                    setTimeout(() => {
                        if (this.spatialMode) {
                            if (typeof this.setSpatialMode === 'function') {
                                this.setSpatialMode(this.spatialMode);
                            } else {
                                console.error('[Audio Enhancer Debug] setSpatialMode is not a function');
                            }
                        } else {
                            // Otherwise apply individual settings
                            
                            // First room size
                            setTimeout(() => {
                                if (typeof this.setRoomSize === 'function') {
                                    this.setRoomSize(this.currentRoomSize);
                                } else {
                                    console.error('[Audio Enhancer Debug] setRoomSize is not a function');
                                }
                                
                                // Then spatial width
                                setTimeout(() => {
                                    if (typeof this.setSpatialWidth === 'function') {
                                        this.setSpatialWidth(this.currentSpatialWidth);
                                    } else {
                                        console.error('[Audio Enhancer Debug] setSpatialWidth is not a function');
                                    }
                                    
                                    // Finally reapply volume one more time to ensure it sticks
                                    this.processingChains.forEach((chain) => {
                                        if (chain && chain.gain) {
                                            const settings = currentSettings.get(chain.element);
                                            if (settings && settings.gain) {
                                                chain.gain.gain.setValueAtTime(settings.gain, this.audioContext.currentTime);
                                            }
                                        }
                                    });
                                }, 50);
                            }, 50);
                        }
                    }, 50);
                }
            }, 50);
            
            console.log(`[Audio Enhancer Debug] Enhanced premium 360° Spatial audio ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error in setSpatialEnabled:', error);
        }
    }

    // Implementation of setSpatialMode for content-specific optimization
    setSpatialMode(mode) {
        try {
            console.log(`[Audio Enhancer Debug] Setting spatial mode to ${mode}`);
            
            if (!this.spatialEnabled) {
                console.log('[Audio Enhancer Debug] Spatial audio not enabled, not setting mode');
                return;
            }
            
            // Store the mode
            this.spatialMode = mode;
            
            // Apply mode-specific settings
            let roomSize, spatialWidth;
            
            // Set optimal parameters based on content type
            if (mode === 'podcast') {
                // Podcast Mode - Optimize for voice clarity
                roomSize = 25;  // Smaller room for focus
                spatialWidth = 35; // Narrower width for centered dialog
                
                // Apply to main processors
                if (this.vocalPresenceEQ) this.vocalPresenceEQ.gain.setTargetAtTime(4, this.audioContext.currentTime, 0.05);
                if (this.vocalFundamentalsEQ) this.vocalFundamentalsEQ.gain.setTargetAtTime(3, this.audioContext.currentTime, 0.05);
                if (this.dialogEQ) this.dialogEQ.gain.setTargetAtTime(2.5, this.audioContext.currentTime, 0.05);
                
            } else if (mode === 'movie') {
                // Movie Mode - Balance dialog clarity with cinematic feel
                roomSize = 65;  // Larger room for cinematic feel
                spatialWidth = 60; // Wider for more immersion
                
                // Apply to main processors
                if (this.vocalPresenceEQ) this.vocalPresenceEQ.gain.setTargetAtTime(2, this.audioContext.currentTime, 0.05);
                if (this.vocalFundamentalsEQ) this.vocalFundamentalsEQ.gain.setTargetAtTime(1.5, this.audioContext.currentTime, 0.05);
                if (this.dialogEQ) this.dialogEQ.gain.setTargetAtTime(3.5, this.audioContext.currentTime, 0.05);
                
            } else {
                // Music Mode (default) - Full immersive experience
                roomSize = 50;  // Medium room for balance
                spatialWidth = 50; // Standard width
                
                // Apply to main processors
                if (this.vocalPresenceEQ) this.vocalPresenceEQ.gain.setTargetAtTime(1.5, this.audioContext.currentTime, 0.05);
                if (this.vocalFundamentalsEQ) this.vocalFundamentalsEQ.gain.setTargetAtTime(1, this.audioContext.currentTime, 0.05);
                if (this.dialogEQ) this.dialogEQ.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.05);
            }
            
            // Apply mode to all chains
            if (this.processingChains && typeof this.applyModeToChain === 'function') {
                this.processingChains.forEach(chain => {
                    this.applyModeToChain(chain, mode);
                });
            } else {
                console.error('[Audio Enhancer Debug] processingChains or applyModeToChain not available');
            }
            
            // Set room size and spatial width
            if (typeof this.setRoomSize === 'function') {
                this.setRoomSize(roomSize);
            } else {
                console.error('[Audio Enhancer Debug] setRoomSize is not a function');
            }
            
            if (typeof this.setSpatialWidth === 'function') {
                this.setSpatialWidth(spatialWidth);
            } else {
                console.error('[Audio Enhancer Debug] setSpatialWidth is not a function');
            }
            
            // Store updated settings
            this.currentRoomSize = roomSize;
            this.currentSpatialWidth = spatialWidth;
            
            console.log(`[Audio Enhancer Debug] Applied ${mode} mode to spatial audio`);
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error in setSpatialMode:', error);
        }
    }
    
    // Helper to apply mode settings to a specific chain
    applyModeToChain(chain, mode) {
        if (!chain) return;
        
        try {
            // Apply EQ settings based on content type
            if (chain.vocalPresenceEQ && chain.vocalFundamentalsEQ && chain.dialogEQ) {
                if (mode === 'podcast') {
                    // Podcast: Enhance voice clarity significantly
                    chain.vocalPresenceEQ.gain.setTargetAtTime(4, this.audioContext.currentTime, 0.05);
                    chain.vocalFundamentalsEQ.gain.setTargetAtTime(3, this.audioContext.currentTime, 0.05);
                    chain.dialogEQ.gain.setTargetAtTime(2.5, this.audioContext.currentTime, 0.05);
                    
                    // Reduce low frequencies that can muddy speech
                    if (chain.directEQ && chain.directEQ.lowControl) {
                        chain.directEQ.lowControl.gain.setTargetAtTime(-2, this.audioContext.currentTime, 0.05);
                    }
                    
                } else if (mode === 'movie') {
                    // Movie: Balance dialog clarity with cinematic feel
                    chain.vocalPresenceEQ.gain.setTargetAtTime(2, this.audioContext.currentTime, 0.05);
                    chain.vocalFundamentalsEQ.gain.setTargetAtTime(1.5, this.audioContext.currentTime, 0.05);
                    chain.dialogEQ.gain.setTargetAtTime(3.5, this.audioContext.currentTime, 0.05);
                    
                    // Slight bass boost for cinematic feel
                    if (chain.directEQ && chain.directEQ.lowControl) {
                        chain.directEQ.lowControl.gain.setTargetAtTime(-0.5, this.audioContext.currentTime, 0.05);
                    }
                    
                } else {
                    // Music: Balanced with slight vocal enhancement
                    chain.vocalPresenceEQ.gain.setTargetAtTime(1.5, this.audioContext.currentTime, 0.05);
                    chain.vocalFundamentalsEQ.gain.setTargetAtTime(1, this.audioContext.currentTime, 0.05);
                    chain.dialogEQ.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.05);
                    
                    // Default bass level for music
                    if (chain.directEQ && chain.directEQ.lowControl) {
                        chain.directEQ.lowControl.gain.setTargetAtTime(-1, this.audioContext.currentTime, 0.05);
                    }
                }
            }
            
            // Adjust speaker gain levels based on content type
            if (chain.speakerGains) {
                if (mode === 'podcast') {
                    // Podcast: Focus on front speakers, reduce surround and top
                    chain.speakerGains.frontLeft.gain.setTargetAtTime(0.50, this.audioContext.currentTime, 0.05);
                    chain.speakerGains.frontRight.gain.setTargetAtTime(0.50, this.audioContext.currentTime, 0.05);
                    chain.speakerGains.surroundLeft.gain.setTargetAtTime(0.25, this.audioContext.currentTime, 0.05);
                    chain.speakerGains.surroundRight.gain.setTargetAtTime(0.25, this.audioContext.currentTime, 0.05);
                    chain.speakerGains.top.gain.setTargetAtTime(0.20, this.audioContext.currentTime, 0.05);
                    
                    // NEW: Adjust expanded speaker configuration for podcast mode
                    if (chain.speakerGains.center) chain.speakerGains.center.gain.setTargetAtTime(0.80, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.subwoofer) chain.speakerGains.subwoofer.gain.setTargetAtTime(0.40, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.topFrontLeft) chain.speakerGains.topFrontLeft.gain.setTargetAtTime(0.15, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.topFrontRight) chain.speakerGains.topFrontRight.gain.setTargetAtTime(0.15, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.topRearLeft) chain.speakerGains.topRearLeft.gain.setTargetAtTime(0.10, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.topRearRight) chain.speakerGains.topRearRight.gain.setTargetAtTime(0.10, this.audioContext.currentTime, 0.05);
                    
                } else if (mode === 'movie') {
                    // Movie: Enhanced surrounds for dramatic effect
                    chain.speakerGains.frontLeft.gain.setTargetAtTime(0.45, this.audioContext.currentTime, 0.05);
                    chain.speakerGains.frontRight.gain.setTargetAtTime(0.45, this.audioContext.currentTime, 0.05);
                    chain.speakerGains.surroundLeft.gain.setTargetAtTime(0.48, this.audioContext.currentTime, 0.05);
                    chain.speakerGains.surroundRight.gain.setTargetAtTime(0.48, this.audioContext.currentTime, 0.05);
                    chain.speakerGains.top.gain.setTargetAtTime(0.38, this.audioContext.currentTime, 0.05);
                    
                    // NEW: Adjust expanded speaker configuration for movie mode
                    if (chain.speakerGains.center) chain.speakerGains.center.gain.setTargetAtTime(0.70, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.subwoofer) chain.speakerGains.subwoofer.gain.setTargetAtTime(0.85, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.topFrontLeft) chain.speakerGains.topFrontLeft.gain.setTargetAtTime(0.42, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.topFrontRight) chain.speakerGains.topFrontRight.gain.setTargetAtTime(0.42, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.topRearLeft) chain.speakerGains.topRearLeft.gain.setTargetAtTime(0.38, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.topRearRight) chain.speakerGains.topRearRight.gain.setTargetAtTime(0.38, this.audioContext.currentTime, 0.05);
                    
                } else {
                    // Music: Balanced for immersive musical experience
                    chain.speakerGains.frontLeft.gain.setTargetAtTime(0.42, this.audioContext.currentTime, 0.05);
                    chain.speakerGains.frontRight.gain.setTargetAtTime(0.42, this.audioContext.currentTime, 0.05);
                    chain.speakerGains.surroundLeft.gain.setTargetAtTime(0.46, this.audioContext.currentTime, 0.05);
                    chain.speakerGains.surroundRight.gain.setTargetAtTime(0.46, this.audioContext.currentTime, 0.05);
                    chain.speakerGains.top.gain.setTargetAtTime(0.39, this.audioContext.currentTime, 0.05);
                    
                    // NEW: Adjust expanded speaker configuration for music mode
                    if (chain.speakerGains.center) chain.speakerGains.center.gain.setTargetAtTime(0.50, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.subwoofer) chain.speakerGains.subwoofer.gain.setTargetAtTime(0.70, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.topFrontLeft) chain.speakerGains.topFrontLeft.gain.setTargetAtTime(0.35, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.topFrontRight) chain.speakerGains.topFrontRight.gain.setTargetAtTime(0.35, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.topRearLeft) chain.speakerGains.topRearLeft.gain.setTargetAtTime(0.30, this.audioContext.currentTime, 0.05);
                    if (chain.speakerGains.topRearRight) chain.speakerGains.topRearRight.gain.setTargetAtTime(0.30, this.audioContext.currentTime, 0.05);
                }
            }
            
            // Adjust ambient and concert simulation parameters
            if (chain.concertAmbience) {
                if (mode === 'podcast') {
                    // Podcast: Minimal reflections, almost no crowd
                    chain.concertAmbience.earlyFilter.frequency.setTargetAtTime(1800, this.audioContext.currentTime, 0.05);
                    chain.concertAmbience.earlyFilter.Q.setTargetAtTime(0.9, this.audioContext.currentTime, 0.05);
                    chain.concertAmbience.earlyGain.gain.setTargetAtTime(0.10, this.audioContext.currentTime, 0.05);
                    
                    chain.concertAmbience.crowdFilter.frequency.setTargetAtTime(1200, this.audioContext.currentTime, 0.05);
                    chain.concertAmbience.crowdFilter.Q.setTargetAtTime(1.5, this.audioContext.currentTime, 0.05);
                    chain.concertAmbience.crowdGain.gain.setTargetAtTime(0.05, this.audioContext.currentTime, 0.05);
                } else if (mode === 'movie') {
                    // Movie: Moderate reflections, some crowd/ambient
                    chain.concertAmbience.earlyFilter.frequency.setTargetAtTime(1500, this.audioContext.currentTime, 0.05);
                    chain.concertAmbience.earlyFilter.Q.setTargetAtTime(0.7, this.audioContext.currentTime, 0.05);
                    chain.concertAmbience.earlyGain.gain.setTargetAtTime(0.18, this.audioContext.currentTime, 0.05);
                    
                    chain.concertAmbience.crowdFilter.frequency.setTargetAtTime(900, this.audioContext.currentTime, 0.05);
                    chain.concertAmbience.crowdFilter.Q.setTargetAtTime(1.0, this.audioContext.currentTime, 0.05);
                    chain.concertAmbience.crowdGain.gain.setTargetAtTime(0.15, this.audioContext.currentTime, 0.05);
                } else {
                    // Music: Full concert ambience
                    chain.concertAmbience.earlyFilter.frequency.setTargetAtTime(2000, this.audioContext.currentTime, 0.05);
                    chain.concertAmbience.earlyFilter.Q.setTargetAtTime(0.5, this.audioContext.currentTime, 0.05);
                    chain.concertAmbience.earlyGain.gain.setTargetAtTime(0.15, this.audioContext.currentTime, 0.05);
                    
                    chain.concertAmbience.crowdFilter.frequency.setTargetAtTime(800, this.audioContext.currentTime, 0.05);
                    chain.concertAmbience.crowdFilter.Q.setTargetAtTime(1.2, this.audioContext.currentTime, 0.05);
                    chain.concertAmbience.crowdGain.gain.setTargetAtTime(0.11, this.audioContext.currentTime, 0.05);
                }
            }
            
            // Configure transient processing parameters
            if (chain.multibandTransient) {
                if (mode === 'podcast') {
                    // Podcast: Fast attack for speech clarity, less bass processing
                    if (chain.multibandTransient.lowBand && chain.multibandTransient.lowBand.compressor) {
                        chain.multibandTransient.lowBand.compressor.threshold.setTargetAtTime(-26, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.lowBand.compressor.ratio.setTargetAtTime(2, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.lowBand.compressor.attack.setTargetAtTime(0.008, this.audioContext.currentTime, 0.05);
                    }
                    
                    if (chain.multibandTransient.midBand && chain.multibandTransient.midBand.compressor) {
                        chain.multibandTransient.midBand.compressor.threshold.setTargetAtTime(-24, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.midBand.compressor.ratio.setTargetAtTime(5, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.midBand.compressor.attack.setTargetAtTime(0.0007, this.audioContext.currentTime, 0.05);
                    }
                    
                    if (chain.multibandTransient.highBand && chain.multibandTransient.highBand.compressor) {
                        chain.multibandTransient.highBand.compressor.threshold.setTargetAtTime(-28, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.highBand.compressor.ratio.setTargetAtTime(7, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.highBand.compressor.attack.setTargetAtTime(0.0004, this.audioContext.currentTime, 0.05);
                    }
                } else if (mode === 'movie') {
                    // Movie: Dramatic transients for cinematic impact
                    if (chain.multibandTransient.lowBand && chain.multibandTransient.lowBand.compressor) {
                        chain.multibandTransient.lowBand.compressor.threshold.setTargetAtTime(-22, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.lowBand.compressor.ratio.setTargetAtTime(4, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.lowBand.compressor.attack.setTargetAtTime(0.004, this.audioContext.currentTime, 0.05);
                    }
                    
                    if (chain.multibandTransient.midBand && chain.multibandTransient.midBand.compressor) {
                        chain.multibandTransient.midBand.compressor.threshold.setTargetAtTime(-25, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.midBand.compressor.ratio.setTargetAtTime(4.5, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.midBand.compressor.attack.setTargetAtTime(0.001, this.audioContext.currentTime, 0.05);
                    }
                    
                    if (chain.multibandTransient.highBand && chain.multibandTransient.highBand.compressor) {
                        chain.multibandTransient.highBand.compressor.threshold.setTargetAtTime(-29, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.highBand.compressor.ratio.setTargetAtTime(5.5, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.highBand.compressor.attack.setTargetAtTime(0.0005, this.audioContext.currentTime, 0.05);
                    }
                } else {
                    // Music: Balanced transient processing
                    if (chain.multibandTransient.lowBand && chain.multibandTransient.lowBand.compressor) {
                        chain.multibandTransient.lowBand.compressor.threshold.setTargetAtTime(-24, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.lowBand.compressor.ratio.setTargetAtTime(3, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.lowBand.compressor.attack.setTargetAtTime(0.005, this.audioContext.currentTime, 0.05);
                    }
                    
                    if (chain.multibandTransient.midBand && chain.multibandTransient.midBand.compressor) {
                        chain.multibandTransient.midBand.compressor.threshold.setTargetAtTime(-28, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.midBand.compressor.ratio.setTargetAtTime(4, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.midBand.compressor.attack.setTargetAtTime(0.001, this.audioContext.currentTime, 0.05);
                    }
                    
                    if (chain.multibandTransient.highBand && chain.multibandTransient.highBand.compressor) {
                        chain.multibandTransient.highBand.compressor.threshold.setTargetAtTime(-30, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.highBand.compressor.ratio.setTargetAtTime(6, this.audioContext.currentTime, 0.05);
                        chain.multibandTransient.highBand.compressor.attack.setTargetAtTime(0.0005, this.audioContext.currentTime, 0.05);
                    }
                }
            }
            
            // Adjust spatial modulation based on content type
            if (chain.spatialModulator) {
                if (mode === 'podcast') {
                    // Podcast: Very minimal movement
                    chain.spatialModulator.lfoRate.frequency.setTargetAtTime(0.08, this.audioContext.currentTime, 0.05);
                    chain.spatialModulator.lfoDepth.gain.setTargetAtTime(0.02, this.audioContext.currentTime, 0.05);
                    chain.spatialModulator.lfoRate2.frequency.setTargetAtTime(0.12, this.audioContext.currentTime, 0.05);
                    chain.spatialModulator.lfoDepth2.gain.setTargetAtTime(0.01, this.audioContext.currentTime, 0.05);
                } else if (mode === 'movie') {
                    // Movie: Some movement for ambience
                    chain.spatialModulator.lfoRate.frequency.setTargetAtTime(0.12, this.audioContext.currentTime, 0.05);
                    chain.spatialModulator.lfoDepth.gain.setTargetAtTime(0.04, this.audioContext.currentTime, 0.05);
                    chain.spatialModulator.lfoRate2.frequency.setTargetAtTime(0.18, this.audioContext.currentTime, 0.05);
                    chain.spatialModulator.lfoDepth2.gain.setTargetAtTime(0.03, this.audioContext.currentTime, 0.05);
                } else {
                    // Music: Full movement for immersion
                    chain.spatialModulator.lfoRate.frequency.setTargetAtTime(0.15, this.audioContext.currentTime, 0.05);
                    chain.spatialModulator.lfoDepth.gain.setTargetAtTime(0.06, this.audioContext.currentTime, 0.05);
                    chain.spatialModulator.lfoRate2.frequency.setTargetAtTime(0.22, this.audioContext.currentTime, 0.05);
                    chain.spatialModulator.lfoDepth2.gain.setTargetAtTime(0.05, this.audioContext.currentTime, 0.05);
                }
            }
            
            // Apply mode-specific harmonic exciter settings
            if (chain.harmonicExciter) {
                if (mode === 'podcast') {
                    // Podcast: Minimal saturation, focus on clarity
                    chain.harmonicExciter.dryGain.gain.setTargetAtTime(0.90, this.audioContext.currentTime, 0.05);
                    chain.harmonicExciter.wetGain.gain.setTargetAtTime(0.15, this.audioContext.currentTime, 0.05);
                    chain.harmonicExciter.highpass.frequency.value = 4000; // Focus on consonants
                } else if (mode === 'movie') {
                    // Movie: Medium saturation for drama
                    chain.harmonicExciter.dryGain.gain.setTargetAtTime(0.88, this.audioContext.currentTime, 0.05);
                    chain.harmonicExciter.wetGain.gain.setTargetAtTime(0.22, this.audioContext.currentTime, 0.05);
                    chain.harmonicExciter.highpass.frequency.value = 3800; // Balanced
                } else {
                    // Music: Full saturation range
                    chain.harmonicExciter.dryGain.gain.setTargetAtTime(0.85, this.audioContext.currentTime, 0.05);
                    chain.harmonicExciter.wetGain.gain.setTargetAtTime(0.28, this.audioContext.currentTime, 0.05);
                    chain.harmonicExciter.highpass.frequency.value = 3500; // Standard
                }
            }
            
            // Apply special voice isolation settings for podcast mode
            if (chain.voiceIsolationNode && chain.backgroundNoiseNode && chain.voiceSplitterNode) {
                if (mode === 'podcast') {
                    // In podcast mode, automatically apply stronger voice isolation
                    // This enhances the normal voice isolation that's controlled by clarity slider
                    const extraVoiceIsolation = 0.2; // Boost by 20%
                    const currentIsolation = chain.voiceSplitterNode.gain.value;
                    
                    // Boost voice isolation by 20% but don't exceed 1.0
                    const boostedIsolation = Math.min(currentIsolation + extraVoiceIsolation, 1.0);
                    chain.voiceSplitterNode.gain.setTargetAtTime(boostedIsolation, this.audioContext.currentTime, 0.1);
                    
                    // Reduce background by corresponding amount
                    chain.backgroundNoiseNode.gain.setTargetAtTime(
                        Math.max(0.1, 1 - (boostedIsolation * 0.9)), 
                        this.audioContext.currentTime, 
                        0.1
                    );
                    
                    // Make voice bandpass narrower for better focus on speech
                    chain.voiceIsolationNode.Q.setTargetAtTime(
                        0.5 + (boostedIsolation * 1.2), // Higher Q value for narrower band
                        this.audioContext.currentTime, 
                        0.1
                    );
                    
                    // Boost voice formant EQ for more presence
                    if (chain.voiceFormantEQ) {
                        const formantBoost = boostedIsolation * 10; // Up to +10dB at maximum
                        chain.voiceFormantEQ.gain.setTargetAtTime(formantBoost, this.audioContext.currentTime, 0.1);
                    }
                }
                // For other modes, let the clarity slider control voice isolation normally
            }
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error applying mode to chain:', error);
        }
    }
    
    // Add missing helper method required for reconnecting sources
    reconnectSources() {
        try {
            console.log('[Audio Enhancer Debug] Reconnecting all audio sources');
            
            // Disconnect all sources
            if (!this.connectedElements || this.connectedElements.size === 0) {
                console.log('[Audio Enhancer Debug] No connected elements to reconnect');
                return;
            }
            
            // Create a copy of connected elements to avoid modification issues during iteration
            const elementsToReconnect = Array.from(this.connectedElements);
            
            // Disconnect all sources first
            elementsToReconnect.forEach(element => {
                if (element && typeof this.disconnectFromSource === 'function') {
                    this.disconnectFromSource(element);
                }
            });
            
            // Clear the connected elements set
            this.connectedElements.clear();
            
            // Reconnect all sources
            elementsToReconnect.forEach(element => {
                if (element && typeof this.connectToSource === 'function') {
                    this.connectToSource(element);
                }
            });
            
            console.log(`[Audio Enhancer Debug] Reconnected ${elementsToReconnect.length} audio sources`);
        } catch (error) {
            console.error('[Audio Enhancer Debug] Error reconnecting sources:', error);
        }
    }
}

// Make sure this class is globally accessible
if (typeof window !== 'undefined') {
    window.AudioProcessor = AudioProcessor;
}

