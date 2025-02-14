import { execSync } from 'child_process';

try {
  console.log('Rebuilding the project...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully.');
} catch (error) {
  console.error('Error during build:', error.message);
}

