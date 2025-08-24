# 🚀 SnapCarb Health Companion 2.0

**The Ultimate AI-Powered Health & Nutrition Tracking App**

## 📄 **License**

**SnapCarb © 2025. Licensed under GNU AGPLv3.**

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

**Commercial use without permission is prohibited.** Anyone who uses, modifies, or distributes this code must also make their derivative work open-source under the same license.

For full license details, see [LICENSE](LICENSE) file.

A revolutionary cross-platform mobile app built with React Native and Expo, designed to be your personal health companion for Dr. William Davis's Infinite Health program. Now with cutting-edge AI technology, advanced analytics, and intelligent insights.

## ✨ **What Makes SnapCarb Superior**

### 🤖 **AI-Powered Intelligence**
- **Photo Recognition**: Take a photo of your meal and get instant AI analysis
- **Automatic Carb Calculation**: AI estimates net carbs, fiber, and total carbs
- **Smart Compliance Scoring**: Real-time assessment of meal healthiness
- **Intelligent Recommendations**: Personalized suggestions based on your goals
- **Recipe Generation**: AI creates custom recipes from available ingredients

### 📊 **Advanced Analytics Dashboard**
- **Beautiful Visualizations**: Interactive charts and progress tracking
- **Trend Analysis**: 7-day, 30-day, and 90-day health insights
- **Smart Metrics**: Compliance rates, carb trends, and health scores
- **Predictive Insights**: AI-powered health recommendations
- **Performance Tracking**: Detailed progress monitoring

### 🍽️ **Revolutionary Meal Logging**
- **Photo-First Experience**: Start with a photo, AI does the rest
- **Smart Ingredient Detection**: Automatic identification of disallowed foods
- **Real-Time Compliance**: Instant feedback on health program adherence
- **Comprehensive Tracking**: Net carbs, fiber, protein, and more
- **Meal History**: Beautiful timeline of your health journey

### 📚 **Recipe Database & AI Chef**
- **Curated Collection**: Hundreds of health-compliant recipes
- **AI Recipe Generator**: Create custom meals from your ingredients
- **Smart Filtering**: Find recipes by carbs, time, dietary preferences
- **Nutritional Analysis**: Complete breakdown of every recipe
- **Meal Planning**: Plan your week with intelligent suggestions

### 🎯 **Enhanced Challenge System**
- **10-Day Detox Challenge**: Structured health reset program
- **Progress Tracking**: Visual progress indicators and milestones
- **Symptom Monitoring**: Track how your body responds
- **Motivational Features**: Daily tips and encouragement
- **Community Support**: Connect with others on the same journey

### 💊 **Intelligent Supplement Management**
- **Smart Reminders**: AI-powered timing optimization
- **Blood Level Tracking**: Monitor optimal supplement levels
- **Personalized Dosing**: Recommendations based on your needs
- **Compliance Monitoring**: Track adherence and results
- **Research Integration**: Latest supplement science

### 🌟 **Community & Social Features**
- **Health Community**: Connect with like-minded health enthusiasts
- **Progress Sharing**: Celebrate milestones with your community
- **Expert Insights**: Access to health professionals and researchers
- **Challenges & Competitions**: Friendly health challenges
- **Knowledge Sharing**: Learn from community experiences

## 🛠️ **Technical Excellence**

### **Modern Tech Stack**
- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript for type safety
- **State Management**: React Query + Context API + Zustand
- **Navigation**: Expo Router (file-based routing)
- **UI Components**: Custom design system with health focus
- **Animations**: Smooth, native-feeling interactions

### **Advanced Features**
- **Real-Time Sync**: Cloud-based data synchronization
- **Offline Support**: Full functionality without internet
- **Push Notifications**: Smart health reminders
- **Health Integration**: Apple HealthKit & Google Fit
- **Data Export**: Comprehensive health reports
- **Privacy First**: End-to-end encryption

### **Performance & Reliability**
- **Optimized Images**: Smart compression and caching
- **Lazy Loading**: Efficient data loading
- **Error Handling**: Graceful failure recovery
- **Testing**: Comprehensive test coverage
- **Monitoring**: Real-time performance tracking

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ or Bun
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### **Quick Start**

1. **Clone & Install**
   ```bash
   git clone <your-repo-url>
   cd snapcarb-health-companion
   bun install
   ```

2. **Configure Environment**
   ```bash
   cp config/environment.ts .env
   # Add your Gemini AI API key and other configuration
   ```

3. **Start Development**
   ```bash
   bun start
   ```

4. **Run on Platform**
   ```bash
   # Web
   bun run start-web
   
   # iOS
   i
   
   # Android
   a
   ```

## 🔧 **Configuration**

### **Required API Keys**
- **Gemini AI API Key**: For AI meal analysis and recipe generation
- **Backend API**: For data synchronization and social features
- **Push Notifications**: For health reminders and updates

### **Feature Flags**
- AI Features: Enable/disable AI capabilities
- Social Features: Community and sharing functionality
- Analytics: Advanced health insights and tracking
- Camera: Photo-based meal logging

## 📱 **App Structure**

```
app/
├── (tabs)/           # Main navigation tabs
│   ├── index.tsx     # Enhanced dashboard with AI insights
│   ├── meals.tsx     # AI-powered meal logging
│   ├── supplements.tsx # Smart supplement tracking
│   ├── challenge.tsx # Enhanced challenge system
│   ├── events.tsx    # Health events and community
│   └── analytics.tsx # Advanced analytics dashboard
├── _layout.tsx       # Root layout with navigation
components/           # Reusable UI components
├── AIMealLogger.tsx  # AI photo analysis meal logger
├── AnalyticsDashboard.tsx # Comprehensive analytics
├── RecipeDatabase.tsx # Recipe database with AI
├── ProgressCard.tsx  # Enhanced progress tracking
└── CommunityFeed.tsx # Social health community
services/            # Business logic and AI services
├── ai-service.ts    # Gemini AI integration
├── health-api.ts    # Backend API client
└── notifications.ts # Push notification service
hooks/              # Custom React hooks
├── health-store.tsx # Global health state management
├── use-ai.ts       # AI service integration
└── use-analytics.ts # Analytics and insights
config/             # App configuration
├── environment.ts  # Environment variables
├── constants.ts    # App constants
└── health-data.ts  # Health program data
```

## 🎨 **Design Philosophy**

### **Health-First Design**
- **Green Theme**: Promotes health and wellness
- **Intuitive UI**: Easy navigation for all users
- **Accessibility**: Inclusive design for everyone
- **Dark Mode**: Eye-friendly interface options
- **Responsive**: Works perfectly on all devices

### **User Experience**
- **Photo-First**: Start with what you see
- **Progressive Disclosure**: Show information when needed
- **Smart Defaults**: Intelligent pre-filling of forms
- **Quick Actions**: One-tap common tasks
- **Personalization**: Adapts to your preferences

## 🔒 **Privacy & Security**

- **End-to-End Encryption**: Your health data is secure
- **Local Storage**: Sensitive data stays on your device
- **Anonymous Analytics**: No personal information shared
- **GDPR Compliant**: Full privacy control
- **Regular Audits**: Security best practices

## 🌟 **Why SnapCarb is Superior**

### **vs. Traditional Health Apps**
- **AI Intelligence**: Most apps are just data entry
- **Photo Analysis**: No more manual carb counting
- **Smart Insights**: Actionable health recommendations
- **Community**: Connect with health enthusiasts
- **Research-Based**: Built on proven health science

### **vs. Other AI Health Apps**
- **Specialized Focus**: Built specifically for Infinite Health
- **Comprehensive**: Covers all aspects of health tracking
- **User Experience**: Intuitive, beautiful interface
- **Performance**: Fast, reliable, offline-capable
- **Community**: Active, supportive health community

## 🚀 **Future Roadmap**

### **Phase 2 (Q2 2025)**
- **Voice Commands**: Speak to log meals and get insights
- **AR Meal Analysis**: Augmented reality food identification
- **Wearable Integration**: Apple Watch and Android Wear
- **Advanced AI**: GPT-5 integration for enhanced insights

### **Phase 3 (Q3 2025)**
- **Predictive Health**: AI predicts health outcomes
- **Virtual Health Coach**: Personalized guidance system
- **Advanced Analytics**: Machine learning health patterns
- **Global Community**: International health community

## 🤝 **Contributing**

We welcome contributions from the health and developer communities!

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

## 📄 **License**

Private project - All rights reserved

## 🆘 **Support**

- **Email**: support@snapcarb.com
- **Documentation**: [docs.snapcarb.com](https://docs.snapcarb.com)
- **Community**: [community.snapcarb.com](https://community.snapcarb.com)
- **Issues**: GitHub Issues for technical problems

---

## 🎯 **Health Program Compliance**

SnapCarb is designed to support Dr. William Davis's Infinite Health program:

- **Net Carbs ≤15g per meal** - AI helps you stay compliant
- **Eliminate wheat, grains, and seed oils** - Smart detection and warnings
- **Focus on whole foods** - Recipe suggestions and meal planning
- **Proper supplementation** - Optimized supplement tracking
- **Microbiome health** - Comprehensive health monitoring

---

*Built with ❤️ for optimal health and wellness*

**SnapCarb Health Companion 2.0** - *The future of health tracking is here*