import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default ({mode}: {mode: string}) => {
  const isProd = mode === 'production';
  return defineConfig({
    plugins: [react()],
    base: isProd ? '/petrovich/frontend/dist/' : '',
  })
}