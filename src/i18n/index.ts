import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Welcome Back": "Welcome Back",
      "AllExpert": "AllExpert",
      "Calculator": "Calculator",
      "Converter": "Converter",
      "Notes": "Notes",
      "Tools": "Tools",
      "Utilities": "Utilities",
      "Recent Activity": "Recent Activity",
      "Today Task": "Today Task",
      "Home": "Home",
      "More": "More",
      "Settings": "Settings",
      "Theme": "Theme",
      "Language": "Language",
      "Developed by Wasin": "Developed by Wasin",
      "Basic": "Basic",
      "Scientific": "Scientific",
      "All Units": "All Units",
      "Length": "Length",
      "Area": "Area",
      "Weight": "Weight",
      "Temperature": "Temperature",
      "Power": "Power",
      "Number System": "Number System",
      "Speed": "Speed",
      "Swap": "Swap",
      "Reset": "Reset",
      "Create Note": "Create Note",
      "Search notes": "Search notes...",
      "Tasbih": "Tasbih",
      "Counter": "Counter",
      "Save Session": "Save Session",
      "QR Generator": "QR Generator",
      "Stopwatch": "Stopwatch",
      "Password Generator": "Password Generator",
      "Mini Converter": "Mini Converter",
      "Generate": "Generate",
      "Download": "Download",
      "Start": "Start",
      "Stop": "Stop",
      "Lap": "Lap",
      "Copy": "Copy",
      "Length: ": "Length: ",
      "Include Numbers": "Include Numbers",
      "Include Symbols": "Include Symbols",
      "Include Uppercase": "Include Uppercase",
    }
  },
  bn: {
    translation: {
      "Welcome Back": "স্বাগতম",
      "AllExpert": "AllExpert",
      "Calculator": "ক্যালকুলেটর",
      "Converter": "কনভার্টার",
      "Notes": "নোটস",
      "Tools": "টুলস",
      "Utilities": "ইউটিলিটিস",
      "Recent Activity": "সাম্প্রতিক কার্যকলাপ",
      "Today Task": "আজকের কাজ",
      "Home": "হোম",
      "More": "আরও",
      "Settings": "সেটিংস",
      "Theme": "থিম",
      "Language": "ভাষা",
      "Developed by Wasin": "Wasin দ্বারা তৈরি",
      "Basic": "সাধারণ",
      "Scientific": "বৈজ্ঞানিক",
      "All Units": "সকল একক",
      "Length": "দৈর্ঘ্য",
      "Area": "ক্ষেত্রফল",
      "Weight": "ওজন",
      "Temperature": "তাপমাত্রা",
      "Power": "ক্ষমতা",
      "Number System": "সংখ্যা পদ্ধতি",
      "Speed": "গতি",
      "Swap": "অদলবদল",
      "Reset": "রিসেট",
      "Create Note": "নোট তৈরি করুন",
      "Search notes": "নোট খুঁজুন...",
      "Tasbih": "তাসবিহ",
      "Counter": "কাউন্টার",
      "Save Session": "সেশন সেভ করুন",
      "QR Generator": "কিউআর জেনারেটর",
      "Stopwatch": "স্টপওয়াচ",
      "Password Generator": "পাসওয়ার্ড জেনারেটর",
      "Mini Converter": "মিনি কনভার্টার",
      "Generate": "তৈরি করুন",
      "Download": "ডাউনলোড",
      "Start": "শুরু",
      "Stop": "থামুন",
      "Lap": "ল্যাপ",
      "Copy": "কপি",
      "Length: ": "দৈর্ঘ্য: ",
      "Include Numbers": "সংখ্যা অন্তর্ভুক্ত করুন",
      "Include Symbols": "প্রতীক অন্তর্ভুক্ত করুন",
      "Include Uppercase": "বড় হাতের অক্ষর অন্তর্ভুক্ত করুন",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
