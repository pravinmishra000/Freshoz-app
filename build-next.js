const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mode = process.argv[2] || 'web'; // default = web
const configFile =
  mode === 'app' ? 'next.config.app.js' : 'next.config.web.js';

// Copy correct config to next.config.js
fs.copyFileSync(
  path.join(__dirname, configFile),
  path.join(__dirname, 'next.config.js')
);

console.log(`✅ Using ${configFile} configuration`);

try {
  execSync('next build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (err) {
  console.error('❌ Build failed:', err);
  process.exit(1);
}
