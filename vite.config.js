import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Transforms .j2 files (SVGs with Jinja2 template tags) into importable data URLs
function j2SvgPlugin() {
  return {
    name: 'j2-svg',
    transform(code, id) {
      if (!id.endsWith('.j2')) return null
      const stripped = code.replace(/\{%-?[\s\S]*?-?%\}/g, '').trim()
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(stripped)}`
      return `export default ${JSON.stringify(dataUrl)}`
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), j2SvgPlugin()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
