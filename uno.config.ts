import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'card': 'bg-[#ffffff] rounded-lg border border-[#e8eaed] p-4'
  },
  safelist: []
})
