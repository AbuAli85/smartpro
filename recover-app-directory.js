const { execSync } = require('child_process');
const { existsSync, mkdirSync, writeFileSync } = require('fs');
const path = require('path');

console.log('🔄 Starting app directory recovery process...\n');

try {
  // Step 1: Check if app directory exists
  console.log('1️⃣ Checking if app directory exists...');
  if (existsSync('./app')) {
    console.log('✅ App directory already exists');
    process.exit(0);
  }

  // Step 2: Attempt git restore
  console.log('\n2️⃣ Attempting git restore...');
  try {
    execSync('git restore app/');
    console.log('✅ Successfully restored app directory from git');
    process.exit(0);
  } catch (gitError) {
    console.log('⚠️ Git restore failed, trying git checkout...');
    try {
      execSync('git checkout HEAD -- app/');
      console.log('✅ Successfully restored app directory using git checkout');
      process.exit(0);
    } catch (checkoutError) {
      console.log('⚠️ Git checkout failed, proceeding with manual recreation...');
    }
  }

  // Step 3: Manual Recreation
  console.log('\n3️⃣ Creating app directory structure...');
  
  // Create directories
  const directories = [
    './app',
    './app/admin',
    './app/admin/dashboard',
    './app/api',
    './app/provider',
    './app/provider/services',
    './app/settings',
    './app/settings/subscription'
  ];

  directories.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });

  // Create essential files
  const files = {
    'app/layout.tsx': `import { type Metadata } from "next";
import { ReactNode } from 'react';
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartPRO",
  description: "Business Services Hub",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
    'app/page.tsx': `export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to SmartPRO</h1>
      <p className="mt-4 text-xl text-gray-600">Your Business Services Hub</p>
    </main>
  );
}`,
    'app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... other CSS variables ... */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`
  };

  Object.entries(files).forEach(([filePath, content]) => {
    writeFileSync(filePath, content);
    console.log(`Created file: ${filePath}`);
  });

  console.log('\n✅ App directory structure has been recreated!');
  console.log('\n📋 Next steps:');
  console.log('1. Verify the app structure:');
  console.log('   ls -R app/');
  console.log('2. Start the development server:');
  console.log('   npm run dev');
  console.log('3. Check if pages load correctly at:');
  console.log('   http://localhost:3000');
  console.log('\n⚠️ Note: You may need to restore additional files and components');
  console.log('   based on your project\'s specific needs.');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.log('\n🔧 Manual recovery steps:');
  console.log('1. Check your local backups');
  console.log('2. Check cloud storage/source control');
  console.log('3. Check Recycle Bin/Trash');
  console.log('4. If all else fails, recreate files manually');
  process.exit(1);
}

