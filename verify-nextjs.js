const { execSync } = require('child_process');
const { existsSync } = require('fs');

console.log('🔍 Verifying Next.js installation...\n');

try {
  // Step 1: Check if next.js is in package.json
  console.log('1️⃣ Checking package.json...');
  const packageJson = require('./package.json');
  const nextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next;
  
  if (!nextVersion) {
    throw new Error('Next.js is not listed in package.json dependencies');
  }
  console.log(`✅ Next.js version in package.json: ${nextVersion}`);

  // Step 2: Verify next binary exists
  console.log('\n2️⃣ Checking next binary...');
  const nextBinaryPath = './node_modules/.bin/next';
  if (!existsSync(nextBinaryPath)) {
    throw new Error('Next.js binary not found. Try reinstalling Next.js');
  }
  console.log('✅ Next.js binary found');

  // Step 3: Check actual installed version
  console.log('\n3️⃣ Checking installed version...');
  const installedVersion = execSync('npx next --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Installed Next.js version: ${installedVersion}`);

  // Step 4: Verify critical Next.js files
  console.log('\n4️⃣ Checking Next.js installation integrity...');
  const criticalPaths = [
    './node_modules/next/dist',
    './node_modules/next/package.json',
    './node_modules/next/app.js',
    './node_modules/next/types'
  ];

  for (const path of criticalPaths) {
    if (!existsSync(path)) {
      throw new Error(`Missing critical Next.js file: ${path}`);
    }
  }
  console.log('✅ Next.js installation appears complete');

  console.log('\n✅ Next.js verification completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. If you need to update Next.js, run:');
  console.log('   npm install next@latest');
  console.log('2. Clear the Next.js cache:');
  console.log('   rm -rf .next');
  console.log('3. Restart the development server:');
  console.log('   npm run dev');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.log('\n🔧 Troubleshooting steps:');
  console.log('1. Try removing node_modules and reinstalling:');
  console.log('   rm -rf node_modules package-lock.json');
  console.log('   npm install');
  console.log('2. If the issue persists, try a fresh Next.js installation:');
  console.log('   npm install next@latest react@latest react-dom@latest');
  process.exit(1);
}

