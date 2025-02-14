const { execSync } = require('child_process');
const { writeFileSync, mkdirSync } = require('fs');

console.log('🔄 Starting complete TailwindCSS reset...');

try {
  // Step 1: Remove existing installations
  console.log('\n1️⃣ Removing existing packages...');
  execSync('npm uninstall tailwindcss postcss autoprefixer @tailwindcss/postcss', { stdio: 'inherit' });
  execSync('rm -rf .next', { stdio: 'inherit' });
  console.log('✅ Cleaned existing installations');

  // Step 2: Install fresh copies
  console.log('\n2️⃣ Installing fresh packages...');
  execSync('npm install -D tailwindcss@latest postcss@latest autoprefixer@latest', { stdio: 'inherit' });
  console.log('✅ Installed fresh packages');

  // Step 3: Create necessary directories
  console.log('\n3️⃣ Setting up project structure...');
  mkdirSync('app', { recursive: true });
  console.log('✅ Created app directory');

  // Step 4: Create configuration files
  console.log('\n4️⃣ Creating configuration files...');
  
  // postcss.config.js
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  writeFileSync('postcss.config.js', postcssConfig);
  console.log('✅ Created postcss.config.js');

  // tailwind.config.js
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
  console.log('✅ Created tailwind.config.js');

  // globals.css
  const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;
  writeFileSync('app/globals.css', globalsCss);
  console.log('✅ Created globals.css');

  // Create a test component to verify setup
  const testComponent = `export default function TestComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <h1 className="text-4xl font-bold text-primary">TailwindCSS Test</h1>
      <p className="mt-4 text-muted-foreground">If you can see this styled text, TailwindCSS is working!</p>
    </div>
  );
}`;
  writeFileSync('app/page.tsx', testComponent);
  console.log('✅ Created test component');

  console.log('\n✅ Setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Start the development server:');
  console.log('   npm run dev');
  console.log('\n2. Visit http://localhost:3000 to verify the styles');
  console.log('\n3. If styles are not working:');
  console.log('   - Clear your browser cache');
  console.log('   - Delete .next folder and node_modules');
  console.log('   - Run npm install && npm run dev');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}

