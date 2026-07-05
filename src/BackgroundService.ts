/**
 * BackgroundService.ts
 * 
 * ئەڤ پشکا کۆدی هۆکارەکە بۆ کارپێکرن و دەستپێکرنا مایک ل پشتا شاشێ (Background) 
 * د گەڵ گرێدانا وێ ب ئەپلیکەیشنێ Native ب رێکا Capacitor.
 */

export const startVoiceService = () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        console.log("راوێژکار: مایک یێ ئاکتیف بوو ل پشتا شاشێ و سیگنال گەهشت.");
        
        // ل ڤێرێ، تو دشێی 'stream'ـێ بنێری بۆ مۆدێلێ Gemini API یان Web Speech API 
        // بۆ نموونە بۆ شیکارکرنا دەنگێ شۆفێری بۆ گەشتێن ژینگەهپارێز.
      })
      .catch((err) => {
        console.error("راوێژکار: کێشەیەک د ئاکتیفکرنا مایکێ دا هەیە:", err);
      });
  } else {
    console.warn("راوێژکار: ئامرازێ دەنگی (getUserMedia) ل سەر ڤێ وێب-گەڕۆکێ کار ناکەت.");
  }
};

/**
 * ئەڤ فۆنکشنە مایکێ رادگرێ داکو وزەیا پاترییا ترۆمبێلا کارەبایی تێک نەچیت
 */
export const stopVoiceService = (stream: MediaStream | null) => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    console.log("راوێژکار: تۆمارکرنا دەنگی هاتە راوەستاندن بۆ پاراستنا هێزێ.");
  }
};
