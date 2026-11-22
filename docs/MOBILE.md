# Android roadmap
Use the same React + Vite app for web and Android via Capacitor 8 (inspired by POMAK's architecture, not a copy of its UI).

Local debug build: Node.js 22, Java JDK 21, Android SDK.
1. `cd frontend && npm install && npm run build`
2. `npx cap add android && npx cap sync android`
3. `cd android && ./gradlew assembleDebug`

The generated debug APK is `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.
GitHub Actions > Android debug APK > Run workflow can automate this once CI runs successfully. Play Store release signing requires separate keys and testing.
