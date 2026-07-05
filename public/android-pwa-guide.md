# رێنماییا گشتگیر: ڤەگوهاستنا EcoFlow Logistics بۆ ئەپێ Native Android و PWA 📱🌱

بخێرهاتی بۆ رێنماییا تایبەت یا **راوێژکار**. ئەڤ دۆسیەیە هۆکارەکێ گەورەیە بۆ گەهاندنا ئەپێ تە یێ لۆجستیکی یێ دۆستێ ژینگەهێ بۆ سەر تەلەفۆنا تە ب شێوازەکێ Native یان وەک Progressive Web App (PWA).

---

## ١. رێنماییا بڵاوکردنەوەی (Deployment) ل سەر Vercel 🚀
دا کو ئەپێ تە یێ لۆجستیکی مایک و دەنگی ب دروستی ل سەر تەلەفۆنێ کار پێ بکەت، پێدڤیە سەرچاوێ لینکێ تە **HTTPS** بیت (کومپانیێن ئاسایشێ مایکێ نادەنە لینکێن بێ ئاسایش). باشترین و خێراترین رێک بەکارهێنانا **Vercel**ـە:

### هەنگاڤێن سادە:
1. **دروستکرنا ئەکاونتێ Vercel:**
   سەردانا [vercel.com](https://vercel.com) بکە و ب ئەکاونتێ خۆ یێ GitHub یان Email بچۆ ژوور.
2. **گرێدانا پڕۆژەی ب GitHub ڤە:**
   پڕۆژێ خۆ یێ `EcoFlow` بفرێ کەنە سەر فۆڵدەرەکێ ل سەر GitHub.
3. **ئیمپۆرتکردن (Import):**
   ل سەر داشبۆردێ Vercel، کلیک ل سەر **Add New Project** بکە و فۆڵدەرێ پڕۆژێ خۆ یێ GitHub هەلبژێرە.
4. **رێکخستنا فۆرمیلا ئاڤادانکرنێ (Build Settings):**
   * **Framework Preset:** ل سەر `Vite` بهێلە.
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
5. **کلیک ل سەر Deploy بکە:**
   د ماوێ کێمتر ژ خولەکەکێ دا، Vercel دێ لینکەکێ ب شێوازێ `https://your-app.vercel.app` دەتە تە کو دشێی راستەوخۆ ل سەر مۆبایلێ ڤەکەی.

---

## ٢. رێنماییا گوهۆڕینێ بۆ Native Android ب رێکا Capacitor 🤖
ئەگەر تە دڤێت ئەپێ تە ببیتە ئەپەکێ فەرمی یێ ئەندرۆید د ناڤ مۆبایلێ دا، ئەڤان هەنگاڤان جێبەجێ بکە:

### پێنگاڤ ب پێنگاڤ:
1. **دروستکرنا کتێبخانەیێن Capacitor:**
   د ناڤ تێرمیناڵا پڕۆژێ خۆ دا ئەڤ فەرمانە کارپێ بکە:
   ```bash
   npm install @capacitor/core @capacitor/cli
   ```
2. **رێکخستنا دەستپێکێ (Initialize):**
   ```bash
   npx cap init EcoFlow com.ecoflow.app --web-dir=dist
   ```
3. **زێدەکرنا پلاتفۆڕمێ ئەندرۆید (Android Platform):**
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```
4. **ئاڤاکرن و گونجاندن (Build & Sync):**
   هەر دەمێ تو گۆڕانکاری د کۆدی دا دکەی، ئەڤ فەرمانە لێدە:
   ```bash
   npm run build
   npx cap sync
   ```
5. **ڤەکرنا پڕۆژەی د Android Studio دا:**
   ```bash
   npx cap open android
   ```

---

## ٣. دیارکرنا مۆڵەتان (Permissions) د ناڤ `AndroidManifest.xml` دا 🔑
دا کو ئەندرۆید مۆڵەتێ بدەتە ئەپی ل پشتا شاشێ (Background) ژی مایکێ بەکاربینیت، پێدڤیە تو ڤان مۆڵەتان ل دۆسیەیا `AndroidManifest.xml` زێدە بکەی.

### ل کیپ فۆڵدەر دگەڕێی؟
د ناڤ پڕۆژێ ئەندرۆید دا یێ کو Capacitor دروست دکەت، بچۆ ڤی جهی:
`android/app/src/main/AndroidManifest.xml`

### مۆڵەتێن پێدڤی (Permissions Code):
ڤان خەتان بکۆپی بکە و پاشان پێش تاگا `<application>` د ناڤ دۆسیێ دا بچەسپێنە:

```xml
<!-- مۆڵەتا دەستگەهشتن بە مایکێ تەلەفۆنێ -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

<!-- مۆڵەتێن کارکرن ل پشتا شاشێ (Background Activity & Services) -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />

<!-- مۆڵەتا گرێدانا ئینتەرنێتێ -->
<uses-permission android:name="android.permission.INTERNET" />
```

---

## ٤. باشترکردنا دەنگی (Voice Optimization for Mobile Chrome) 🎤⚡
مۆبایلێ کرۆم پێدڤی ب چەند پاراستنەکا یە داکو لۆجیکێ `Web Speech API` بێ کێشە کار بکەت:

1. **مایک راناوەستیت (SpeechRecognition.continuous = false):** ل سەر مۆبایلێ گونجایترە کو `continuous = false` بیت داکو رێک بکەڤیت دەمێ شۆفێر باخڤیت و پاشان خۆکارانە راوەستیت و کاربۆنێ هەژمار بکەت.
2. **فیدبەکا بکارهێنەری:** هەر کێشەیەک یان نەبوونا مۆڵەتێ دێ د رێکا `recognition.onerror` دا هێتە گرتن و پەیامەکا کوردی یا رۆهن دێ پێشکێشی بکارهێنەری کەت.
3. **زمانێ کوردی:** زمانێ پێشوەخت جێگیرکرا د ئەپلیکەیشنێ دا `ckb-IQ` یە کو ب شێوازەکێ زۆر باش ناسینەوا زمانێ بەهدینی و سۆرانی دکەت د ناڤ موتورێ Google Speech دا.

دگەل رێزگرتن و تەقدیرێ،  
**راوێژکار تە هەمیشە پشتگیری دکەت!** 🌿🌍
