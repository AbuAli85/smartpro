import { execSync } from 'child_process';

try {
  console.log('Installing missing dependencies...');
  execSync('npm install jsonwebtoken http-proxy-middleware', { stdio: 'inherit' });
  console.log('Dependencies installed successfully.');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
}

