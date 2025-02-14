-- This is an empty migration to fix the failed state
-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "loginAttempts" INTEGER NOT NULL DEFAULT 0;

