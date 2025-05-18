const { execSync } = require('child_process');

// This is a very simple script to allow Render to serve static files
// Render will automatically run "npm start" which will call this script

console.log('Starting Audio Enhancer Pro website...');
console.log('Serving static files from the current directory...');

// This script doesn't need to do anything special
// The package.json "start" script handles the serving 