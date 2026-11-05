import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ base: '/MIND-EMOTIONS-ULTRA/', plugins:[react()], server:{host:'0.0.0.0', allowedHosts:true} });
