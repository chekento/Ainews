# Android APK Archive

Versioned Android releases are immutable download points. The stable alias [android-latest](https://github.com/chekento/Ainews/releases/tag/android-latest) always points to the newest beta; use the versioned links below for reproducible downloads.

| Version | Downloads | Release | Notes |
|---|---|---|---|
| 3.9.0 Beta | [APK](https://github.com/chekento/Ainews/releases/download/android-v3.9.0/AI-News-Android-3.9.0.apk) · [SHA-256](https://github.com/chekento/Ainews/releases/download/android-v3.9.0/AI-News-Android-3.9.0.apk.sha256) | [Release assets](https://github.com/chekento/Ainews/releases/tag/android-v3.9.0) | Multilingual YouTube AI Video Radar · every scanned story gets video discovery · dynamic full provider registry · official-channel shortcuts · per-story ▶ Video action |
| 3.8.1 Beta | [APK](https://github.com/chekento/Ainews/releases/download/android-v3.8.1/AI-News-Android-3.8.1.apk) · [SHA-256](https://github.com/chekento/Ainews/releases/download/android-v3.8.1/AI-News-Android-3.8.1.apk.sha256) | [Release assets](https://github.com/chekento/Ainews/releases/tag/android-v3.8.1) | Versioned archive entry |
| 3.8.0 Beta | [APK](https://github.com/chekento/Ainews/releases/download/android-v3.8.0/AI-News-Android-3.8.0.apk) · [SHA-256](https://github.com/chekento/Ainews/releases/download/android-v3.8.0/AI-News-Android-3.8.0.apk.sha256) | [Release assets](https://github.com/chekento/Ainews/releases/tag/android-v3.8.0) | Versioned archive entry |
| 3.7.3 Beta | [APK](https://github.com/chekento/Ainews/releases/download/android-v3.7.3/AI-News-Android-3.7.3.apk) · [SHA-256](https://github.com/chekento/Ainews/releases/download/android-v3.7.3/AI-News-Android-3.7.3.apk.sha256) | [Release assets](https://github.com/chekento/Ainews/releases/tag/android-v3.7.3) | Versioned archive entry |
| 3.7.2 Beta | [APK](https://github.com/chekento/Ainews/releases/download/android-v3.7.2/AI-News-Android-3.7.2.apk) · [SHA-256](https://github.com/chekento/Ainews/releases/download/android-v3.7.2/AI-News-Android-3.7.2.apk.sha256) | [Release assets](https://github.com/chekento/Ainews/releases/tag/android-v3.7.2) | Versioned archive entry |
| 3.7.1 Beta | [APK](https://github.com/chekento/Ainews/releases/download/android-v3.7.1/AI-News-Android-3.7.1.apk) · [SHA-256](https://github.com/chekento/Ainews/releases/download/android-v3.7.1/AI-News-Android-3.7.1.apk.sha256) | [Release assets](https://github.com/chekento/Ainews/releases/tag/android-v3.7.1) | Versioned archive entry |
| 3.7.0 Beta | [APK](https://github.com/chekento/Ainews/releases/download/android-v3.7.0/AI-News-Android-3.7.0.apk) · [SHA-256](https://github.com/chekento/Ainews/releases/download/android-v3.7.0/AI-News-Android-3.7.0.apk.sha256) | [Release assets](https://github.com/chekento/Ainews/releases/tag/android-v3.7.0) | Versioned archive entry |
| 3.6.0 Beta | [APK](https://github.com/chekento/Ainews/releases/download/android-v3.6.0/AI-News-Android-3.6.0.apk) · [SHA-256](https://github.com/chekento/Ainews/releases/download/android-v3.6.0/AI-News-Android-3.6.0.apk.sha256) | [Release assets](https://github.com/chekento/Ainews/releases/tag/android-v3.6.0) | Versioned archive entry |
| 3.5.0 Beta | [Current stable alias before 3.6](https://github.com/chekento/Ainews/releases/download/android-latest/AI-News.apk) | [Release archive](https://github.com/chekento/Ainews/releases) | Preserved by the next Android build |


## Changelog

### 3.9.0 Beta — Multilingual Video Radar

- Added a dedicated **Video / YouTube AI News** tab to the Android app.
- Added **multi-language selection**. The Android system language initializes the setting, but users can freely enable multiple languages simultaneously and add additional language codes.
- Added **per-news-story YouTube discovery** using article headline plus detected provider context.
- Removed the temporary story-count cap so the Video Radar can cover **all scanned AI-news items** in the loaded dataset.
- Added **▶ Video** actions to normal news cards.
- Extended video discovery to the **complete provider registry** instead of a fixed provider shortlist.
- Added direct shortcuts to known **official YouTube channels** from the existing social directory.
- Providers without a registered official channel remain discoverable through provider-specific YouTube searches.
- Added topic/provider/source filtering inside the Video Radar.
- Kept the feature **YouTube-API-key-free** by using direct YouTube discovery links rather than requiring the YouTube Data API.
- Updated Android version to **3.9.0** / versionCode **19**.
- Updated CI validation and the stable/versioned APK release pipeline for 3.9.0.

### 3.8.1 Beta — UX / startup repair

- Startup/readability recovery and duplicate-WebView boot protection.
- Dedicated Discover surface and explicit Settings entry.
- Official social-provider directory and source-first topic views.
- Matrix-safe scrolling and expanded theme/UX layer.

### 3.8.0 Beta — Expanded intelligence

- Product & Service Wire.
- Separate Governance & Ethics desk.
- Expanded provider/source registries and Android intelligence controls.
