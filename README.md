# SnapCarb Health Companion

A cross-platform mobile app built with React Native and Expo for Dr. William Davis's Infinite Health program.

## Features

### 🍽️ Meal Logging
- AI-powered net carb calculation (≤15g per meal)
- Automatic flagging of disallowed foods (wheat, grains, seed oils)
- Photo capture and meal tracking
- Real-time carb monitoring

### 💊 Supplement Tracking
- Track daily supplements (Magnesium 400mg, Vitamin D3 4000 IU, etc.)
- Progress monitoring and reminders
- Customizable supplement schedules

### 🎯 10-Day Detox Challenge
- August 13-22, 2025 challenge period
- Daily check-ins for meals and symptoms
- Progress tracking and motivation
- Symptom monitoring

### 📅 Health Events Calendar
- Upcoming health talks and webinars
- Event reminders and notifications
- Community health events

## Tech Stack

- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Query + Context API
- **Storage**: AsyncStorage for persistence
- **UI**: Custom components with health-focused green theme
- **Icons**: Lucide React Native
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites
- Node.js 18+
- Bun (package manager)
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd snapcarb-health-companion
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun start
```

4. Run on specific platforms:
```bash
# Web
bun run start-web

# iOS (requires Xcode)
i

# Android (requires Android Studio)
a
```

### Development

- Scan the QR code with Expo Go app on your mobile device
- Or run in web browser for quick testing
- Hot reload enabled for fast development

## Project Structure

```
app/
├── (tabs)/           # Tab-based navigation
│   ├── index.tsx     # Home/Dashboard
│   ├── meals.tsx     # Meal logging
│   ├── supplements.tsx # Supplement tracking
│   ├── challenge.tsx # 10-day challenge
│   └── events.tsx    # Health events
├── _layout.tsx       # Root layout
components/           # Reusable UI components
constants/           # App constants and data
hooks/              # Custom React hooks
types/              # TypeScript type definitions
assets/             # Images and static assets
```

## Key Components

- **ProgressCard**: Reusable progress tracking component
- **Health Store**: Global state management for health data
- **AI Integration**: Meal analysis and carb calculation
- **Challenge System**: 10-day detox tracking

## Health Program Compliance

This app follows Dr. William Davis's Infinite Health guidelines:
- Net carbs ≤15g per meal
- Elimination of wheat, grains, and seed oils
- Focus on whole foods and proper supplementation
- Microbiome health optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Private project - All rights reserved

## Support

For questions about the Infinite Health program, consult Dr. William Davis's official resources.

---

*Built with ❤️ for optimal health and wellness*