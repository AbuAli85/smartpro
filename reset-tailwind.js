const { execSync } = require('child_process');
const { writeFileSync, rmSync } = require('fs');

try {
  // Step 1: Complete cleanup
  console.log('🧹 Performing complete cleanup...');
  execSync('rm -rf node_modules package-lock.json .next', { stdio: 'inherit' });
  console.log('✅ Cleaned up existing files');

  // Step 2: Fresh install of dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  execSync('npm install -D tailwindcss@latest postcss@latest autoprefixer@latest', { stdio: 'inherit' });
  console.log('✅ Installed fresh dependencies');

  // Step 3: Initialize Tailwind (without existing config)
  console.log('🎨 Initializing Tailwind...');
  execSync('npx tailwindcss init -p', { stdio: 'inherit' });
  console.log('✅ Initialized Tailwind');

  // Step 4: Update PostCSS config
  const postcssConfig = `module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  }
}`;
  writeFileSync('postcss.config.js', postcssConfig);
  console.log('✅ Created PostCSS config');

  // Step 5: Update Tailwind config
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`;
  writeFileSync('tailwind.config.js', tailwindConfig);
  console.log('✅ Created Tailwind config');

  console.log('\n🎉 Setup completed! Next steps:');
  console.log('1. Verify your app/globals.css contains the Tailwind directives:');
  console.log('   @tailwind base;');
  console.log('   @tailwind components;');
  console.log('   @tailwind utilities;');
  console.log('\n2. Start the development server:');
  console.log('   npm run dev');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n🔍 Troubleshooting:');
  console.log('1. Make sure you have Node.js 16+ installed');
  console.log('2. Check if you have write permissions in the project directory');
  console.log('3. Try running the commands manually one by one');
  process.exit(1);
}

