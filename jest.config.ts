import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './', // This should point to your project root
})

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  rootDir: '.', // Add this line to explicitly set the root directory
}

export default createJestConfig(config)