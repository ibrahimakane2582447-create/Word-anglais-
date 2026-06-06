import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.englishvocabschool.app',
  appName: 'englishvocabschool',
  webDir: 'dist',
  plugins: {
    AdMob: {
      androidAppId: 'ca-app-pub-3940256099942544~3347511713'
    }
  }
};

export default config;
