import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({
 plugins:[react(),VitePWA({
  registerType:'autoUpdate',
  manifest:{
    name:'VolleyAtlas — statistika odbojke',short_name:'VolleyAtlas',start_url:'/',display:'standalone',
    theme_color:'#081927',background_color:'#081927',
    icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]
  }
 })]
});
