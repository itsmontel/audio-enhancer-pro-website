const eqPresets = {
    // Flat preset - neutral reference point
    "flat": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    
    // Bass Boost - enhances low frequencies for more punch
    "bass": [6, 4, 3, 2, 1, 0, 0, 0, 0, 0],
    
    // Vocal Boost - enhances midrange frequencies for clearer vocals
    "vocal": [-2, -1, 0, 2, 4, 6, 4, 2, 0, -1],
    
    // Rock - balanced preset with boosted lows and highs
    "rock": [4, 3, 2, 1, 0, 0, 1, 2, 3, 4],
    
    // Classical - enhances clarity and detail for classical music
    "classical": [0, 1, 2, 2, 0, -1, -1, 0, 2, 3],
    
    // Podcast - optimized for speech clarity with reduced bass
    "podcast": [-4, -2, 0, 3, 5, 6, 5, 2, 0, -1],

    // Electronic/EDM - enhanced bass and treble with scooped mids
    "electronic": [5, 4, 2, 1, -1, -2, -3, 2, 3, 4],
    
    // Jazz - warm mids with subtle bass enhancement
    "jazz": [2, 3, 1, -1, 2, 3, 1, 2, 0, -2],
    
    // Acoustic - balanced with enhanced presence for acoustic instruments
    "acoustic": [-1, 0, 1, 2, 0, 2, 3, 4, 2, 1],
    
    // Cinema - movie audio with enhanced dialogue clarity and dramatic bass
    "cinema": [5, 4, 2, 0, -2, 4, 5, 3, 2, -1],
    
    // Gaming - enhanced spatial awareness and footstep clarity
    "gaming": [3, 1, -1, -2, 0, 3, 5, 6, 4, 3]
};