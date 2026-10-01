-- Run this file separately BEFORE the Kazakh catalog migration.
-- PostgreSQL requires the new enum value to commit before it is used.
ALTER TYPE public.locale ADD VALUE IF NOT EXISTS 'kz';
