import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.freshoz.app',
  appName: 'Freshoz',
  bundledWebRuntime: false,
  server: {
    url: 'http://10.0.2.2:9002', // localhost for emulator
    cleartext: true
  }
};

export default config;
