import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.romeo.uchiha',
  appName: 'MIRAE',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // 👇 Asal Jadoo yahan hai: Apni Vercel website ka link yahan dalein
    url: 'https://basit-shop1.vercel.app', 
    cleartext: true
  }
};

export default config;

