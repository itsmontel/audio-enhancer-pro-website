// 365 Audio Facts Database
const audioFacts = [
    // PHYSICS (50 facts)
    {
        fact: "Sound travels about 4.3 times faster in water than in air.",
        category: "physics"
    },
    {
        fact: "The speed of sound in air at sea level is approximately 343 meters per second (767 mph).",
        category: "physics"
    },
    {
        fact: "The record for the longest echo is 112 seconds, recorded in an abandoned oil tank in Scotland.",
        category: "physics"
    },
    {
        fact: "Sound can't travel through a vacuum because it needs a medium to propagate.",
        category: "physics"
    },
    {
        fact: "The term 'sound barrier' originated because aircraft experienced severe buffeting as they approached the speed of sound.",
        category: "physics"
    },
    {
        fact: "Sound travels faster in solids than in liquids, and faster in liquids than in gases.",
        category: "physics"
    },
    {
        fact: "The Doppler effect, which changes the pitch of sound as its source moves, also applies to light waves.",
        category: "physics"
    },
    {
        fact: "The loudest sound on Earth reached 310 decibels and was produced by the Krakatoa volcanic eruption in 1883.",
        category: "physics"
    },
    {
        fact: "At -40 degrees, both Celsius and Fahrenheit scales read the same number, and sound travels about 10% slower than at room temperature.",
        category: "physics"
    },
    {
        fact: "A whip's crack is actually a small sonic boom - the tip breaks the sound barrier when properly cracked.",
        category: "physics"
    },
    {
        fact: "Standing waves in enclosed spaces create room modes that can boost or cancel certain frequencies.",
        category: "physics"
    },
    {
        fact: "The concept of 'beats' in sound occurs when two tones of slightly different frequencies are played together, creating a pulsing effect.",
        category: "physics"
    },
    {
        fact: "The decibel (dB) scale is logarithmic - a 10 dB increase represents a 10-fold increase in sound intensity.",
        category: "physics"
    },
    {
        fact: "Resonant frequency of an object is the frequency at which it naturally vibrates when struck or disturbed.",
        category: "physics"
    },
    {
        fact: "Ultrasound has frequencies above 20,000 Hz, beyond human hearing, but many animals can hear these high-frequency sounds.",
        category: "physics"
    },
    {
        fact: "The speed of sound increases by about 0.6 meters per second for each degree Celsius increase in temperature.",
        category: "physics"
    },
    {
        fact: "Sound waves can be focused using acoustic lenses, similar to how optical lenses focus light.",
        category: "physics"
    },
    {
        fact: "The Helmholtz resonator, a cavity with an opening, amplifies specific frequencies and is the principle behind many acoustic instruments.",
        category: "physics"
    },
    {
        fact: "A sonic boom occurs when an object travels faster than the speed of sound, creating a shock wave of compressed air.",
        category: "physics"
    },
    {
        fact: "Acoustic impedance is the resistance an acoustic medium offers to sound waves passing through it.",
        category: "physics"
    },
    {
        fact: "The 'critical distance' in acoustics is the point where direct sound and reverberant sound have equal energy.",
        category: "physics"
    },
    {
        fact: "Sound waves in air are longitudinal waves, meaning air molecules vibrate parallel to the direction of wave travel.",
        category: "physics"
    },
    {
        fact: "The Weber-Fechner law states that the perceived intensity of sound is logarithmic rather than linear.",
        category: "physics"
    },
    {
        fact: "Harmonics are integer multiples of a fundamental frequency that give instruments their unique timbres.",
        category: "physics"
    },
    {
        fact: "Diffraction allows sound to bend around obstacles, which is why you can hear someone speaking from around a corner.",
        category: "physics"
    },
    {
        fact: "Acoustic metamaterials are engineered structures that can manipulate sound waves in ways not possible with natural materials.",
        category: "physics"
    },
    {
        fact: "Infrasound frequencies below 20 Hz can travel thousands of miles through the atmosphere and oceans.",
        category: "physics"
    },
    {
        fact: "Sound intensity decreases according to the inverse square law - doubling the distance reduces the intensity to one-fourth.",
        category: "physics"
    },
    {
        fact: "Nonlinear acoustics studies how high-amplitude sound waves distort as they propagate, creating additional frequencies.",
        category: "physics"
    },
    {
        fact: "The 'critical band' is the frequency range within which the ear cannot distinguish between two simultaneous tones.",
        category: "physics"
    },
    {
        fact: "Sound refraction occurs when sound waves change direction due to variations in the medium's temperature or density.",
        category: "physics"
    },
    {
        fact: "White noise contains equal energy at all frequencies, similar to how white light contains all visible wavelengths.",
        category: "physics"
    },
    {
        fact: "Acoustic cavitation occurs when sound waves create and collapse microscopic bubbles in liquids, releasing enormous energy.",
        category: "physics"
    },
    {
        fact: "The 'haas effect' or precedence effect occurs when two identical sounds arrive at different times and are perceived as one.",
        category: "physics"
    },
    {
        fact: "Acoustic holography uses interference patterns to recreate three-dimensional sound fields.",
        category: "physics"
    },
    {
        fact: "Sound waves can cause objects to levitate through acoustic radiation pressure.",
        category: "physics"
    },
    {
        fact: "Cymatics is the study of visible sound and vibration patterns, often demonstrated using sand on vibrating plates.",
        category: "physics"
    },
    {
        fact: "Acoustic shadows are areas where sound waves cannot reach due to obstacles or atmospheric conditions.",
        category: "physics"
    },
    {
        fact: "Phase cancellation occurs when identical sound waves that are 180 degrees out of phase meet, resulting in silence.",
        category: "physics"
    },
    {
        fact: "Acoustic streaming is the steady fluid flow induced by sound waves in a medium.",
        category: "physics"
    },
    {
        fact: "Sonic crystals are periodic structures that can create acoustic band gaps, preventing certain frequencies from propagating.",
        category: "physics"
    },
    {
        fact: "Sound absorption coefficients measure how much sound energy is absorbed by a material rather than reflected.",
        category: "physics"
    },
    {
        fact: "The speed of sound in hydrogen is nearly four times faster than in air due to hydrogen's low density.",
        category: "physics"
    },
    {
        fact: "Acoustic interference patterns can create zones of constructive and destructive interference where sounds are louder or quieter.",
        category: "physics"
    },
    {
        fact: "The phonon is the quantum mechanical quasiparticle representing sound waves in solid materials.",
        category: "physics"
    },
    {
        fact: "Magnetoacoustic waves are sound waves that can be controlled using magnetic fields in certain materials.",
        category: "physics"
    },
    {
        fact: "Acoustic attenuation is the gradual loss of sound energy as waves propagate through a medium.",
        category: "physics"
    },
    {
        fact: "Sound waves follow Snell's law when crossing boundaries between different mediums, similar to light refraction.",
        category: "physics"
    },
    {
        fact: "The ratio between consecutive resonant frequencies in a vibrating string is determined by the harmonic series.",
        category: "physics"
    },
    {
        fact: "Acoustic rectification is the generation of a DC pressure component from an AC sound wave.",
        category: "physics"
    },
    
    // PHYSIOLOGY (55 facts)
    {
        fact: "The human ear can distinguish between 400,000 different sounds.",
        category: "physiology"
    },
    {
        fact: "The three smallest bones in the human body are in the ear: the malleus, incus, and stapes.",
        category: "physiology"
    },
    {
        fact: "We perceive sounds differently in our left and right ears, with the right better at music and the left at speech.",
        category: "physiology"
    },
    {
        fact: "Infrasound (below 20Hz) can cause feelings of fear or anxiety in humans, despite being inaudible.",
        category: "physiology"
    },
    {
        fact: "The 'cocktail party effect' describes our ability to focus on one conversation in a noisy environment.",
        category: "physiology"
    },
    {
        fact: "The Fletcher-Munson curves show that human hearing is most sensitive between 2kHz and 5kHz.",
        category: "physiology"
    },
    {
        fact: "Babies are born with the ability to hear all phonetic sounds in all languages, but lose this ability as they grow.",
        category: "physiology"
    },
    {
        fact: "The human ear canal acts as a natural amplifier for frequencies between 2-5 kHz.",
        category: "physiology"
    },
    {
        fact: "The ossicles (ear bones) are fully developed at birth and are adult-sized.",
        category: "physiology"
    },
    {
        fact: "Otoacoustic emissions are sounds generated by the inner ear itself, which can be measured to test hearing health.",
        category: "physiology"
    },
    {
        fact: "Synesthesia can cause some people to 'see' sounds as colors or shapes.",
        category: "physiology"
    },
    {
        fact: "The outer ear (pinna) helps determine if sounds come from in front, behind, above or below us.",
        category: "physiology"
    },
    {
        fact: "Our ears never stop working, even when we sleep. The brain filters out sounds it deems unimportant.",
        category: "physiology"
    },
    {
        fact: "The ear has the fastest muscle in the human body - the stapedius muscle can contract in just 1/10,000th of a second.",
        category: "physiology"
    },
    {
        fact: "Temporary threshold shift is the temporary hearing loss you experience after exposure to loud sounds, like after a concert.",
        category: "physiology"
    },
    {
        fact: "The basilar membrane in the cochlea acts like a frequency analyzer, with different sections responding to different pitches.",
        category: "physiology"
    },
    {
        fact: "Presbycusis is age-related hearing loss that typically begins with high-frequency sounds.",
        category: "physiology"
    },
    {
        fact: "The tympanic membrane (eardrum) vibrates less than the width of a hydrogen atom when hearing very quiet sounds.",
        category: "physiology"
    },
    {
        fact: "Human hearing range typically spans from 20 Hz to 20,000 Hz, though this diminishes with age.",
        category: "physiology"
    },
    {
        fact: "The stapedius reflex is an involuntary muscle contraction that protects the inner ear from loud sounds.",
        category: "physiology"
    },
    {
        fact: "Absolute pitch (perfect pitch) is the ability to identify or produce a musical note without a reference tone.",
        category: "physiology"
    },
    {
        fact: "The 'missing fundamental' phenomenon allows us to perceive a fundamental frequency even when it's not present in a sound.",
        category: "physiology"
    },
    {
        fact: "Bone conduction allows sound to be transmitted to the inner ear directly through the bones of the skull.",
        category: "physiology"
    },
    {
        fact: "The interaural time difference (ITD) helps us locate sounds horizontally based on which ear receives the sound first.",
        category: "physiology"
    },
    {
        fact: "Diplacusis is a hearing disorder where the same sound is perceived as having a different pitch in each ear.",
        category: "physiology"
    },
    {
        fact: "The olivocochlear bundle is a feedback system that can reduce cochlear sensitivity, helping in noisy environments.",
        category: "physiology"
    },
    {
        fact: "Hair cells in the cochlea convert mechanical sound vibrations into electrical signals sent to the brain.",
        category: "physiology"
    },
    {
        fact: "Adaptation in the auditory system reduces sensitivity to continuous sounds, helping us focus on new sounds.",
        category: "physiology"
    },
    {
        fact: "The spiral ganglion contains the cell bodies of neurons that transmit sound information from the cochlea to the brain.",
        category: "physiology"
    },
    {
        fact: "Congenital amusia (tone deafness) affects about 4% of the population, making it difficult to recognize musical pitches.",
        category: "physiology"
    },
    {
        fact: "The auditory cortex has tonotopic organization, where different frequencies are processed in different areas.",
        category: "physiology"
    },
    {
        fact: "Auditory masking occurs when the perception of one sound is affected by the presence of another sound.",
        category: "physiology"
    },
    {
        fact: "The vestibular and cochlear systems share the same fluid spaces, which is why loud sounds can affect balance.",
        category: "physiology"
    },
    {
        fact: "Women generally have more sensitive hearing than men, especially at higher frequencies.",
        category: "physiology"
    },
    {
        fact: "The auditory system can detect time differences as small as 10 microseconds between sounds reaching each ear.",
        category: "physiology"
    },
    {
        fact: "The tectorial membrane in the inner ear is crucial for stimulating hair cells in response to sound vibrations.",
        category: "physiology"
    },
    {
        fact: "Inner hair cells are the primary sensory receptors for hearing, while outer hair cells act as mechanical amplifiers.",
        category: "physiology"
    },
    {
        fact: "The primary auditory cortex is located in the temporal lobe and is essential for sound perception and processing.",
        category: "physiology"
    },
    {
        fact: "Auditory scene analysis is how the brain organizes sound into perceptually meaningful elements.",
        category: "physiology"
    },
    {
        fact: "Spatial hearing depends on both interaural time differences and interaural level differences.",
        category: "physiology"
    },
    {
        fact: "Relative pitch is the ability to identify musical intervals between notes rather than absolute frequencies.",
        category: "physiology"
    },
    {
        fact: "Hyperacusis is increased sensitivity to certain frequencies and volume ranges of sound, often causing discomfort.",
        category: "physiology"
    },
    {
        fact: "The round window membrane allows pressure relief in the cochlea when the stapes vibrates the oval window.",
        category: "physiology"
    },
    {
        fact: "Auditory neuropathy spectrum disorder occurs when sound enters the ear normally but the transmission to the brain is impaired.",
        category: "physiology"
    },
    {
        fact: "The medial geniculate nucleus in the thalamus relays auditory information from the inferior colliculus to the auditory cortex.",
        category: "physiology"
    },
    {
        fact: "The middle ear muscles can contract reflexively in anticipation of loud sounds, offering some protection.",
        category: "physiology"
    },
    {
        fact: "The auditory system can track multiple sound sources simultaneously, a crucial skill for survival and social interaction.",
        category: "physiology"
    },
    {
        fact: "The Eustachian tube connects the middle ear to the throat, equalizing pressure on both sides of the eardrum.",
        category: "physiology"
    },
    {
        fact: "Phantom auditory perception occurs when people hear sounds without external acoustic stimulation.",
        category: "physiology"
    },
    {
        fact: "The auditory brainstem response (ABR) is a neurological test that can assess hearing sensitivity and neural integrity.",
        category: "physiology"
    },
    {
        fact: "Sound localization abilities develop during early childhood and can be improved with training.",
        category: "physiology"
    },
    {
        fact: "The lateral superior olive in the brainstem processes interaural level differences for sound localization.",
        category: "physiology"
    },
    {
        fact: "Forward masking occurs when a sound makes it harder to hear another sound that follows shortly after.",
        category: "physiology"
    },
    {
        fact: "The auditory system has neural mechanisms for detecting gaps in sound as short as 2-3 milliseconds.",
        category: "physiology"
    },
    
    // TECHNOLOGY (60 facts)
    {
        fact: "The quietest place on Earth is Microsoft's anechoic chamber, measured at -20.6 dBA.",
        category: "technology"
    },
    {
        fact: "MP3 file compression typically removes about 90% of the original audio data.",
        category: "technology"
    },
    {
        fact: "The '1kHz tone' is the standard reference tone used in audio engineering.",
        category: "technology"
    },
    {
        fact: "The MP3 format was developed by the Fraunhofer Society in Germany in the early 1990s.",
        category: "technology"
    },
    {
        fact: "The FLAC audio format can compress audio files without any loss in quality.",
        category: "technology"
    },
    {
        fact: "Noise-cancelling headphones work by generating sound waves that are 180° out of phase with ambient noise.",
        category: "technology"
    },
    {
        fact: "The first digital audio workstation (DAW) for personal computers was Sound Designer, released in 1984.",
        category: "technology"
    },
    {
        fact: "Bluetooth audio uses psychoacoustic algorithms to compress sound in ways less noticeable to human ears.",
        category: "technology"
    },
    {
        fact: "The first portable MP3 player, the MPMan F10, was released in 1998, predating the iPod by three years.",
        category: "technology"
    },
    {
        fact: "THX certification for audio systems was developed by Lucasfilm to ensure theaters could properly reproduce the sound of Star Wars.",
        category: "technology"
    },
    {
        fact: "Auto-Tune, now ubiquitous in music production, was originally developed to analyze seismic data for oil companies.",
        category: "technology"
    },
    {
        fact: "Dolby Atmos can support up to 128 audio channels and 64 speaker feeds for immersive 3D sound.",
        category: "technology"
    },
    {
        fact: "CD-quality audio is sampled at 44.1kHz because early digital recordings used video equipment, and this rate worked with both NTSC and PAL video standards.",
        category: "technology"
    },
    {
        fact: "The Nyquist–Shannon sampling theorem states that to accurately capture a sound, you must sample at twice its highest frequency.",
        category: "technology"
    },
    {
        fact: "Spotify streams audio at 320kbps for premium users, which is about 1/4 the quality of a CD.",
        category: "technology"
    },
    {
        fact: "Binaural recording uses two microphones positioned to mimic human ears, creating a 3D listening experience through headphones.",
        category: "technology"
    },
    {
        fact: "The waterfall display in audio spectrum analyzers is based on the same technology used to display sonar information.",
        category: "technology"
    },
    {
        fact: "The first condenser microphone was developed in 1916 by E.C. Wente at Bell Laboratories.",
        category: "technology"
    },
    {
        fact: "DTS (Digital Theater Systems) was first used commercially for the film 'Jurassic Park' in 1993.",
        category: "technology"
    },
    {
        fact: "The Loudness War refers to the trend of increasing audio levels in recorded music, often at the expense of dynamic range.",
        category: "technology"
    },
    {
        fact: "Audio fingerprinting technology can identify songs from just a few seconds of audio, used by apps like Shazam.",
        category: "technology"
    },
    {
        fact: "The first successful commercial speech recognition system, Dragon Dictate, was released in 1990 at a cost of $9,000.",
        category: "technology"
    },
    {
        fact: "The AES/EBU digital audio standard was jointly developed by the Audio Engineering Society and European Broadcasting Union.",
        category: "technology"
    },
    {
        fact: "The world's first digital recording of a musical performance was made in Japan in 1967 using a 12-bit system.",
        category: "technology"
    },
    {
        fact: "Phantom power, the 48V supplied to condenser microphones, was standardized in the DIN 45596 specification in 1966.",
        category: "technology"
    },
    {
        fact: "The first consumer DAT (Digital Audio Tape) recorders were introduced in 1987, offering CD-quality recording.",
        category: "technology"
    },
    {
        fact: "The Audio Interchange File Format (AIFF) was developed by Apple in 1988 based on Electronic Arts' IFF format.",
        category: "technology"
    },
    {
        fact: "The first audio was streamed over the internet in 1993, a performance by the band Severe Tire Damage.",
        category: "technology"
    },
    {
        fact: "Hi-Resolution Audio typically refers to audio files with greater than 16-bit/44.1kHz resolution (CD quality).",
        category: "technology"
    },
    {
        fact: "The MIDI (Musical Instrument Digital Interface) protocol was standardized in 1983 and remains in wide use today.",
        category: "technology"
    },
    {
        fact: "Pro Tools, the industry standard DAW, was first released in 1991 as Sound Tools.",
        category: "technology"
    },
    {
        fact: "The first successful magnetic tape recorder, the Magnetophon, was developed in Germany in the 1930s.",
        category: "technology"
    },
    {
        fact: "Spatial audio with dynamic head tracking adjusts sound based on the listener's head position.",
        category: "technology"
    },
    {
        fact: "The Vocoder, used for robotic voice effects, was originally developed for secure communications during World War II.",
        category: "technology"
    },
    {
        fact: "The RCA 44-BX ribbon microphone, designed in 1931, is still prized by audio engineers today.",
        category: "technology"
    },
    {
        fact: "Audio dithering adds minimal noise to digital recordings to reduce quantization errors and improve sound quality.",
        category: "technology"
    },
    {
        fact: "The Yamaha DX7 synthesizer, released in 1983, revolutionized music with its digital FM synthesis.",
        category: "technology"
    },
    {
        fact: "The first audio compression algorithm specifically designed for streaming was RealAudio, released in 1995.",
        category: "technology"
    },
    {
        fact: "The Audio Home Recording Act of 1992 required digital audio recorders to implement copy protection systems.",
        category: "technology"
    },
    {
        fact: "The Loudness Unit (LU) standardized by EBU R128 measures perceived loudness rather than electrical signal levels.",
        category: "technology"
    },
    {
        fact: "The Motorola Razr was the first mobile phone to use Adaptive Multi-Rate (AMR) audio compression for calls.",
        category: "technology"
    },
    {
        fact: "The first digital reverb unit, the EMT 250, was introduced in 1976 and cost around $20,000.",
        category: "technology"
    },
    {
        fact: "Audio watermarking embeds inaudible data in sound files to track copyright or identify sources.",
        category: "technology"
    },
    {
        fact: "The MP3 patent expired in 2017, making the format completely free for use without licensing.",
        category: "technology"
    },
    {
        fact: "The RIAA curve is a standard equalization used in vinyl record production to reduce groove width while maintaining audio quality.",
        category: "technology"
    },
    {
        fact: "The first true wireless earbuds were the Bragi Dash, released in 2016 after a successful Kickstarter campaign.",
        category: "technology"
    },
    {
        fact: "Wave Field Synthesis is an audio rendering technique that creates virtual acoustic environments using many loudspeakers.",
        category: "technology"
    },
    {
        fact: "The original iPod, released in 2001, stored 1,000 songs using a 5GB hard drive.",
        category: "technology"
    },
    {
        fact: "The Fairlight CMI, introduced in 1979, was the first commercially available digital sampling synthesizer.",
        category: "technology"
    },
    {
        fact: "Internet radio station HOS (House of Soul) launched in 1995 as one of the first continuous streaming stations.",
        category: "technology"
    },
    {
        fact: "The 3.5mm headphone jack was originally developed for telephone switchboards in the 19th century.",
        category: "technology"
    },
    {
        fact: "Artificial intelligence is now used to separate vocal tracks from mixed audio using neural networks.",
        category: "technology"
    },
    {
        fact: "The term 'cardioid' for heart-shaped microphone pickup patterns was first used in the 1930s.",
        category: "technology"
    },
    {
        fact: "The first MP3 encoder, L3Enc, was released in July 1994, but was too slow for real-time encoding.",
        category: "technology"
    },
    {
        fact: "The Amen Break, a six-second drum solo from a 1969 song, became one of the most sampled loops in music history.",
        category: "technology"
    },
    {
        fact: "Spotify's audio analysis algorithms categorize songs by danceability, energy, and valence (musical positivity).",
        category: "technology"
    },
    {
        fact: "Directional array microphones use multiple elements that can be electronically steered to focus on specific sound sources.",
        category: "technology"
    },
    {
        fact: "The first digital music download store, the Internet Underground Music Archive, launched in 1993.",
        category: "technology"
    },
    {
        fact: "The original Dolby noise reduction system (Dolby A) was introduced in 1965 for professional recording studios.",
        category: "technology"
    },
    {
        fact: "Amazon's Alexa uses a seven-microphone array to capture voice commands from any direction.",
        category: "technology"
    },
    {
        fact: "Digital Signal Processing (DSP) chips in modern audio equipment can perform billions of calculations per second.",
        category: "technology"
    },
    
    // MUSIC (50 facts)
    {
        fact: "The highest note ever sung was a G10 by Georgia Brown, hitting a frequency of 15,423 Hz.",
        category: "music"
    },
    {
        fact: "Vinyl records are making a comeback with sales increasing for 16 consecutive years since 2006.",
        category: "music"
    },
    {
        fact: "The world's largest musical instrument is the Stalacpipe Organ, which spans 3.5 acres in a cave.",
        category: "music"
    },
    {
        fact: "The 432Hz tuning frequency, rather than the standard 440Hz, is claimed by some to be more harmonious with nature.",
        category: "music"
    },
    {
        fact: "The lowest note on a standard piano has a frequency of 27.5 Hz, barely within human hearing range.",
        category: "music"
    },
    {
        fact: "A concert flute produces sound not by blowing air into it, but by blowing air across the edge of the mouthpiece.",
        category: "music"
    },
    {
        fact: "The loudest unamplified instrument is the trumpet, which can reach up to 130 decibels.",
        category: "music"
    },
    {
        fact: "The 'brown note' – a theoretical infrasound frequency that would cause people to lose bowel control – is scientifically impossible.",
        category: "music"
    },
    {
        fact: "The sound hole on acoustic guitars is not just decorative – it's critical for projecting sound and allowing the body to resonate.",
        category: "music"
    },
    {
        fact: "Most professional orchestras tune to A=442Hz, slightly higher than the standard A=440Hz used elsewhere.",
        category: "music"
    },
    {
        fact: "Early punk rock was recorded with vocal microphones placed directly against guitar amplifier speakers to get distortion.",
        category: "music"
    },
    {
        fact: "The Wilhelm Scream, a specific sound effect, has been used in over 400 films and has become an inside joke in the film industry.",
        category: "music"
    },
    {
        fact: "Modern orchestras typically have 5 different types of drums but over 17 different percussion instruments in total.",
        category: "music"
    },
    {
        fact: "The phonograph, invented by Thomas Edison in 1877, originally recorded sound on tinfoil-wrapped cylinders.",
        category: "music"
    },
    {
        fact: "The theremin is played without physical contact, using electromagnetic fields to control pitch and volume.",
        category: "music"
    },
    {
        fact: "The equal temperament tuning system divides an octave into 12 equal parts, a compromise that allows music in all keys.",
        category: "music"
    },
    {
        fact: "A violin string under proper tension experiences about 40 pounds (18 kg) of pull.",
        category: "music"
    },
    {
        fact: "The Bosendorfer 290 Imperial grand piano has 97 keys, eight more than the standard 88-key piano.",
        category: "music"
    },
    {
        fact: "The word 'beat' in music has three different meanings: pulse, rhythmic emphasis, and acoustic interference.",
        category: "music"
    },
    {
        fact: "The harmonic series is a physical property that determines the overtones in musical instruments.",
        category: "music"
    },
    {
        fact: "The didgeridoo, one of the oldest wind instruments, produces sound using circular breathing techniques.",
        category: "music"
    },
    {
        fact: "Electric guitar pickups work by sensing disruptions in a magnetic field caused by vibrating steel strings.",
        category: "music"
    },
    {
        fact: "Drums tuned to specific pitches (like timpani) follow the same acoustical principles as wind instruments.",
        category: "music"
    },
    {
        fact: "The oboe traditionally gives the tuning A for orchestras because its sound cuts through the ensemble clearly.",
        category: "music"
    },
    {
        fact: "The pipe organ was the most complex machine built by humans until the Industrial Revolution.",
        category: "music"
    },
    {
        fact: "The term 'headroom' in audio refers to the margin between the average level and the maximum level before distortion.",
        category: "music"
    },
    {
        fact: "The pentatonic scale, found in music worldwide, contains five notes per octave instead of the usual seven.",
        category: "music"
    },
    {
        fact: "Concert halls use diffusers to scatter sound reflections and prevent echoes while maintaining reverberation.",
        category: "music"
    },
    {
        fact: "The world's longest playable musical instrument is the Boardwalk Hall Auditorium Organ with 33,112 pipes.",
        category: "music"
    },
    {
        fact: "Humans can detect pitch changes as small as 0.2% under ideal conditions.",
        category: "music"
    },
    {
        fact: "Musical notes don't have fixed frequencies in all tuning systems; they depend on cultural and historical factors.",
        category: "music"
    },
    {
        fact: "The trombone is the only brass instrument that uses a slide rather than valves to change pitch.",
        category: "music"
    },
    {
        fact: "The Mixolydian mode, used in many rock and blues songs, is a major scale with a flattened seventh note.",
        category: "music"
    },
    {
        fact: "The Mellotron, popular in the 1960s-70s, created sounds by playing back tape recordings of actual instruments.",
        category: "music"
    },
    {
        fact: "The hang drum (handpan) was invented in 2000 in Switzerland and combines principles of the steel pan and gamelan.",
        category: "music"
    },
    {
        fact: "The pedal steel guitar can produce microtones and smooth glissandos not possible on standard guitars.",
        category: "music"
    },
    {
        fact: "The clavichord, popular in the Renaissance, could create vibrato through a technique called 'bebung.'",
        category: "music"
    },
    {
        fact: "In pipe organs, larger pipes produce lower notes, following the same principle as pan flutes.",
        category: "music"
    },
    {
        fact: "The human voice is classified as a wind instrument because it produces sound using air flow and vibration.",
        category: "music"
    },
    {
        fact: "The harp is the only modern orchestral instrument that evolved directly from ancient instruments.",
        category: "music"
    },
    {
        fact: "The Hydraulophone is a musical instrument played by direct contact with water.",
        category: "music"
    },
    {
        fact: "Glass harmonica, invented by Benjamin Franklin, produces sounds from glass bowls rotated on a spindle.",
        category: "music"
    },
    {
        fact: "The Chapman Stick, a 10 or 12-string instrument, is played by tapping the strings rather than plucking.",
        category: "music"
    },
    {
        fact: "Every violin produces a unique spectral fingerprint that can be used to identify individual instruments.",
        category: "music"
    },
    {
        fact: "Just intonation tuning uses simple mathematical ratios between frequencies, creating 'pure' intervals.",
        category: "music"
    },
    {
        fact: "The first music synthesizer, the Telharmonium, weighed 200 tons and was built in 1897.",
        category: "music"
    },
    {
        fact: "The mbira (thumb piano) uses metal tines attached to a resonator to create distinctive African sounds.",
        category: "music"
    },
    {
        fact: "The oldest known complete musical composition is the Seikilos Epitaph from ancient Greece, dated around 100 CE.",
        category: "music"
    },
    {
        fact: "The 'devil's interval' (tritone) was avoided in medieval music due to its dissonant sound.",
        category: "music"
    },
    {
        fact: "The human voice can produce formants, resonances that give vowels their distinctive qualities.",
        category: "music"
    },
    
    // NATURE (45 facts)
    {
        fact: "The loudest sound ever recorded was the 1883 Krakatoa volcanic eruption, heard 3,000 miles away.",
        category: "nature"
    },
    {
        fact: "Whales can communicate with each other from up to 1,000 miles away using low-frequency sounds.",
        category: "nature"
    },
    {
        fact: "A dog's hearing range is approximately 40Hz to 60,000Hz, compared to humans at 20Hz to 20,000Hz.",
        category: "nature"
    },
    {
        fact: "Pistol shrimp create a bubble that collapses so violently it produces a sound louder than a gunshot.",
        category: "nature"
    },
    {
        fact: "Elephants can communicate using infrasound frequencies below human hearing range, allowing them to coordinate over many miles.",
        category: "nature"
    },
    {
        fact: "Bats can detect objects as thin as a human hair using echolocation.",
        category: "nature"
    },
    {
        fact: "The blue whale is the loudest animal on Earth, with calls reaching 188 decibels that can travel hundreds of miles underwater.",
        category: "nature"
    },
    {
        fact: "Tigers' roars can be heard from up to 2 miles away and can actually paralyze their prey with fear.",
        category: "nature"
    },
    {
        fact: "The howler monkey is the loudest land animal, with calls that can be heard up to 3 miles away through dense forest.",
        category: "nature"
    },
    {
        fact: "The water boatman insect creates the loudest sound relative to its body size, equivalent to a human shouting at 99 decibels.",
        category: "nature"
    },
    {
        fact: "Some moths have evolved ears that can detect bat echolocation, allowing them to evade capture.",
        category: "nature"
    },
    {
        fact: "Dolphins can recognize the unique echo signature of different fish species using echolocation.",
        category: "nature"
    },
    {
        fact: "Prairie dogs have one of the most complex animal languages, with different calls for specific predators and descriptions.",
        category: "nature"
    },
    {
        fact: "Cicadas can produce sounds up to 120 decibels, similar to a chainsaw or thunderclap.",
        category: "nature"
    },
    {
        fact: "The snapping shrimp (Alpheus heterochaelis) can stun prey with a bubble cavitation that reaches 218 decibels.",
        category: "nature"
    },
    {
        fact: "The sperm whale's head contains a specialized organ called the 'junk' that may function as an acoustic lens for hunting.",
        category: "nature"
    },
    {
        fact: "Lyrebirds can mimic almost any sound they hear, including chainsaws, car alarms, and other birds' calls.",
        category: "nature"
    },
    {
        fact: "Katydids produce sound by rubbing their wings together, creating frequencies up to 130 kHz.",
        category: "nature"
    },
    {
        fact: "The tiger moth can jam bat echolocation by producing ultrasonic clicks that interfere with the predator's system.",
        category: "nature"
    },
    {
        fact: "Termites communicate through vibrations sent through the wood they inhabit, using a form of seismic signaling.",
        category: "nature"
    },
    {
        fact: "The peacock mantis shrimp can create cavitation bubbles with its claws that produce light (sonoluminescence) when they collapse.",
        category: "nature"
    },
    {
        fact: "Giraffes use infrasound to communicate over long distances, though they were long thought to be mostly silent.",
        category: "nature"
    },
    {
        fact: "The Richardson's ground squirrel gives different alarm calls depending on the type of predator and urgency of the threat.",
        category: "nature"
    },
    {
        fact: "The courtship song of the male mosquito is produced by beating its wings at specific frequencies to attract females.",
        category: "nature"
    },
    {
        fact: "The humpback whale's song can last up to 30 minutes and changes over time, evolving like a cultural phenomenon.",
        category: "nature"
    },
    {
        fact: "Mountain gorillas have at least 25 distinct vocalizations used for various forms of communication.",
        category: "nature"
    },
    {
        fact: "The male white bellbird produces the loudest bird call ever recorded, reaching 125 decibels.",
        category: "nature"
    },
    {
        fact: "Certain fish species use their swim bladders as resonating chambers to produce and amplify sounds.",
        category: "nature"
    },
    {
        fact: "Palm cockatoos use sticks to drum rhythmic beats on hollow trees during courtship displays.",
        category: "nature"
    },
    {
        fact: "The toadfish attracts mates by contracting muscles against its swim bladder, producing a distinctive humming sound.",
        category: "nature"
    },
    {
        fact: "Mole rats communicate through seismic vibrations transmitted through tunnel walls.",
        category: "nature"
    },
    {
        fact: "The three-wattled bellbird's call sounds like a metallic 'bonk' and can be heard from over half a mile away.",
        category: "nature"
    },
    {
        fact: "Alligators create infrasound bellows by vibrating air in their lungs, causing water above their backs to 'dance'.",
        category: "nature"
    },
    {
        fact: "The male sage grouse produces popping sounds during courtship by inflating and deflating specialized air sacs.",
        category: "nature"
    },
    {
        fact: "The male club-winged manakin bird rubs specialized wing feathers together at 1,500 times per second to create a violin-like sound.",
        category: "nature"
    },
    {
        fact: "Sea urchins can hear despite having no ears or specialized auditory organs, using their entire body as a hearing mechanism.",
        category: "nature"
    },
    {
        fact: "The loudest insect relative to its size is the micronecta scholtzi water bug, which can reach 99.2 decibels using its genitalia.",
        category: "nature"
    },
    {
        fact: "Orangutans can control their vocal resonance using throat pouches to make their calls sound deeper and more impressive.",
        category: "nature"
    },
    {
        fact: "Rattlesnakes create their warning sound by vibrating specialized hollow scales at the end of their tail.",
        category: "nature"
    },
    {
        fact: "The male red deer's roar during rutting season can temporarily lower the pitch of their voice by expanding their larynx.",
        category: "nature"
    },
    {
        fact: "Spiders can detect prey, predators and mates through vibrations sensed by specialized organs in their legs.",
        category: "nature"
    },
    {
        fact: "The Caribbean reef squid communicates through complex patterns of skin color changes, essentially forming a visual language.",
        category: "nature"
    },
    {
        fact: "Woodpeckers can drum on trees at rates of up to 20 pecks per second, creating distinctive territorial sounds.",
        category: "nature"
    },
    {
        fact: "Hippos communicate underwater using a form of sonar-like sound production.",
        category: "nature"
    },
    {
        fact: "The male midshipman fish can hum continuously for hours to attract females, using specialized sonic muscles.",
        category: "nature"
    },
    
    // HISTORY (40 facts)
    {
        fact: "The first audio recording was made in 1860 by Édouard-Léon Scott de Martinville.",
        category: "history"
    },
    {
        fact: "The first multi-track recording was made by Les Paul in 1954, revolutionizing music production.",
        category: "history"
    },
    {
        fact: "Audio compression was invented in the 1930s as a way to fit radio broadcasts into limited bandwidth.",
        category: "history"
    },
    {
        fact: "The oldest known musical instrument is a flute made from a vulture's wing bone, dated at 43,000 years old.",
        category: "history"
    },
    {
        fact: "Edison's early phonographs required users to shout into the recording horn to create enough energy to engrave the sound waves.",
        category: "history"
    },
    {
        fact: "The Radio Act of 1927 was created to prevent radio signal interference when too many stations broadcast on the same frequency.",
        category: "history"
    },
    {
        fact: "The first commercial stereo recordings were released in 1958, though the technology had been developed decades earlier.",
        category: "history"
    },
    {
        fact: "The Sony Walkman, introduced in 1979, revolutionized portable audio and sold over 385 million units.",
        category: "history"
    },
    {
        fact: "The first digital recording released commercially was Ry Cooder's 'Bop 'Til You Drop' in 1979.",
        category: "history"
    },
    {
        fact: "The earliest known written record describing echo phenomena is from 350 BCE by Aristotle.",
        category: "history"
    },
    {
        fact: "Mozart's music was never recorded during his lifetime as he died in 1791, well before audio recording was invented.",
        category: "history"
    },
    {
        fact: "The concept of stereo sound was patented by Alan Blumlein in 1931 while working for EMI.",
        category: "history"
    },
    {
        fact: "The electronic synthesizer was invented by Robert Moog in the 1960s, changing the course of modern music.",
        category: "history"
    },
    {
        fact: "The 8-track tape format was developed in 1964 by a consortium led by Bill Lear of Learjet fame.",
        category: "history"
    },
    {
        fact: "The first transatlantic radio broadcast occurred in 1901 when Guglielmo Marconi transmitted the letter 'S' in Morse code.",
        category: "history"
    },
    {
        fact: "The term 'mix tape' originated in the 1980s when people created custom music compilations on cassette tapes.",
        category: "history"
    },
    {
        fact: "The BBC Radiophonic Workshop, founded in 1958, pioneered electronic music and sound effects for radio and television.",
        category: "history"
    },
    {
        fact: "The first telephone transmitted sound using a liquid transmitter with an acidic solution.",
        category: "history"
    },
    {
        fact: "The acoustic horn, used to mechanically amplify sound before electrical amplification, dates back to ancient Greece.",
        category: "history"
    },
    {
        fact: "The Boombox became a cultural icon in the 1970s-80s, symbolizing the rise of hip-hop culture.",
        category: "history"
    },
    {
        fact: "Emile Berliner's gramophone, which played flat discs instead of cylinders, became the foundation for modern record players.",
        category: "history"
    },
    {
        fact: "The Fender Rhodes electric piano was originally developed as a therapy instrument for soldiers during World War II.",
        category: "history"
    },
    {
        fact: "The world's first audio logo was NBC's three-note chime, which was trademarked in 1950.",
        category: "history"
    },
    {
        fact: "The public address system was first used effectively at the 1915 San Francisco World's Fair.",
        category: "history"
    },
    {
        fact: "The IMAX sound system was developed in the 1970s to match the immersive visual experience of IMAX theaters.",
        category: "history"
    },
    {
        fact: "The 'whisper chambers' of ancient buildings like St. Paul's Cathedral allowed people to hear faint sounds across great distances.",
        category: "history"
    },
    {
        fact: "The first audio broadcast over the internet was a baseball game between the Seattle Mariners and New York Yankees in 1995.",
        category: "history"
    },
    {
        fact: "Muzak, originally founded in 1934, scientifically designed background music to influence behavior in workplaces and public spaces.",
        category: "history"
    },
    {
        fact: "The Loudness War began in the 1980s with the advent of the CD, which had greater dynamic range than vinyl records.",
        category: "history"
    },
    {
        fact: "The Ringling Brothers circus used acoustical architecture to ensure that their band could be heard throughout their big top tents.",
        category: "history"
    },
    {
        fact: "The term 'sound barrier' was coined in the 1940s as aircraft approached the speed of sound and experienced severe turbulence.",
        category: "history"
    },
    {
        fact: "The compact disc (CD) was jointly developed by Philips and Sony and released commercially in 1982.",
        category: "history"
    },
    {
        fact: "The first sound recording that could be played back was Thomas Edison's 'Mary Had a Little Lamb' in 1877.",
        category: "history"
    },
    {
        fact: "Napster, launched in 1999, revolutionized music distribution by enabling peer-to-peer file sharing of MP3s.",
        category: "history"
    },
    {
        fact: "The Hammond organ, invented in 1935, was originally marketed to churches as a lower-cost alternative to pipe organs.",
        category: "history"
    },
    {
        fact: "The phonographic cylinder, not the flat disc record, was the dominant audio format from the 1880s through the 1910s.",
        category: "history"
    },
    {
        fact: "The first car radio was introduced in 1930 by the Galvin Manufacturing Corporation, later known as Motorola.",
        category: "history"
    },
    {
        fact: "The Audio Engineering Society was founded in 1948 to promote standards and education in audio engineering.",
        category: "history"
    },
    {
        fact: "The cassette tape was introduced by Philips in 1963 and originally intended for dictation, not music.",
        category: "history"
    },
    {
        fact: "Alexander Graham Bell's first words on the telephone in 1876 were 'Mr. Watson, come here, I want to see you.'",
        category: "history"
    },
    
    // HEALTH (40 facts)
    {
        fact: "Tinnitus affects about 15-20% of people and is often perceived as a ringing, buzzing, or hissing in the ears.",
        category: "health"
    },
    {
        fact: "Exposure to sounds above 85 decibels for prolonged periods can cause permanent hearing damage.",
        category: "health"
    },
    {
        fact: "Noise-induced hearing loss (NIHL) is one of the most common occupational illnesses in the United States.",
        category: "health"
    },
    {
        fact: "Listening to music can reduce anxiety by up to 65% according to some studies.",
        category: "health"
    },
    {
        fact: "Sound therapy is used to treat various conditions including depression, autism, and even certain types of pain.",
        category: "health"
    },
    {
        fact: "The stapedius reflex is an automatic contraction of middle ear muscles that protects the inner ear from loud sounds.",
        category: "health"
    },
    {
        fact: "Auditory processing disorder affects how the brain interprets sounds rather than how the ears detect them.",
        category: "health"
    },
    {
        fact: "Pink noise has been shown to improve sleep quality and memory in older adults.",
        category: "health"
    },
    {
        fact: "Hyperacusis is a condition where ordinary sounds seem unbearably loud, affecting 1 in 50,000 people.",
        category: "health"
    },
    {
        fact: "Binaural beats, created when slightly different frequencies are played in each ear, are claimed to affect brainwave patterns.",
        category: "health"
    },
    {
        fact: "Misophonia is a condition where specific sounds trigger strong emotional responses like anger or anxiety.",
        category: "health"
    },
    {
        fact: "Music therapy can help stroke patients regain speech and movement by stimulating multiple areas of the brain.",
        category: "health"
    },
    {
        fact: "The 'Mozart effect', though often exaggerated, suggests that classical music may temporarily enhance spatial-temporal reasoning.",
        category: "health"
    },
    {
        fact: "Hospital patients exposed to nature sounds typically require less pain medication than those in standard sound environments.",
        category: "health"
    },
    {
        fact: "Continuous exposure to noise above 70 dB can increase stress hormones and blood pressure.",
        category: "health"
    },
    {
        fact: "Auditory hallucinations, hearing sounds without external stimuli, affect about 5-28% of the general population.",
        category: "health"
    },
    {
        fact: "ASMR (Autonomous Sensory Meridian Response) videos use specific sounds to trigger relaxing tingling sensations in some people.",
        category: "health"
    },
    {
        fact: "Sound waves at specific frequencies are used in lithotripsy to break up kidney stones without surgery.",
        category: "health"
    },
    {
        fact: "Presbycusis, age-related hearing loss, typically begins with high-frequency hearing loss around age 50.",
        category: "health"
    },
    {
        fact: "White noise machines can help people with ADHD focus by masking distracting environmental sounds.",
        category: "health"
    },
    {
        fact: "Phonophobia is the fear of loud sounds, often associated with migraines and post-concussion syndrome.",
        category: "health"
    },
    {
        fact: "Auditory integration training is used to help individuals with autism who have sound sensitivities.",
        category: "health"
    },
    {
        fact: "The startle reflex to sudden loud noises is one of the few reflexes humans are born with.",
        category: "health"
    },
    {
        fact: "Playing a musical instrument can improve cognitive abilities and may help prevent age-related cognitive decline.",
        category: "health"
    },
    {
        fact: "Sound-proof rooms are used in treating hyperacusis by gradually introducing controlled sounds to desensitize patients.",
        category: "health"
    },
    {
        fact: "Vibroacoustic therapy uses sound vibrations applied directly to the body to reduce pain and muscle tension.",
        category: "health"
    },
    {
        fact: "Singing in groups has been shown to release endorphins and improve mood and immune function.",
        category: "health"
    },
    {
        fact: "The Tomatis Method uses filtered high-frequency sounds to stimulate the inner ear and improve listening skills.",
        category: "health"
    },
    {
        fact: "Ambient noise levels in hospitals often exceed World Health Organization recommendations for patient recovery.",
        category: "health"
    },
    {
        fact: "Sensory deprivation tanks use soundproofing to create environments with minimal sensory input for therapeutic purposes.",
        category: "health"
    },
    {
        fact: "Melodic Intonation Therapy uses musical elements to help stroke patients with aphasia regain language abilities.",
        category: "health"
    },
    {
        fact: "Environmental noise pollution has been linked to increased rates of cardiovascular disease in urban populations.",
        category: "health"
    },
    {
        fact: "Active noise cancellation headphones are now prescribed by some doctors to help patients with sound sensitivities.",
        category: "health"
    },
    {
        fact: "Functional MRI studies show that music activates nearly every region of the brain, making it valuable for cognitive therapy.",
        category: "health"
    },
    {
        fact: "Otosclerosis, a condition causing hearing loss, occurs when abnormal bone growth in the middle ear prevents structures from working properly.",
        category: "health"
    },
    {
        fact: "The Listening Program is a music-based auditory stimulation method designed to improve brain function.",
        category: "health"
    },
    {
        fact: "Hidden hearing loss is damage to auditory nerves that doesn't show up on standard hearing tests but affects comprehension in noisy environments.",
        category: "health"
    },
    {
        fact: "Neurologic Music Therapy uses research-based music interventions to treat cognitive, sensory, and motor dysfunctions.",
        category: "health"
    },
    {
        fact: "GarageBand therapy uses music creation software to help adolescents express emotions and develop coping skills.",
        category: "health"
    },
    {
        fact: "The threshold of pain for sound is around 130 decibels, though damage begins at much lower levels.",
        category: "health"
    },
    
    // MISCELLANEOUS (45 facts)
    {
        fact: "The longest echo in man-made structures is in the Hamilton Mausoleum in Scotland, lasting 15 seconds.",
        category: "misc"
    },
    {
        fact: "A single violinist playing fortissimo (very loudly) produces about the same volume as a trumpet playing mezzo-forte (moderately loud).",
        category: "misc"
    },
    {
        fact: "People who experience ASMR (Autonomous Sensory Meridian Response) can get tingles from certain sounds like whispering or tapping.",
        category: "misc"
    },
    {
        fact: "Before electronic recording, orchestras had to crowd around a large horn to record music acoustically.",
        category: "misc"
    },
    {
        fact: "The vuvuzela, made famous during the 2010 World Cup, produces sound at around 120 decibels - louder than a chainsaw.",
        category: "misc"
    },
    {
        fact: "The sound of a Star Wars lightsaber was created by combining the hum of an old TV set with the buzz of a film projector motor.",
        category: "misc"
    },
    {
        fact: "The word 'saxophone' combines the name of its inventor, Adolphe Sax, with the Greek word 'phone' meaning sound or voice.",
        category: "misc"
    },
    {
        fact: "The reason we don't like hearing recordings of our own voice is because we normally hear it conducted through our skull bones.",
        category: "misc"
    },
    {
        fact: "The bell of an upright piano is open at the bottom to allow sound to reflect off the floor.",
        category: "misc"
    },
    {
        fact: "The use of ultrasound in medical imaging began in the 1940s, based on sonar technology developed during World War II.",
        category: "misc"
    },
    {
        fact: "Silence is actually processed by the same auditory regions of the brain as sound.",
        category: "misc"
    },
    {
        fact: "Earworms - songs that get stuck in your head - typically last for 15-30 seconds and commonly affect people with OCD traits.",
        category: "misc"
    },
    {
        fact: "The word 'Echo' comes from Greek mythology, named after a nymph whose voice was cursed to only repeat what others said.",
        category: "misc"
    },
    {
        fact: "The THX Deep Note, one of the most recognizable audio logos, was created by Dr. James Moorer in 1983.",
        category: "misc"
    },
    {
        fact: "The original Pringles can was designed to function as an acoustic amplifier for tennis balls.",
        category: "misc"
    },
    {
        fact: "Foley artists create everyday sound effects for films and TV shows using props and creative techniques.",
        category: "misc"
    },
    {
        fact: "The Nokia ringtone 'Gran Vals' is actually a classical guitar piece composed by Francisco Tárrega in 1902.",
        category: "misc"
    },
    {
        fact: "Wine glasses ring at different pitches depending on how much liquid they contain - more liquid creates a lower pitch.",
        category: "misc"
    },
    {
        fact: "The 'Bloop' was an ultra-low frequency sound detected by NOAA in 1997 that remains partially unexplained.",
        category: "misc"
    },
    {
        fact: "Acoustic cryptanalysis is the process of extracting information from computer sounds, such as keyboard typing patterns.",
        category: "misc"
    },
    {
        fact: "Some restaurants intentionally design their acoustics to be noisy, as studies show it increases alcohol consumption and table turnover.",
        category: "misc"
    },
    {
        fact: "The word 'audio' comes from the Latin 'audire,' meaning 'to hear.'",
        category: "misc"
    },
    {
        fact: "The 'phantom word' effect occurs when listening to unintelligible vocals, causing the brain to invent recognizable words.",
        category: "misc"
    },
    {
        fact: "The 'McGurk effect' demonstrates how visual cues affect sound perception - when we see different lip movements, we hear different sounds.",
        category: "misc"
    },
    {
        fact: "Archaeoacoustics studies the acoustics of ancient sites, revealing how architecture was designed for specific sound effects.",
        category: "misc"
    },
    {
        fact: "Some medieval churches were acoustically designed to create specific effects during Gregorian chants.",
        category: "misc"
    },
    {
        fact: "Audio branding, using distinctive sounds for product recognition, dates back to early radio advertising jingles in the 1920s.",
        category: "misc"
    },
    {
        fact: "SOFAR channels in the ocean allow whale songs to travel thousands of miles due to specific acoustic properties at certain depths.",
        category: "misc"
    },
    {
        fact: "The word 'stereophonic' comes from Greek, meaning 'solid sound' or 'three-dimensional sound.'",
        category: "misc"
    },
    {
        fact: "The London Underground once used recordings of mosquitoes to deter young people from loitering at stations.",
        category: "misc"
    },
    {
        fact: "Silent discos use wireless headphones instead of loudspeakers, allowing multiple DJs to play simultaneously.",
        category: "misc"
    },
    {
        fact: "The THX cinema certification process includes 400 scientific quality tests for audio and visual performance.",
        category: "misc"
    },
    {
        fact: "Tibetan singing bowls create sound through friction and resonance, used for centuries in meditation practices.",
        category: "misc"
    },
    {
        fact: "The speed of sound was first accurately measured by a group of Dutch scientists using cannon fire in 1660.",
        category: "misc"
    },
    {
        fact: "Archaeologists can recover sound from ancient pottery by analyzing the microscopic patterns made by scribes' tools.",
        category: "misc"
    },
    {
        fact: "The Shepard tone creates the auditory illusion of a continuously rising or falling pitch that never actually gets higher or lower.",
        category: "misc"
    },
    {
        fact: "The 'cocktail party problem' is a fundamental challenge in artificial intelligence - isolating one voice among many.",
        category: "misc"
    },
    {
        fact: "The Ear of Dionysius in Sicily was designed to amplify sound so that prisoners' whispers could be heard by guards.",
        category: "misc"
    },
    {
        fact: "The sound of the T-Rex in Jurassic Park was created by combining the sounds of a baby elephant, an alligator, and a tiger.",
        category: "misc"
    },
    {
        fact: "The 'sonic boom' of the Concorde supersonic jet led to restrictions on supersonic travel over populated areas.",
        category: "misc"
    },
    {
        fact: "Sonic branding for products is carefully designed to evoke specific emotions and brand associations.",
        category: "misc"
    },
    {
        fact: "Soundwalking is the practice of actively listening to environmental sounds while walking, developing audio awareness.",
        category: "misc"
    },
    {
        fact: "The ancient Roman amphitheaters were acoustically designed so that actors could be heard clearly without amplification.",
        category: "misc"
    },
    {
        fact: "The whispering gallery in St. Paul's Cathedral in London allows whispers to be heard clearly across the dome due to acoustic focusing.",
        category: "misc"
    },
    {
        fact: "The distinctive boot-up sound of video game consoles is called an 'ident' and helps build brand recognition.",
        category: "misc"
    }
];

// Function to get the daily fact - strictly once per day
function getDailyFact() {
    // Use the current date as a seed to get a consistent fact for the whole day
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    // Create a simple hash from the date string to use as an index
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
    }
    
    // Get a positive index from the hash
    const index = Math.abs(hash) % audioFacts.length;
    
    return audioFacts[index];
}

// Function to display the daily fact in the UI
function displayDailyFact() {
    const factData = getDailyFact();
    const factElement = document.getElementById('daily-fact-text');
    const categoryElement = document.getElementById('fact-category');
    
    if (factElement) {
        factElement.textContent = factData.fact;
    }
    
    if (categoryElement) {
        categoryElement.textContent = factData.category;
        // Set category badge color based on category
        categoryElement.className = 'fact-category-badge ' + factData.category;
    }
}

// Function to mark fact as viewed and clear badge
function markFactAsViewed() {
    const today = new Date().toDateString();
    
    // Check if we should clear badge and update last viewed date
    chrome.storage.local.get(['lastFactDate'], function(result) {
        // Check if there's a badge to clear (if user hasn't viewed for 3+ days)
        chrome.action.getBadgeText({}, function(badgeText) {
            if (badgeText && badgeText.length > 0) {
                // Badge exists, so clear it
                chrome.runtime.sendMessage({
                    type: 'FACT_VIEWED'
                }, function(response) {
                    console.log('Badge cleared, fact marked as viewed:', response?.success);
                });
            } else if (result.lastFactDate !== today) {
                // No badge but date is different, just update the last viewed date
                chrome.storage.local.set({lastFactDate: today});
            }
        });
    });
}

// Function to check if the fact is new (different from last viewed fact)
function checkForNewFact() {
    chrome.storage.local.get(['lastFactDate'], function(result) {
        const today = new Date().toDateString();
        const lastViewed = new Date(result.lastFactDate || 0);
        
        // Calculate days difference
        const timeDiff = new Date(today).getTime() - lastViewed.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        // If it's a new fact, show new indicator
        if (result.lastFactDate !== today) {
            // Add a "New!" indicator to the fact card
            const factCard = document.querySelector('.daily-fact');
            if (factCard && factCard.querySelector('.card-header')) {
                // Don't add duplicate indicators
                if (!factCard.querySelector('.new-fact-indicator')) {
                    const newIndicator = document.createElement('div');
                    newIndicator.className = 'new-fact-indicator';
                    
                    // If it's been 3+ days, make it more noticeable
                    if (daysDiff >= 3) {
                        newIndicator.textContent = 'NEW!';
                        newIndicator.classList.add('missed-facts');
                        
                        // Add counts if it's been more than a week
                        if (daysDiff >= 7) {
                            newIndicator.textContent = `NEW! (${daysDiff} days)`;
                        }
                    } else {
                        newIndicator.textContent = 'NEW';
                    }
                    
                    factCard.querySelector('.card-header').appendChild(newIndicator);
                }
                
                // Add subtle animation to highlight the new fact
                factCard.classList.add('new-fact-highlight');
                
                // Remove highlight after animation completes
                setTimeout(() => {
                    factCard.classList.remove('new-fact-highlight');
                }, 3000);
            }
        }
    });
}

// Set up when popup loads
document.addEventListener('DOMContentLoaded', function() {
    // Display the daily fact
    displayDailyFact();
    
    // Check if the fact is new
    checkForNewFact();
    
    // Mark fact as viewed and clear badge if needed
    markFactAsViewed();
});
