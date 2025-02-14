const { execSync } = require('child_process');

console.log('🔄 Updating Next.js...');

try {
  // Update Next.js to latest version
  console.log('\n1️⃣ Updating Next.js package...');
  execSync('npm update next', { stdio: 'inherit' });
  
  // Check Next.js version
  console.log('\n2️⃣ Verifying Next.js version...');
  const nextVersion = execSync('npm list next').toString();
  console.log(nextVersion);
  
  // Clear next cache
  console.log('\n3️⃣ Clearing Next.js cache...');
  execSync('rm -rf .next', { stdio: 'inherit' });
  
  console.log('\n✅ Next.js update completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Start the development server:');
  console.log('   npm run dev');
  console.log('2. Verify the dashboard page loads without TypeScript errors');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}

