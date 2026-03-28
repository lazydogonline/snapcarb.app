// SnapCarb App Download Links Configuration
// Update these links when the app is published to app stores

export const appDownloadLinks = {
  // App Store links (iOS)
  ios: {
    appStore: 'https://apps.apple.com/app/snapcarb/id[APP_ID]',
    // Add more iOS-specific links here
  },
  
  // Google Play Store links (Android)
  android: {
    playStore: 'https://play.google.com/store/apps/details?id=com.snapcarb.app',
    // Add more Android-specific links here
  },
  
  // Web/Universal links
  web: {
    website: 'https://snapcarb.app',
    downloadPage: 'https://snapcarb.app/download',
  },
  
  // Social media links for sharing
  social: {
    instagram: 'https://instagram.com/snapcarb',
    twitter: 'https://twitter.com/snapcarb',
    facebook: 'https://facebook.com/snapcarb',
  },
  
  // Get the appropriate download link based on platform
  getDownloadLink: (platform: 'ios' | 'android' | 'web' = 'web') => {
    switch (platform) {
      case 'ios':
        return appDownloadLinks.ios.appStore;
      case 'android':
        return appDownloadLinks.android.playStore;
      default:
        return appDownloadLinks.web.downloadPage;
    }
  },
  
  // Get a universal download message
  getDownloadMessage: () => {
    return `📱 Download SnapCarb App:
    
🍎 iOS: ${appDownloadLinks.ios.appStore}
🤖 Android: ${appDownloadLinks.android.playStore}
🌐 Web: ${appDownloadLinks.web.downloadPage}

Start your SnapCarb health journey today! 🎯`;
  }
};

export default appDownloadLinks;
