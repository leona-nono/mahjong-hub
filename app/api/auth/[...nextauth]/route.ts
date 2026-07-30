import { handlers } from '@/auth';

// Auth.js v5 ships a single handlers object — expose both verbs from here.
// Vercel will route every /api/auth/* call into this file.
export const { GET, POST } = handlers;