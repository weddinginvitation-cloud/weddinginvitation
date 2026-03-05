
import { useEffect, useMemo, useRef, useState } from "react";

const weddingDate = new Date("2026-04-26T19:00:00+05:30");
const mapsEmbedUrl =
  import.meta.env.VITE_GOOGLE_MAPS_EMBED_URL ||
  `https://www.google.com/maps?q=${encodeURIComponent(
    "mudhubani hotel, Madhubani, Bihar"
  )}&output=embed`;
const shehnaiSrc =
  import.meta.env.VITE_SHEHNAI_AUDIO_URL ||
  `${import.meta.env.BASE_URL}music/Sehnai_Dhun_Mangal_Dhun_Music_Mithila_Ke_Lok_Baja_Rasan_Chauki_256kbps.webm`;
const invitationPdfRaw =
  import.meta.env.VITE_INVITATION_PDF_URL || "invitation.pdf";
const invitationPdf = /^https?:\/\//i.test(invitationPdfRaw)
  ? invitationPdfRaw
  : `${import.meta.env.BASE_URL}${invitationPdfRaw.replace(/^\/+/, "")}`;
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "+91 6207398499";
const confirmRsvpWhatsapp = "916207398499";
const wishesWhatsappNumber =
  import.meta.env.VITE_WISHES_WHATSAPP_NUMBER || "+91 7992371912";
const updatesFeedUrl = `${import.meta.env.BASE_URL}update-feed.json`;
const weddingMapLink = "https://maps.google.com/?q=Madhubani%20Bihar";
const shagunMapLink = "https://maps.google.com/?q=Putai%20Bihar";
const galleryFolderLinks = {
  grandEntry: "https://drive.google.com/drive/folders/19TjjIsKZkT5rnssreugnOnBPnM8pQJhI",
  varmalaStage: "https://drive.google.com/drive/folders/1XloyehtZBt9o6tDYJoJeC4ARkYxEzZVS",
  kohbarArt: "https://drive.google.com/drive/folders/1AuWQAUi1pU6luE_UzQQzg-xc1iN6hZmz",
  sacredMandap: "https://drive.google.com/drive/folders/1RC3PxDFvFDu-aIx6DAeKacUZFaz9m232",
  familyBlessings: "https://drive.google.com/drive/folders/1DdWNcNfn3XPWtQsNoPo6JWWbuukzBrrr",
};
const galleryUploadBaseUrl = import.meta.env.VITE_GALLERY_UPLOAD_URL || "";
const whatsappNumberLink = whatsappNumber.replace(/\D/g, "");
const wishesWhatsappNumberLink = wishesWhatsappNumber.replace(/\D/g, "");
const updatesPrefStorageKey = "ss-updates-pref";
const updatesSeenVersionStorageKey = "ss-updates-seen-version";

const localeByLanguage = {
  en: "en-US",
  hi: "hi-IN",
  mai: "hi-IN",
};

const urlRegex = /(https?:\/\/[^\s]+)/gi;

function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

function shouldNotifyForTopics(headline, details, topics) {
  const selected = Array.isArray(topics) ? topics : [];
  if (!selected.length) return true;

  const text = `${headline || ""} ${details || ""}`.toLowerCase();
  const venueHit = /venue|location|स्थल|स्थान|ठाम/.test(text);
  const timingHit = /time|timing|schedule|समय|तिथि|दिनांक/.test(text);
  const functionHit = /function|ritual|event|baraat|shagun|विधि|कार्यक्रम|समारोह|बियाह/.test(text);

  if (selected.includes("venue") && venueHit) return true;
  if (selected.includes("timing") && timingHit) return true;
  if (selected.includes("general") && functionHit) return true;
  if (selected.includes("general")) return true;
  return false;
}

const translations = {
  en: {
    brand: "Our Wedding Journal",
    language: "Lang",
    languageHindi: "Hindi",
    languageMaithili: "Maithili",
    languageEnglish: "English",
    darkMode: "Dark",
    lightMode: "Light",
    playMusic: "Play",
    muteMusic: "Mute",
    musicToggleTitle: "Toggle shehnai music",
    musicMissingTitle: "Set VITE_SHEHNAI_AUDIO_URL to enable music",
    together: "Together with their families",
    couple: "Saurabh & Soni",
    dateLine: "Sunday, April 26, 2026 | Madhubani, Bihar",
    days: "days",
    hours: "hours",
    minutes: "minutes",
    seconds: "seconds",
    acceptNow: "Accept Now",
    addToCalendar: "Add to Calendar",
    calendarEvent: "Wedding of Saurabh & Soni",
    calendarDetails:
      "With blessings of both families, join us for a Mithilanchal wedding celebration.",
    calendarLocation: "Madhubani, Bihar, India",
    storyTitle: "Our Story",
    storySubtitle: "A timeline of moments that led us to forever.",
    timeline: [
      {
        title: "First Glance",
        date: "April 24, 2026",
        text: "Our first glance in Putai, Darbhanga turned into the beginning of a lifelong poem.",
      },
      {
        title: "Families United",
        date: "April 24, 2026",
        text: "In the warmth of elders' blessings, two families found one shared rhythm.",
      },
      {
        title: "The Wedding",
        date: "April 26, 2026",
        text: "Witness the Saptapadi as we unite through our ancient Vedic rituals. A traditional Maithil Vivah celebrated with the grace of the seven vows. We seek your presence and blessings on this auspicious day.",
      },
    ],
    shagunTitle: "Shagun Ceremony",
    dateLabel: "Date",
    timeLabel: "Time",
    venueLabel: "Venue",
    dressCodeLabel: "Dress Code",
    shagunDate: "April 24, 2026",
    shagunTime: "6:30 PM onwards",
    shagunVenue: "Putai, Bihar",
    shagunDress: "to be updated",
    shagunDescription:
      "In Mithilanchal tradition, Shagun marks the graceful beginning of sacred wedding rites, where blessings, gifts, and goodwill flow between families.",
    baraatTitle: "Baraat Experience",
    departureTitle: "Departure Time",
    departureValue: "5:00 PM from Putai",
    routeTitle: "Route Preview",
    routeValue: "Putai -> Madhubani Town -> Wedding Venue",
    contactTitle: "Contact Person",
    contactValue: "to be updated",
    venueTitle: "Grand Venue",
    venueName: "to be updated",
    venueAddress: "Madhubani, Bihar 847211",
    openMaps: "Open in Google Maps",
    nearestRailway: "Nearest Railway Station: Darbhanga Junction (5.8 km)",
    nearestAirport: "Nearest Airport: Darbhanga Airport (8.1 km)",
    landmark: "Landmark: to be updated",
    mapTitle: "Wedding venue map",
    weatherTitle: "Live Weather & AQI",
    weatherSubtitle: "Auto-updated for Madhubani",
    loadingWeather: "Loading weather details...",
    weatherUnavailable: "Live weather is currently unavailable.",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    countdownTitle: "Countdown to the Grand Celebration",
    celebrationArrived: "The sacred hour has arrived. Welcome to the wedding celebration.",
    traditionsTitle: "Mithilanchal Wedding Traditions",
    traditions: [
      {
        icon: "01",
        name: "Madhuparka",
        text: "A ritual of sacred hospitality where the groom is welcomed with reverence, sweetness, and divine blessing.",
      },
      {
        icon: "02",
        name: "Kanyadaan",
        text: "The bride's parents offer their daughter with prayerful hearts, marking a deeply emotional and spiritual moment.",
      },
      {
        icon: "03",
        name: "Panigrahan",
        text: "The sacred holding of hands, symbolizing mutual trust, responsibility, and companionship for life.",
      },
      {
        icon: "04",
        name: "Sindoor Daan",
        text: "The groom adorns the bride with sindoor, honoring marital vows in the presence of family and fire.",
      },
      {
        icon: "05",
        name: "Kohbar Ritual",
        text: "In the Kohbar chamber, symbolic Mithila motifs celebrate fertility, harmony, and auspicious beginnings.",
      },
      {
        icon: "06",
        name: "Maithil Geet",
        text: "Traditional songs echo blessings, humor, and ancestral wisdom across every ritual moment.",
      },
    ],
    galleryTitle: "Wedding Gallery",
    clickToOpen: "Click to open",
    gallery: [
      { key: "grandEntry", title: "Grand Entry", color: "from-maroon to-gold" },
      { key: "varmalaStage", title: "Varmala Stage", color: "from-emerald to-gold" },
      { key: "kohbarArt", title: "Kohbar Art", color: "from-lotus to-maroon" },
      { key: "sacredMandap", title: "Sacred Mandap", color: "from-gold to-cream" },
      { key: "familyBlessings", title: "Family Blessings", color: "from-emerald to-mustard" },
    ],
    rsvpTitle: "Confirmation and Blessings",
    fullName: "Full Name",
    phone: "Phone Number",
    guests: "Number of Guests",
    ceremony: "Ceremony",
    shagunCeremony: "Shagun Ceremony",
    weddingNight: "Wedding Night",
    bothCeremonies: "Both Ceremonies",
    confirmNow: "Confirm Now",
    whatsappConfirm: "WhatsApp Confirm",
    rsvpThanks: "Thank you. Your response has been recorded.",
    downloadPdf: "Download Invitation PDF",
    enablePdf: "Set VITE_INVITATION_PDF_URL to enable PDF download.",
    viewAlbum: "View Album",
    uploadPhoto: "Upload Photo",
    messageWall: "Guest Message Wall",
    blessingPlaceholder: "Share your blessing...",
    postMessage: "Post Message",
    firstBlessing: "Be the first to bless the couple.",
    guestBlessingPrefix: "Guest Blessing",
    confirmMessagePrefix: "Graciously Confirm",
    confirmMessageBody: "I would like to confirm my presence for your wedding celebration.",
    languageNote: "Language",
    ceremonyNote: "Ceremonies",
    notSelected: "Not selected",
    close: "Close",
    aqiGood: "Good",
    aqiModerate: "Moderate",
    aqiUnhealthy: "Unhealthy",
    aqiVeryUnhealthy: "Very Unhealthy",
    aqiHazardous: "Hazardous",
    weatherClearSky: "Clear Sky",
    weatherPartlyCloudy: "Partly Cloudy",
    weatherCloudy: "Cloudy",
    weatherFog: "Fog",
    weatherDrizzle: "Drizzle",
    weatherRain: "Rain",
    weatherSnow: "Snow",
    weatherRainShowers: "Rain Showers",
    weatherThunderstorm: "Thunderstorm",
    weatherUpdate: "Weather Update",
    quickNav: "Quick Jump",
    moreInfo: "More Information",
    backHome: "Back to Home",
    navHome: "Home",
    navStory: "Story",
    navShagun: "Shagun",
    navBaraat: "Baraat",
    navVenue: "Venue",
    navWeather: "Weather",
    navCountdown: "Countdown",
    navTraditions: "Traditions",
    navGallery: "Gallery",
    navConfirmation: "Confirmation",
    updatesTitle: "Event Update Concierge",
    updatesSubtitle: "Get instant alerts for venue, timings, and important details.",
    updatesPhoneLabel: "Contact Number",
    updatesTopicsLabel: "What to notify",
    updatesTopicVenue: "Venue updates",
    updatesTopicTiming: "Timing updates",
    updatesTopicGeneral: "General announcements",
    updatesChannelLabel: "Delivery channels",
    updatesChannelBrowser: "Browser notification",
    updatesChannelWhatsapp: "WhatsApp update",
    updatesEnableBrowser: "Enable Browser Alerts",
    updatesSave: "Save Preferences",
    updatesWhatsappCTA: "Subscribe on WhatsApp",
    updatesLatestLabel: "Latest update",
    updatesNoFeed: "No update feed published yet.",
    updatesBrowserGranted: "Browser alerts enabled.",
    updatesBrowserDenied: "Browser notification permission was blocked.",
    updatesBrowserUnsupported: "This browser does not support notifications.",
    updatesSaved: "Update preferences saved.",
    updatesWhatsappSent: "WhatsApp subscription draft opened.",
    updatesFreshNotice: "A new wedding detail has been published.",
    updatesBrowserTitle: "Wedding details updated",
    updatesBrowserFallback: "New details are available on the invitation page.",
  },
  hi: {
    brand: "हमारी विवाह डायरी",
    language: "भाषा",
    languageHindi: "हिंदी",
    languageMaithili: "मैथिली",
    languageEnglish: "अंग्रेज़ी",
    darkMode: "डार्क मोड",
    lightMode: "लाइट मोड",
    playMusic: "संगीत चलाएं",
    muteMusic: "संगीत बंद करें",
    musicToggleTitle: "शहनाई संगीत चालू/बंद करें",
    musicMissingTitle: "संगीत के लिए VITE_SHEHNAI_AUDIO_URL सेट करें",
    together: "दोनों परिवारों के साथ",
    couple: "सौरभ और सोनी",
    dateLine: "रविवार, 26 अप्रैल 2026 | मधुबनी, बिहार",
    days: "दिन",
    hours: "घंटे",
    minutes: "मिनट",
    seconds: "सेकंड",
    acceptNow: "अभी स्वीकार करें",
    addToCalendar: "कैलेंडर में जोड़ें",
    calendarEvent: "सौरभ और सोनी का विवाह",
    calendarDetails:
      "दोनों परिवारों के आशीर्वाद के साथ, मिथिलांचल विवाह समारोह में आपका स्वागत है।",
    calendarLocation: "मधुबनी, बिहार, भारत",
    storyTitle: "हमारी कहानी",
    storySubtitle: "वे खूबसूरत पल जिन्होंने हमें हमेशा के लिए जोड़ा।",
    timeline: [
      {
        title: "पहली मुलाकात",
        date: "24 अप्रैल 2026",
        text: "पुतई, दरभंगा में पहली झलक ने जीवनभर के साथ की शुरुआत कर दी।",
      },
      {
        title: "परिवारों का मिलन",
        date: "24 अप्रैल 2026",
        text: "बड़ों के आशीर्वाद में दो परिवार एक ही सुर में बंध गए।",
      },
      {
        title: "विवाह",
        date: "26 अप्रैल 2026",
        text: "सप्तपदी के पावन क्षण के साक्षी बनें, जब हम प्राचीन वैदिक विधियों से एक हो रहे हैं। सात वचनों की गरिमा के साथ पारंपरिक मैथिल विवाह का उत्सव है। इस शुभ दिन पर आपके आगमन और आशीर्वाद की कामना है।",
      },
    ],
    shagunTitle: "शगुन समारोह",
    dateLabel: "तिथि",
    timeLabel: "समय",
    venueLabel: "स्थान",
    dressCodeLabel: "वेशभूषा",
    shagunDate: "24 अप्रैल 2026",
    shagunTime: "शाम 6:30 बजे से",
    shagunVenue: "पुतई, बिहार",
    shagunDress: "अपडेट होना बाकी",
    shagunDescription:
      "मिथिलांचल परंपरा में शगुन, विवाह संस्कारों की शुभ शुरुआत है, जहां आशीर्वाद, उपहार और अपनापन दोनों परिवारों में बहता है।",
    baraatTitle: "बारात अनुभव",
    departureTitle: "प्रस्थान समय",
    departureValue: "शाम 5:00 बजे, पुतई से",
    routeTitle: "मार्ग विवरण",
    routeValue: "पुतई -> मधुबनी टाउन -> विवाह स्थल",
    contactTitle: "संपर्क व्यक्ति",
    contactValue: "to be updated",
    venueTitle: "भव्य स्थल",
    venueName: "अपडेट होना बाकी",
    venueAddress: "मधुबनी, बिहार 847211",
    openMaps: "Google Maps में खोलें",
    nearestRailway: "निकटतम रेलवे स्टेशन: दरभंगा जंक्शन (5.8 किमी)",
    nearestAirport: "निकटतम हवाई अड्डा: दरभंगा एयरपोर्ट (8.1 किमी)",
    landmark: "लैंडमार्क: अपडेट होना बाकी",
    mapTitle: "विवाह स्थल का मानचित्र",
    weatherTitle: "लाइव मौसम और AQI",
    weatherSubtitle: "मधुबनी के लिए स्वतः अपडेट",
    loadingWeather: "मौसम विवरण लोड हो रहा है...",
    weatherUnavailable: "लाइव मौसम अभी उपलब्ध नहीं है।",
    humidity: "आर्द्रता",
    windSpeed: "हवा की रफ्तार",
    countdownTitle: "भव्य उत्सव की उलटी गिनती",
    celebrationArrived: "शुभ घड़ी आ गई है। विवाह उत्सव में आपका स्वागत है।",
    traditionsTitle: "मिथिलांचल विवाह परंपराएं",
    traditions: [
      {
        icon: "01",
        name: "मधुपर्क",
        text: "यह सत्कार की पवित्र रस्म है जिसमें वर का आदर, मिठास और मंगल आशीष के साथ स्वागत होता है।",
      },
      {
        icon: "02",
        name: "कन्यादान",
        text: "कन्या के माता-पिता प्रार्थना और भावनाओं के साथ अपनी पुत्री का दान करते हैं।",
      },
      {
        icon: "03",
        name: "पाणिग्रहण",
        text: "हाथ थामने की यह पवित्र रस्म जीवनभर के विश्वास, जिम्मेदारी और साथ का प्रतीक है।",
      },
      {
        icon: "04",
        name: "सिंदूर दान",
        text: "अग्नि और परिवार की उपस्थिति में वर वधू को सिंदूर अर्पित कर वैवाहिक वचन निभाता है।",
      },
      {
        icon: "05",
        name: "कोहबर रस्म",
        text: "कोहबर कक्ष में मिथिला चित्रांकन उर्वरता, सामंजस्य और शुभारंभ का प्रतीक है।",
      },
      {
        icon: "06",
        name: "मैथिल गीत",
        text: "पारंपरिक गीत हर रस्म में आशीर्वाद, हास्य और पूर्वजों की सीख को जीवंत करते हैं।",
      },
    ],
    galleryTitle: "विवाह गैलरी",
    clickToOpen: "खोलने के लिए क्लिक करें",
    gallery: [
      { key: "grandEntry", title: "भव्य प्रवेश", color: "from-maroon to-gold" },
      { key: "varmalaStage", title: "वरमाला मंच", color: "from-emerald to-gold" },
      { key: "kohbarArt", title: "कोहबर कला", color: "from-lotus to-maroon" },
      { key: "sacredMandap", title: "पवित्र मंडप", color: "from-gold to-cream" },
      { key: "familyBlessings", title: "परिवार का आशीर्वाद", color: "from-emerald to-mustard" },
    ],
    rsvpTitle: "पुष्टि और आशीर्वाद",
    fullName: "पूरा नाम",
    phone: "फोन नंबर",
    guests: "मेहमानों की संख्या",
    ceremony: "समारोह",
    shagunCeremony: "शगुन समारोह",
    weddingNight: "विवाह रात्रि",
    bothCeremonies: "दोनों समारोह",
    confirmNow: "अभी पुष्टि करें",
    whatsappConfirm: "व्हाट्सऐप पुष्टि",
    rsvpThanks: "धन्यवाद। आपका जवाब दर्ज कर लिया गया है।",
    downloadPdf: "निमंत्रण PDF डाउनलोड करें",
    enablePdf: "PDF डाउनलोड के लिए VITE_INVITATION_PDF_URL सेट करें।",
    viewAlbum: "एल्बम देखें",
    uploadPhoto: "फोटो अपलोड करें",
    messageWall: "अतिथि संदेश दीवार",
    blessingPlaceholder: "अपना आशीर्वाद लिखें...",
    postMessage: "संदेश भेजें",
    firstBlessing: "सबसे पहले आशीर्वाद दें।",
    guestBlessingPrefix: "अतिथि आशीर्वाद",
    confirmMessagePrefix: "कृपया पुष्टि",
    confirmMessageBody: "मैं आपके विवाह समारोह में अपनी उपस्थिति की पुष्टि करता/करती हूँ।",
    languageNote: "भाषा",
    ceremonyNote: "समारोह",
    notSelected: "चयन नहीं",
    close: "बंद करें",
    aqiGood: "अच्छा",
    aqiModerate: "मध्यम",
    aqiUnhealthy: "हानिकारक",
    aqiVeryUnhealthy: "अत्यंत हानिकारक",
    aqiHazardous: "खतरनाक",
    weatherClearSky: "साफ आसमान",
    weatherPartlyCloudy: "आंशिक बादल",
    weatherCloudy: "बादल छाए",
    weatherFog: "कोहरा",
    weatherDrizzle: "फुहार",
    weatherRain: "बारिश",
    weatherSnow: "बर्फबारी",
    weatherRainShowers: "बारिश की बौछार",
    weatherThunderstorm: "गरज के साथ बारिश",
    weatherUpdate: "मौसम अपडेट",
    quickNav: "त्वरित नेविगेशन",
    moreInfo: "अधिक जानकारी",
    backHome: "होम पर जाएँ",
    navHome: "होम",
    navStory: "कहानी",
    navShagun: "शगुन",
    navBaraat: "बारात",
    navVenue: "स्थल",
    navWeather: "मौसम",
    navCountdown: "काउंटडाउन",
    navTraditions: "परंपराएं",
    navGallery: "गैलरी",
    navConfirmation: "पुष्टि",
    updatesTitle: "इवेंट अपडेट कंसीयर्ज",
    updatesSubtitle: "स्थान, समय और जरूरी जानकारी के तुरंत अपडेट पाएँ।",
    updatesPhoneLabel: "संपर्क नंबर",
    updatesTopicsLabel: "किस बारे में अपडेट चाहिए",
    updatesTopicVenue: "स्थान अपडेट",
    updatesTopicTiming: "समय अपडेट",
    updatesTopicGeneral: "सामान्य घोषणाएँ",
    updatesChannelLabel: "डिलीवरी चैनल",
    updatesChannelBrowser: "ब्राउज़र नोटिफिकेशन",
    updatesChannelWhatsapp: "व्हाट्सऐप अपडेट",
    updatesEnableBrowser: "ब्राउज़र अलर्ट चालू करें",
    updatesSave: "पसंद सेव करें",
    updatesWhatsappCTA: "व्हाट्सऐप पर सब्सक्राइब करें",
    updatesLatestLabel: "नवीनतम अपडेट",
    updatesNoFeed: "अभी कोई अपडेट फीड प्रकाशित नहीं है।",
    updatesBrowserGranted: "ब्राउज़र अलर्ट चालू हो गया।",
    updatesBrowserDenied: "ब्राउज़र नोटिफिकेशन अनुमति नहीं मिली।",
    updatesBrowserUnsupported: "यह ब्राउज़र नोटिफिकेशन सपोर्ट नहीं करता।",
    updatesSaved: "अपडेट पसंद सेव हो गई।",
    updatesWhatsappSent: "व्हाट्सऐप सदस्यता ड्राफ्ट खोल दिया गया।",
    updatesFreshNotice: "विवाह से जुड़ी नई जानकारी अपडेट हुई है।",
    updatesBrowserTitle: "विवाह जानकारी अपडेट",
    updatesBrowserFallback: "नए अपडेट देखने के लिए पेज खोलें।",
  },
  mai: {
    brand: "हमर बियाह डायरी",
    language: "भाषा",
    languageHindi: "हिंदी",
    languageMaithili: "मैथिली",
    languageEnglish: "अंग्रेजी",
    darkMode: "डार्क मोड",
    lightMode: "लाइट मोड",
    playMusic: "संगीत चलाउ",
    muteMusic: "संगीत बन्न करू",
    musicToggleTitle: "शहनाई संगीत चालू/बन्न करू",
    musicMissingTitle: "संगीत लेल VITE_SHEHNAI_AUDIO_URL सेट करू",
    together: "दूनू परिवारक संग",
    couple: "सौरभ आ सोनी",
    dateLine: "रवि, 26 अप्रैल 2026 | मधुबनी, बिहार",
    days: "दिन",
    hours: "घंटा",
    minutes: "मिनट",
    seconds: "सेकंड",
    acceptNow: "एखन स्वीकार करू",
    addToCalendar: "कैलेंडर मे जोड़ू",
    calendarEvent: "सौरभ आ सोनीक बियाह",
    calendarDetails:
      "दूनू परिवारक आशीर्वाद संग मिथिलांचल बियाह उत्सव मे अपनेक स्वागत अछि।",
    calendarLocation: "मधुबनी, बिहार, भारत",
    storyTitle: "हमर कहानी",
    storySubtitle: "ओ सब पल जाहि सँ हमसभ सदा लेल एक भ' गेलहुँ।",
    timeline: [
      {
        title: "पहिल झलक",
        date: "24 अप्रैल 2026",
        text: "पुतई, दरभंगा मे पहिल झलक जीवन भरिक साथक शुरुआत बनि गेल।",
      },
      {
        title: "परिवारक मिलन",
        date: "24 अप्रैल 2026",
        text: "बड़-बुजुर्गक आशीर्वाद मे दूनू परिवार एके सुर मे बान्हल गेल।",
      },
      {
        title: "बियाह",
        date: "26 अप्रैल 2026",
        text: "सप्तपदीक पावन क्षणक साक्षी बनू, जत' हम प्राचीन वैदिक विधिसँ एक भ' रहल छी। सात वचनक गरिमा संग ई पारंपरिक मैथिल बियाहक उत्सव अछि। एहि शुभ दिन पर अहाँक आगमन आ आशीर्वादक कामना अछि।",
      },
    ],
    shagunTitle: "शगुन समारोह",
    dateLabel: "तिथि",
    timeLabel: "समय",
    venueLabel: "स्थान",
    dressCodeLabel: "पोशाक",
    shagunDate: "24 अप्रैल 2026",
    shagunTime: "साँझ 6:30 बजे सँ",
    shagunVenue: "पुतई, बिहार",
    shagunDress: "अपडेट बाकी अछि",
    shagunDescription:
      "मिथिलांचल परंपरा मे शगुन, बियाहक पवित्र विधिक सुग्घर शुरुआत मानल जाइत अछि, जत' आशीर्वाद आ अपनापन दूनू परिवार मे बहेत अछि।",
    baraatTitle: "बारात अनुभव",
    departureTitle: "प्रस्थान समय",
    departureValue: "साँझ 5:00 बजे, पुतई सँ",
    routeTitle: "मार्ग झलक",
    routeValue: "पुतई -> मधुबनी टाउन -> बियाह स्थल",
    contactTitle: "संपर्क व्यक्ति",
    contactValue: "to be updated",
    venueTitle: "भव्य स्थल",
    venueName: "अपडेट बाकी अछि",
    venueAddress: "मधुबनी, बिहार 847211",
    openMaps: "Google Maps मे खोलू",
    nearestRailway: "नजदीकी रेलवे स्टेशन: दरभंगा जंक्शन (5.8 किमी)",
    nearestAirport: "नजदीकी एयरपोर्ट: दरभंगा एयरपोर्ट (8.1 किमी)",
    landmark: "पहचान चिन्ह: अपडेट बाकी अछि",
    mapTitle: "बियाह स्थल मानचित्र",
    weatherTitle: "लाइव मौसम आ AQI",
    weatherSubtitle: "मधुबनी लेल स्वतः अपडेट",
    loadingWeather: "मौसम विवरण लोड भ' रहल अछि...",
    weatherUnavailable: "लाइव मौसम एखन उपलब्ध नहि अछि।",
    humidity: "आर्द्रता",
    windSpeed: "हवा के रफ्तार",
    countdownTitle: "भव्य उत्सवक उलटी गिनती",
    celebrationArrived: "शुभ घड़ी आबि गेल अछि। बियाह उत्सव मे अपनेक स्वागत अछि।",
    traditionsTitle: "मिथिलांचल बियाह परंपरा",
    traditions: [
      {
        icon: "01",
        name: "मधुपर्क",
        text: "ई पवित्र सत्कार रस्म अछि जत' वरक स्वागत आदर, मिठास आ मंगल आशीष संग होइत अछि।",
      },
      {
        icon: "02",
        name: "कन्यादान",
        text: "कन्याके माता-पिता प्रार्थना आ भावुक मन सँ कन्या समर्पित करैत छथि।",
      },
      {
        icon: "03",
        name: "पाणिग्रहण",
        text: "हाथ पकड़बाक ई पवित्र रस्म जीवन भरिक भरोसा, जिम्मेदारी आ संगक प्रतीक अछि।",
      },
      {
        icon: "04",
        name: "सिंदूर दान",
        text: "अग्नि आ परिवारक साक्षी मे वर वधूक संग वैवाहिक वचन निभबैत छथि।",
      },
      {
        icon: "05",
        name: "कोहबर रस्म",
        text: "कोहबर कक्षक मिथिला चित्र शुभारंभ, सामंजस्य आ समृद्धिक प्रतीक अछि।",
      },
      {
        icon: "06",
        name: "मैथिल गीत",
        text: "पारंपरिक गीत सभ रस्म मे आशीर्वाद, हास्य आ पूर्वजक ज्ञान जीवित रखैत अछि।",
      },
    ],
    galleryTitle: "बियाह गैलरी",
    clickToOpen: "खोलबाक लेल क्लिक करू",
    gallery: [
      { key: "grandEntry", title: "भव्य प्रवेश", color: "from-maroon to-gold" },
      { key: "varmalaStage", title: "वरमाला मंच", color: "from-emerald to-gold" },
      { key: "kohbarArt", title: "कोहबर कला", color: "from-lotus to-maroon" },
      { key: "sacredMandap", title: "पवित्र मंडप", color: "from-gold to-cream" },
      { key: "familyBlessings", title: "परिवारक आशीर्वाद", color: "from-emerald to-mustard" },
    ],
    rsvpTitle: "पुष्टि आ आशीर्वाद",
    fullName: "पूरा नाम",
    phone: "फोन नंबर",
    guests: "मेहमानक संख्या",
    ceremony: "समारोह",
    shagunCeremony: "शगुन समारोह",
    weddingNight: "बियाह राइत",
    bothCeremonies: "दूनू समारोह",
    confirmNow: "एखन पुष्टि करू",
    whatsappConfirm: "व्हाट्सऐप पुष्टि",
    rsvpThanks: "धन्यवाद। अहाँक जवाब दर्ज भ' गेल।",
    downloadPdf: "निमंत्रण PDF डाउनलोड करू",
    enablePdf: "PDF डाउनलोड लेल VITE_INVITATION_PDF_URL सेट करू।",
    viewAlbum: "एल्बम देखू",
    uploadPhoto: "फोटो अपलोड करू",
    messageWall: "अतिथि संदेश दीवार",
    blessingPlaceholder: "अपन आशीर्वाद लिखू...",
    postMessage: "संदेश भेजू",
    firstBlessing: "सभसँ पहिने आशीर्वाद दिऔ।",
    guestBlessingPrefix: "अतिथि आशीर्वाद",
    confirmMessagePrefix: "कृपया पुष्टि",
    confirmMessageBody: "हम अपन उपस्थितिक पुष्टि करैत छी।",
    languageNote: "भाषा",
    ceremonyNote: "समारोह",
    notSelected: "चयन नहि",
    close: "बन्द करू",
    aqiGood: "नीक",
    aqiModerate: "मध्यम",
    aqiUnhealthy: "हानिकारक",
    aqiVeryUnhealthy: "बहुत हानिकारक",
    aqiHazardous: "खतरनाक",
    weatherClearSky: "साफ आकाश",
    weatherPartlyCloudy: "आंशिक बादर",
    weatherCloudy: "बादरायल",
    weatherFog: "कोहरा",
    weatherDrizzle: "फुहार",
    weatherRain: "बरखा",
    weatherSnow: "हिमपात",
    weatherRainShowers: "बरखा के बौछार",
    weatherThunderstorm: "गरज-बरस",
    weatherUpdate: "मौसम अपडेट",
    quickNav: "फटाफट नेविगेशन",
    moreInfo: "अधिक जानकारी",
    backHome: "होम पर जाउ",
    navHome: "होम",
    navStory: "कहानी",
    navShagun: "शगुन",
    navBaraat: "बारात",
    navVenue: "स्थल",
    navWeather: "मौसम",
    navCountdown: "काउंटडाउन",
    navTraditions: "परंपरा",
    navGallery: "गैलरी",
    navConfirmation: "पुष्टि",
    updatesTitle: "इवेंट अपडेट कंसीयर्ज",
    updatesSubtitle: "स्थान, समय आ जरूरी जानकारीक तुरंत अपडेट पाउ।",
    updatesPhoneLabel: "संपर्क नंबर",
    updatesTopicsLabel: "की बातक अपडेट चाही",
    updatesTopicVenue: "स्थान अपडेट",
    updatesTopicTiming: "समय अपडेट",
    updatesTopicGeneral: "सामान्य सूचना",
    updatesChannelLabel: "डिलीवरी चैनल",
    updatesChannelBrowser: "ब्राउज़र नोटिफिकेशन",
    updatesChannelWhatsapp: "व्हाट्सऐप अपडेट",
    updatesEnableBrowser: "ब्राउज़र अलर्ट चालू करू",
    updatesSave: "पसंद सेव करू",
    updatesWhatsappCTA: "व्हाट्सऐप पर सब्सक्राइब करू",
    updatesLatestLabel: "नवीनतम अपडेट",
    updatesNoFeed: "एखन धरि कोनो अपडेट फीड प्रकाशित नहि अछि।",
    updatesBrowserGranted: "ब्राउज़र अलर्ट चालू भ' गेल।",
    updatesBrowserDenied: "ब्राउज़र नोटिफिकेशन अनुमति नहि भेटल।",
    updatesBrowserUnsupported: "ई ब्राउज़र नोटिफिकेशन सपोर्ट नहि करैत अछि।",
    updatesSaved: "अपडेट पसंद सेव भ' गेल।",
    updatesWhatsappSent: "व्हाट्सऐप सदस्यता ड्राफ्ट खोलल गेल।",
    updatesFreshNotice: "बियाह स' जुड़ल नवीन जानकारी अपडेट भेल अछि।",
    updatesBrowserTitle: "बियाह जानकारी अपडेट",
    updatesBrowserFallback: "नवीन अपडेट देखबाक लेल पेज खोलू।",
  },
};

const chatbotText = {
  en: {
    open: "Ask Me",
    title: "Wedding Assistant",
    subtitle: "Instant answers for guests",
    placeholder: "Ask about venue, timing, confirmation...",
    send: "Send",
    greeting:
      "Hello. I can assist you with venue details, timings, confirmation, weather, contact, and language options.",
    fallback:
      "I’m sorry, I don’t have an answer for that. I am currently only trained on the details for Saurabh and Soni’s wedding.\nWould you like to check the venue location or provide your Confirmation for the event?",
    prompts: ["Venue", "Timing", "Confirmation", "Contact"],
    ConfirmationHint:
      "Please fill the Confirmation form and click Confirm Now to send your details on WhatsApp.",
    goToConfirmation: "Go to Confirmation",
    tapToOpenConfirmation: "Tap the button below to open Confirmation section.",
    askVenueType: "Which venue do you want: Shagun or Wedding?",
    askTimingType: "Which timing do you want: Shagun or Wedding?",
    chooseShagunWedding: "Please choose using the buttons below.",
    weddingTiming: "Wedding: Sunday, April 26, 2026, 7:00 PM onwards",
    askLocationLink: "Do you want the location link? Reply yes or no.",
    yesNoHint: "Please reply with yes or no.",
    acknowledged: "Understood. Let me know if you need anything else.",
    terminateAck: "Understood. I am ending this query here. You can start again anytime.",
    askLanguageChoice: "Choose language using the buttons below, or type language name.",
  },
  hi: {
    open: "मुझसे पूछें",
    title: "विवाह सहायक",
    subtitle: "मेहमानों के लिए तुरंत जानकारी",
    placeholder: "स्थान, समय, पुष्टि के बारे में पूछें...",
    send: "भेजें",
    greeting:
      "नमस्ते। मैं स्थान, समय, पुष्टि, मौसम, संपर्क और भाषा विकल्प की जानकारी पेशेवर तरीके से दे सकता हूँ।",
    fallback:
      "क्षमा करें, मुझे इस बारे में जानकारी नहीं है। अभी मेरा पूरा ध्यान सौरभ और सोनी की शादी की तैयारियों पर है।\nक्या मैं आपकी मदद वेन्यू (Venue) बताने में या आपकी Confirmation (स्वीकृति) दर्ज करने में कर सकता हूँ?",
    prompts: ["स्थान", "समय", "पुष्टि", "संपर्क"],
    ConfirmationHint:
      "कृपया पुष्टि फॉर्म भरें और WhatsApp पर विवरण भेजने के लिए Confirm Now दबाएँ।",
    goToConfirmation: "पुष्टि पर जाएँ",
    tapToOpenConfirmation: "पुष्टि सेक्शन खोलने के लिए नीचे बटन दबाएँ।",
    askVenueType: "आप कौन सा स्थान जानना चाहते हैं: शगुन या विवाह?",
    askTimingType: "आप कौन सा समय जानना चाहते हैं: शगुन या विवाह?",
    chooseShagunWedding: "कृपया नीचे दिए बटन से चुनें।",
    weddingTiming: "विवाह: रविवार, 26 अप्रैल 2026, शाम 7:00 बजे से",
    askLocationLink: "क्या आप स्थान लिंक चाहते हैं? हाँ या ना लिखें।",
    yesNoHint: "कृपया हाँ या ना में जवाब दें।",
    acknowledged: "ठीक है। यदि आपको और जानकारी चाहिए, तो बताएं।",
    terminateAck: "ठीक है। मैं इस बातचीत को यहीं समाप्त कर रहा हूँ। आप कभी भी फिर से पूछ सकते हैं।",
    askLanguageChoice: "नीचे दिए बटन से भाषा चुनें, या भाषा का नाम लिखें।",
  },
  mai: {
    open: "हमसँ पुछू",
    title: "बियाह सहायक",
    subtitle: "मेहमान लेल तुरत जानकारी",
    placeholder: "स्थान, समय, पुष्टि बारेमे पुछू...",
    send: "भेजू",
    greeting:
      "नमस्कार। हम स्थान, समय, पुष्टि, मौसम, संपर्क आ भाषा विकल्पक जानकारी स्पष्ट रूप सँ देबामे मदद कऽ सकैत छी।",
    fallback:
      "क्षम्य होब, हमरा एहि बारे में नहि पता अछि। हमर काज अछि अहाँ सभ कें सौरभ आ सोनी क विवाहक जानकारी देब।\nकी अहाँ अपन Confirmation (स्वीकृति) देबय चाहब, या कार्यक्रमक समय जानय चाहब?",
    prompts: ["स्थान", "समय", "पुष्टि", "संपर्क"],
    ConfirmationHint:
      "कृपया पुष्टि फॉर्म भरू आ WhatsApp पर विवरण भेजबाक लेल Confirm Now दबाउ।",
    goToConfirmation: "पुष्टि पर जाउ",
    tapToOpenConfirmation: "पुष्टि सेक्शन खोलबाक लेल नीचाँ बटन दबाउ।",
    askVenueType: "अहाँ ककर स्थान चाहैत छी: शगुन कि बियाह?",
    askTimingType: "अहाँ ककर समय चाहैत छी: शगुन कि बियाह?",
    chooseShagunWedding: "कृपया नीचाँ देल बटन सँ चुनू।",
    weddingTiming: "बियाह: रवि, 26 अप्रैल 2026, साँझ 7:00 बजे सँ",
    askLocationLink: "की अहाँ स्थान लिंक चाहैत छी? हँ वा नहि लिखू।",
    yesNoHint: "कृपया हँ वा नहि मे जवाब दिऔ।",
    acknowledged: "ठीक अछि। जँ आओर जानकारी चाही तँ जरूर पुछू।",
    terminateAck: "ठीक अछि। हम एहि बातचीतकेँ एतय समाप्त करैत छी। अहाँ फेर सँ कखनो पुछि सकैत छी।",
    askLanguageChoice: "नीचाँ देल बटन सँ भाषा चुनू, वा भाषाक नाम लिखू।",
  },
};

function getTimeParts(targetDate) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: false,
  };
}

function getAqiMeta(value, t) {
  if (value <= 50) return { label: t.aqiGood, color: "#2E8B57" };
  if (value <= 100) return { label: t.aqiModerate, color: "#E1AD01" };
  if (value <= 200) return { label: t.aqiUnhealthy, color: "#FF6F91" };
  if (value <= 300) return { label: t.aqiVeryUnhealthy, color: "#B1476D" };
  return { label: t.aqiHazardous, color: "#800020" };
}

function getWeatherLabel(code, t) {
  if ([0].includes(code)) return t.weatherClearSky;
  if ([1, 2].includes(code)) return t.weatherPartlyCloudy;
  if ([3].includes(code)) return t.weatherCloudy;
  if ([45, 48].includes(code)) return t.weatherFog;
  if ([51, 53, 55, 56, 57].includes(code)) return t.weatherDrizzle;
  if ([61, 63, 65, 66, 67].includes(code)) return t.weatherRain;
  if ([71, 73, 75, 77].includes(code)) return t.weatherSnow;
  if ([80, 81, 82].includes(code)) return t.weatherRainShowers;
  if ([95, 96, 99].includes(code)) return t.weatherThunderstorm;
  return t.weatherUpdate;
}

function buildCalendarUrl(t) {
  const start = "20260426T133000Z";
  const end = "20260426T183000Z";
  const text = encodeURIComponent(t.calendarEvent);
  const details = encodeURIComponent(t.calendarDetails);
  const location = encodeURIComponent(t.calendarLocation);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
}

const initialRsvp = {
  name: "",
  phone: "",
  attendees: "2",
  ceremonies: ["wedding"],
};

const initialWeather = {
  loading: true,
  error: "",
  now: null,
  forecast: [],
  aqi: null,
};

function App() {
  const [countdown, setCountdown] = useState(getTimeParts(weddingDate));
  const [darkMode, setDarkMode] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [language, setLanguage] = useState("hi");
  const [weather, setWeather] = useState(initialWeather);
  const [rsvp, setRsvp] = useState(initialRsvp);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatPending, setChatPending] = useState(null);
  const [chatQuickActions, setChatQuickActions] = useState(false);
  const [chatVenueChoice, setChatVenueChoice] = useState(null);
  const [quickNavOpen, setQuickNavOpen] = useState(false);
  const [showHomeShortcut, setShowHomeShortcut] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [updatePrefs, setUpdatePrefs] = useState({
    phone: "",
    browser: false,
    whatsapp: true,
    topics: ["venue", "timing", "general"],
  });
  const [latestUpdate, setLatestUpdate] = useState(null);
  const [updatesStatus, setUpdatesStatus] = useState("");
  const [hasFreshUpdate, setHasFreshUpdate] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission);
  const audioRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const t = translations[language];
  const chat = chatbotText[language];
  const isHindi = language === "hi";
  const heroEyebrowText = t.together;
  const heroTitleText = t.couple;

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(getTimeParts(weddingDate));
    }, 1000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.body.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  useEffect(() => {
    setChatMessages([
      {
        id: Date.now(),
        sender: "bot",
        text: chat.greeting,
      },
    ]);
    setChatInput("");
    setChatLoading(false);
    setChatPending(null);
    setChatQuickActions(false);
    setChatVenueChoice(null);
  }, [chat]);

  useEffect(() => {
    if (!chatOpen) return;
    const el = chatMessagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chatMessages, chatLoading, chatOpen]);

  useEffect(() => {
    const onScroll = () => {
      setShowHomeShortcut(window.scrollY > 280);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (audioOn && shehnaiSrc) {
      audioRef.current
        .play()
        .then(() => {})
        .catch(() => setAudioOn(false));
      return;
    }

    audioRef.current.pause();
  }, [audioOn]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(updatesPrefStorageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      setUpdatePrefs((prev) => ({
        ...prev,
        ...parsed,
        topics: Array.isArray(parsed.topics) && parsed.topics.length
          ? parsed.topics
          : prev.topics,
      }));
    } catch {
      // ignore parse errors for invalid legacy values
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(updatesPrefStorageKey, JSON.stringify(updatePrefs));
  }, [updatePrefs]);

  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timerId;

    const notifyInBrowser = (headline) => {
      if (!updatePrefs.browser) return;
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;
      new Notification(t.updatesBrowserTitle, {
        body: headline || t.updatesBrowserFallback,
      });
    };

    const loadUpdatesFeed = async () => {
      try {
        const res = await fetch(`${updatesFeedUrl}?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        const version = String(data?.version || data?.updatedAt || "").trim();
        const updatedAt = String(data?.updatedAt || "").trim();
        const headline = String(data?.headline || "").trim();
        const details = String(data?.details || "").trim();
        setLatestUpdate({
          version,
          headline,
          details,
        });

        const signature = [version, updatedAt, headline, details].join("|").trim();
        if (!signature) return;

        const seenVersion = localStorage.getItem(updatesSeenVersionStorageKey);
        if (!seenVersion) {
          localStorage.setItem(updatesSeenVersionStorageKey, signature);
          return;
        }

        if (seenVersion !== signature) {
          setHasFreshUpdate(true);
          setUpdatesStatus(t.updatesFreshNotice);
          if (shouldNotifyForTopics(headline, details, updatePrefs.topics)) {
            notifyInBrowser(headline || details);
          }
          localStorage.setItem(updatesSeenVersionStorageKey, signature);
        }
      } catch {
        if (!cancelled) {
          setLatestUpdate(null);
        }
      }
    };

    loadUpdatesFeed();
    timerId = window.setInterval(loadUpdatesFeed, 120000);

    return () => {
      cancelled = true;
      clearInterval(timerId);
    };
  }, [t, updatePrefs.browser, updatePrefs.topics]);

  useEffect(() => {
    async function loadWeather() {
      try {
        const lat = 26.3489;
        const lon = 86.0715;
        const [weatherRes, aqiRes] = await Promise.all([
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max&timezone=Asia/Kolkata&forecast_days=3`
          ),
          fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi&timezone=Asia/Kolkata`
          ),
        ]);

        const [w, a] = await Promise.all([weatherRes.json(), aqiRes.json()]);

        const forecastDaily = (w.daily?.time || []).slice(0, 3).map((date, i) => ({
          day: new Date(date).toLocaleDateString(localeByLanguage[language], { weekday: "short" }),
          temp: Math.round(w.daily.temperature_2m_max?.[i] ?? 0).toString(),
          condition: getWeatherLabel(w.daily.weather_code?.[i], t),
        }));

        const aqiValue = Math.round(a?.current?.us_aqi ?? 80);

        setWeather({
          loading: false,
          error: "",
          now: {
            temp: Math.round(w.current?.temperature_2m ?? 0).toString(),
            condition: getWeatherLabel(w.current?.weather_code, t),
            humidity: Math.round(w.current?.relative_humidity_2m ?? 0).toString(),
            wind: Math.round(w.current?.wind_speed_10m ?? 0).toString(),
          },
          forecast: forecastDaily,
          aqi: aqiValue,
        });
      } catch {
        setWeather({
          loading: false,
          error: t.weatherUnavailable,
          now: null,
          forecast: [],
          aqi: null,
        });
      }
    }

    loadWeather();
  }, [language, t]);

  const aqiMeta = useMemo(() => getAqiMeta(weather.aqi || 0, t), [weather.aqi, t]);

  const ceremonySelectValue =
    rsvp.ceremonies.length === 2 ? "both" : (rsvp.ceremonies[0] || "wedding");

  const selectedCeremonyText =
    ceremonySelectValue === "both"
      ? t.bothCeremonies
      : ceremonySelectValue === "shagun"
        ? t.shagunCeremony
        : t.weddingNight;

  const selectedUpdateTopics = updatePrefs.topics
    .map((topic) => {
      if (topic === "venue") return t.updatesTopicVenue;
      if (topic === "timing") return t.updatesTopicTiming;
      return t.updatesTopicGeneral;
    })
    .join(", ");

  function handleRsvpSubmit(event) {
    event.preventDefault();

    if (!rsvp.name.trim() || !rsvp.phone.trim() || !rsvp.ceremonies.length) {
      return;
    }

    const selectedCeremonies = rsvp.ceremonies
      .map((item) => {
        if (item === "shagun") return t.shagunCeremony;
        if (item === "wedding") return t.weddingNight;
        return item;
      })
      .join(", ");
    const submitMessage = [
      `${t.confirmMessagePrefix}: ${t.confirmMessageBody}`,
      `${t.fullName}: ${rsvp.name}`,
      `${t.phone}: ${rsvp.phone}`,
      `${t.guests}: ${rsvp.attendees}`,
      `${t.ceremony}: ${selectedCeremonies || t.notSelected}`,
      `${t.languageNote}: ${language.toUpperCase()}`,
    ].join("\n");
    window.open(
      `https://wa.me/${confirmRsvpWhatsapp}?text=${encodeURIComponent(submitMessage)}`,
      "_blank",
      "noopener,noreferrer"
    );

    setRsvpSubmitted(true);
    setRsvp(initialRsvp);
  }

  function handleAddMessage() {
    const text = messageInput.trim();
    if (!text) return;

    setMessages((prev) => [
      {
        id: Date.now(),
        text,
      },
      ...prev,
    ]);
    const messageForWhatsapp = `${t.guestBlessingPrefix}: ${text}`;
    const wallWhatsappLink = `https://wa.me/${wishesWhatsappNumberLink}?text=${encodeURIComponent(
      messageForWhatsapp
    )}`;
    window.open(wallWhatsappLink, "_blank", "noopener,noreferrer");
    setMessageInput("");
    setTimeout(() => {
      window.location.reload();
    }, 180);
  }

  function toggleUpdateTopic(topic) {
    setUpdatePrefs((prev) => {
      const exists = prev.topics.includes(topic);
      if (exists && prev.topics.length === 1) return prev;
      return {
        ...prev,
        topics: exists ? prev.topics.filter((item) => item !== topic) : [...prev.topics, topic],
      };
    });
  }

  async function handleEnableBrowserAlerts() {
    const latestHeadline = latestUpdate?.headline || latestUpdate?.details || t.updatesBrowserFallback;

    if (!("Notification" in window)) {
      setUpdatesStatus(t.updatesBrowserUnsupported);
      setNotificationPermission("unsupported");
      return;
    }

    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission !== "granted") {
        setUpdatePrefs((prev) => ({ ...prev, browser: false }));
        setUpdatesStatus(t.updatesBrowserDenied);
        return;
      }
    }

    if (Notification.permission === "granted") {
      setUpdatePrefs((prev) => ({ ...prev, browser: true }));
      setNotificationPermission("granted");
      new Notification(t.updatesBrowserTitle, {
        body: latestUpdate ? latestHeadline : t.updatesBrowserGranted,
      });
      if (hasFreshUpdate && latestUpdate) {
        setHasFreshUpdate(false);
      }
      return;
    }

    setUpdatePrefs((prev) => ({ ...prev, browser: false }));
    setUpdatesStatus(t.updatesBrowserDenied);
  }

  function handleSaveUpdatePrefs(event) {
    event.preventDefault();
    setUpdatesStatus(t.updatesSaved);
    setHasFreshUpdate(false);
  }

  function handleWhatsappUpdates() {
    const updateMessage = [
      `Wedding update subscription`,
      `${t.phone}: ${updatePrefs.phone || t.notSelected}`,
      `${t.updatesTopicsLabel}: ${selectedUpdateTopics || t.notSelected}`,
      `${t.languageNote}: ${language.toUpperCase()}`,
      `Please send new updates for venue, timings, and announcements.`,
    ].join("\n");

    window.open(
      `https://wa.me/${whatsappNumberLink}?text=${encodeURIComponent(updateMessage)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setUpdatesStatus(t.updatesWhatsappSent);
  }

  function getBotReply(raw) {
    const q = raw.toLowerCase();
    const has = (words) => words.some((w) => q.includes(w));
    const points = (items) => items.filter(Boolean).join("\n");
    const asksShagunMap =
      (has(["shagun", "शगुन", "पुतई", "putai"]) && has(["location", "map", "venue", "स्थान", "ठाम"])) ||
      has(["putai map", "putai location", "शगुन मैप", "शगुन map"]);

    if (has(["weather", "aqi", "temperature", "temp", "tempreature", "मौसम", "तापमान"])) {
      if (weather.loading) {
        return points([t.loadingWeather]);
      }
      if (weather.error) {
        return points([weather.error]);
      }

      const current = weather.now
        ? `${weather.now.temp}°C, ${weather.now.condition}, ${t.humidity}: ${weather.now.humidity}%, ${t.windSpeed}: ${weather.now.wind} km/h`
        : t.weatherUnavailable;

      const aqiLine = weather.aqi ? `AQI: ${weather.aqi} (${aqiMeta.label})` : "AQI: N/A";
      const forecastLine = weather.forecast.length
        ? weather.forecast.map((d) => `${d.day}: ${d.temp}°C, ${d.condition}`).join(" | ")
        : "Forecast: N/A";

      return points([
        t.weatherTitle,
        current,
        aqiLine,
        forecastLine,
      ]);
    }

    if (asksShagunMap) {
      return shagunMapLink;
    }

    if (has(["venue", "location", "map", "स्थान", "ठाम"])) {
      return weddingMapLink;
    }

    if (has(["time", "date", "when", "कब", "समय", "तिथि"])) {
      return points([t.dateLine, `${t.shagunTitle}: ${t.shagunDate}, ${t.shagunTime}`]);
    }

    if (has(["confirm", "confirmation", "attendance", "पुष्टि", "उपस्थिति"])) {
      return points([chat.ConfirmationHint]);
    }

    if (has(["dress", "code", "outfit", "पोशाक", "वेशभूषा"])) {
      return points([`${t.dressCodeLabel}: ${t.shagunDress}`]);
    }

    if (has(["contact", "phone", "number", "संपर्क"])) {
      return points([`${t.contactTitle}: ${t.contactValue}`]);
    }

    if (has(["language", "hindi", "english", "maithili", "भाषा"])) {
      return points([`${t.language}: ${t.languageHindi}, ${t.languageMaithili}, ${t.languageEnglish}`]);
    }

    return chat.fallback;
  }

  function getEventChoice(raw) {
    const q = raw.toLowerCase();
    if (["shagun", "शगुन"].some((w) => q.includes(w))) return "shagun";
    if (["wedding", "विवाह", "बियाह"].some((w) => q.includes(w))) return "wedding";
    return null;
  }

  function getYesNoChoice(raw) {
    const q = raw.toLowerCase();
    if (["yes", "y", "haan", "ha", "हाँ", "हां", "हँ", "हँँ", "हो"].some((w) => q.includes(w))) {
      return "yes";
    }
    if (["no", "n", "nah", "ना", "नहि", "नहीं"].some((w) => q.includes(w))) {
      return "no";
    }
    return null;
  }

  function getLanguageChoice(raw) {
    const q = raw.toLowerCase();
    if (["hindi", "हिंदी", "हिन्दी", "hi"].some((w) => q.includes(w))) return "hi";
    if (["english", "अंग्रेज़ी", "अंग्रेजी", "en"].some((w) => q.includes(w))) return "en";
    if (["maithili", "मैथिली", "mai"].some((w) => q.includes(w))) return "mai";
    return null;
  }

  function sendChatMessage(customText) {
    const text = (customText ?? chatInput).trim();
    if (!text) return;
    if (chatLoading) return;
    setChatQuickActions(false);
    const q = text.toLowerCase();
    const has = (words) => words.some((w) => q.includes(w));
    const asksShagunMap =
      (has(["shagun", "शगुन", "पुतई", "putai"]) && has(["location", "map", "venue", "स्थान", "ठाम"])) ||
      has(["putai map", "putai location", "शगुन मैप", "शगुन map"]);
    const selectedEvent = getEventChoice(text);
    const selectedLanguage = getLanguageChoice(text);
    let reply = "";
    let languageToApply = null;

    if (chatPending === "fallbackDecision") {
      const yesNo = getYesNoChoice(text);
      if (yesNo === "yes") {
        reply = [
          `${t.venueTitle}: ${t.venueName}, ${t.venueAddress}`,
          `${t.shagunTitle}: ${t.shagunDate}, ${t.shagunTime}`,
          `${chat.weddingTiming}`,
        ].join("\n");
        setChatPending(null);
      } else if (yesNo === "no") {
        reply = chat.terminateAck;
        setChatPending(null);
      } else {
        reply = chat.yesNoHint;
      }
    } else if (chatPending === "confirmation") {
      reply = chat.tapToOpenConfirmation;
    } else if (chatPending === "language") {
      if (selectedLanguage) {
        languageToApply = selectedLanguage;
        reply = chat.acknowledged;
        setChatPending(null);
        setChatVenueChoice(null);
      } else {
        reply = chat.askLanguageChoice;
      }
    } else if (chatPending === "venue") {
      if (selectedEvent === "shagun") {
        reply = `${t.shagunTitle}: ${t.shagunVenue}\n${chat.askLocationLink}`;
        setChatPending("locationLink");
        setChatVenueChoice("shagun");
      } else if (selectedEvent === "wedding") {
        reply = `${t.venueTitle}: ${t.venueName}, ${t.venueAddress}\n${chat.askLocationLink}`;
        setChatPending("locationLink");
        setChatVenueChoice("wedding");
      } else {
        reply = chat.chooseShagunWedding;
      }
    } else if (chatPending === "locationLink") {
      const yesNo = getYesNoChoice(text);
      if (yesNo === "yes") {
        const link = chatVenueChoice === "shagun" ? shagunMapLink : weddingMapLink;
        reply = link;
        setChatPending(null);
        setChatVenueChoice(null);
      } else if (yesNo === "no") {
        reply = chat.acknowledged;
        setChatPending(null);
        setChatVenueChoice(null);
      } else {
        reply = chat.yesNoHint;
      }
    } else if (chatPending === "timing") {
      if (selectedEvent === "shagun") {
        reply = `${t.shagunTitle}: ${t.shagunDate}, ${t.shagunTime}`;
        setChatPending(null);
      } else if (selectedEvent === "wedding") {
        reply = chat.weddingTiming;
        setChatPending(null);
      } else {
        reply = chat.chooseShagunWedding;
      }
    } else if (asksShagunMap) {
      reply = shagunMapLink;
      setChatPending(null);
      setChatVenueChoice("shagun");
    } else if (has(["venue", "location", "map", "स्थान", "ठाम"])) {
      reply = chat.askVenueType;
      setChatPending("venue");
    } else if (has(["time", "timing", "when", "कब", "समय"])) {
      reply = chat.askTimingType;
      setChatPending("timing");
    } else if (has(["date", "तिथि", "दिनांक"])) {
      reply = chat.askTimingType;
      setChatPending("timing");
    } else if (has(["confirm", "confirmation", "attendance", "पुष्टि", "उपस्थिति"])) {
      reply = chat.tapToOpenConfirmation;
      setChatPending("confirmation");
    } else if (has(["language", "हिंदी", "हिन्दी", "english", "अंग्रेज़ी", "अंग्रेजी", "maithili", "मैथिली", "भाषा"])) {
      reply = chat.askLanguageChoice;
      setChatPending("language");
    } else if (selectedLanguage) {
      languageToApply = selectedLanguage;
      reply = chat.acknowledged;
      setChatPending(null);
      setChatVenueChoice(null);
    } else {
      reply = getBotReply(text);
      setChatPending(null);
    }

    if (reply === chat.fallback) {
      setChatPending("fallbackDecision");
    }

    const userMessage = { id: Date.now(), sender: "user", text };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatLoading(true);
    const responseDelayMs = 900 + Math.floor(Math.random() * 500);
    setTimeout(() => {
      const shouldShowQuickActions = reply === chat.fallback;
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: reply },
      ]);
      setChatQuickActions(shouldShowQuickActions);
      setChatLoading(false);
      if (languageToApply) {
        setTimeout(() => {
          setLanguage(languageToApply);
        }, 220);
      }
    }, responseDelayMs);
    setChatInput("");
  }

  function chooseLanguage(code) {
    setLanguage(code);
    setChatPending(null);
    setChatVenueChoice(null);
  }

  function goToConfirmationSection() {
    setChatOpen(false);
    setChatPending(null);
    const el = document.getElementById("rsvp");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.location.hash = "rsvp";
  }

  function renderChatText(text) {
    return text.split("\n").map((line, lineIndex) => {
      const parts = line.split(urlRegex);
      return (
        <span key={`line-${lineIndex}`}>
          {parts.map((part, i) => {
            if (!/^https?:\/\//i.test(part)) {
              return <span key={`txt-${lineIndex}-${i}`}>{part}</span>;
            }

            let label = part;
            let isMapsLink = false;

            try {
              const u = new URL(part);
              const host = u.hostname.toLowerCase();
              isMapsLink =
                host === "maps.google.com" ||
                host.endsWith(".maps.google.com") ||
                (host.includes("google.") && u.pathname.toLowerCase().includes("/maps"));
              if (isMapsLink) {
                label = t.openMaps;
              }
            } catch {
              // ignore URL parse error and keep raw label
            }

            return (
              <a
                key={`url-${lineIndex}-${i}`}
                href={part}
                target="_blank"
                rel="noreferrer"
                className={isMapsLink ? "chat-link-btn" : undefined}
                aria-label={isMapsLink ? t.openMaps : undefined}
                title={isMapsLink ? t.openMaps : undefined}
                onClick={(e) => {
                  try {
                    const u = new URL(part);
                    if (u.hostname === "lang.local") {
                      e.preventDefault();
                      const code = u.pathname.replace("/", "");
                      if (["hi", "en", "mai"].includes(code)) {
                        setLanguage(code);
                        setChatPending(null);
                        setChatVenueChoice(null);
                      }
                    }
                  } catch {
                    // ignore invalid URL and allow default navigation
                  }
                }}
              >
                {isMapsLink ? (
                  <>
                    <svg viewBox="0 0 24 24" className="chat-link-icon" aria-hidden="true">
                      <path
                        d="M12 2a7 7 0 0 0-7 7c0 4.8 5.4 11.8 6.1 12.7a1.1 1.1 0 0 0 1.8 0C13.6 20.8 19 13.8 19 9a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="chat-link-text">{t.clickToOpen}</span>
                  </>
                ) : (
                  label
                )}
              </a>
            );
          })}
          {lineIndex < text.split("\n").length - 1 ? <br /> : null}
        </span>
      );
    });
  }

  const whatsappLink = `https://wa.me/${whatsappNumberLink}?text=${encodeURIComponent(
    `${t.confirmMessagePrefix}: ${t.confirmMessageBody} ${t.languageNote}: ${language.toUpperCase()}. ${t.ceremonyNote}: ${selectedCeremonyText || t.notSelected}`
  )}`;

  const countdownUnits = [t.days, t.hours, t.minutes, t.seconds];
  const isFinalDay = !countdown.ended && countdown.days === 0;
  const selectedFolderLink = selectedPhoto ? galleryFolderLinks[selectedPhoto.key] : "";
  const selectedUploadLink =
    selectedPhoto && galleryUploadBaseUrl
      ? galleryUploadBaseUrl
      : selectedFolderLink;
  const hasUserChatted = chatMessages.some((m) => m.sender === "user");
  const quickSections = [
    { id: "story", label: t.navStory },
    { id: "shagun", label: t.navShagun },
    { id: "baraat", label: t.navBaraat },
    { id: "venue", label: t.navVenue },
    { id: "weather", label: t.navWeather },
    { id: "gallery", label: t.navGallery },
  ];

  function jumpToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setQuickNavOpen(false);
    }
  }

  function handlePdfClick(e) {
    e.preventDefault();
    window.alert("TBD");
  }

  function closeChatAndRefresh() {
    setChatOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 140);
  }

  return (
    <>
      <audio ref={audioRef} loop src={shehnaiSrc} preload="none" />

      <div className="loader" aria-hidden="true">
        <div className="crest">SS</div>
      </div>

      <header className="topbar">
        <p className="brand">{t.brand}</p>
        <div className="actions">
          {showHomeShortcut ? (
            <button type="button" className="chip chip-home chip-icon-btn" onClick={() => jumpToSection("hero")}>
              <svg viewBox="0 0 24 24" className="chip-icon-svg" aria-hidden="true">
                <path
                  d="M12 4.7 4.7 11a.75.75 0 1 0 .98 1.12l.82-.72V18a1 1 0 0 0 1 1h3.4a.75.75 0 0 0 .75-.75V14h1.7v4.25a.75.75 0 0 0 .75.75h3.4a1 1 0 0 0 1-1v-6.6l.82.72A.75.75 0 1 0 19.3 11L12 4.7Z"
                  fill="currentColor"
                />
              </svg>
              <span className="chip-label">{t.navHome}</span>
            </button>
          ) : null}
          <label className="chip language-chip" htmlFor="language-select">
            {language !== "en" ? <span>{t.language}</span> : null}
            <select
              className="language-select"
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="hi">{t.languageHindi}</option>
              <option value="mai">{t.languageMaithili}</option>
              <option value="en">{t.languageEnglish}</option>
            </select>
          </label>
          <button onClick={() => setDarkMode((v) => !v)} className="chip chip-icon-btn chip-theme">
            {darkMode ? (
              <svg viewBox="0 0 24 24" className="chip-icon-svg" aria-hidden="true">
                <path
                  d="M12 4.25a.75.75 0 0 1 .75.75v1.2a.75.75 0 0 1-1.5 0V5a.75.75 0 0 1 .75-.75Zm0 13.6a.75.75 0 0 1 .75.75v1.4a.75.75 0 0 1-1.5 0v-1.4a.75.75 0 0 1 .75-.75ZM6.2 11.25a.75.75 0 0 1 0 1.5H4.8a.75.75 0 0 1 0-1.5h1.4Zm13 0a.75.75 0 0 1 0 1.5h-1.4a.75.75 0 0 1 0-1.5h1.4ZM7.78 7.78a.75.75 0 0 1 1.06 0l.86.86a.75.75 0 0 1-1.06 1.06l-.86-.86a.75.75 0 0 1 0-1.06Zm6.52 6.52a.75.75 0 0 1 1.06 0l.86.86a.75.75 0 0 1-1.06 1.06l-.86-.86a.75.75 0 0 1 0-1.06ZM16.22 7.78a.75.75 0 0 1 0 1.06l-.86.86a.75.75 0 1 1-1.06-1.06l.86-.86a.75.75 0 0 1 1.06 0Zm-6.52 6.52a.75.75 0 0 1 0 1.06l-.86.86a.75.75 0 0 1-1.06-1.06l.86-.86a.75.75 0 0 1 1.06 0ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="chip-icon-svg" aria-hidden="true">
                <path
                  d="M14.7 3.5a.75.75 0 0 1 .5 1.33 7.5 7.5 0 1 0 3.97 8.7.75.75 0 0 1 1.44.43A9 9 0 1 1 13.9 3.62a.75.75 0 0 1 .8-.12Z"
                  fill="currentColor"
                />
              </svg>
            )}
            <span className="chip-label">{darkMode ? t.lightMode : t.darkMode}</span>
          </button>
          <button
            onClick={() => setAudioOn((v) => !v)}
            className="chip chip-icon-btn chip-audio"
            disabled={!shehnaiSrc}
            title={shehnaiSrc ? t.musicToggleTitle : t.musicMissingTitle}
          >
            {audioOn ? (
              <svg viewBox="0 0 24 24" className="chip-icon-svg" aria-hidden="true">
                <path
                  d="M17.25 4.75a.75.75 0 0 0-.75.75v7.6a3.2 3.2 0 1 0 1.5 2.7V9.2l2.45-.7a.75.75 0 1 0-.4-1.45L18 7.6V5.5a.75.75 0 0 0-.75-.75Z"
                  fill="currentColor"
                />
                <path
                  d="M10.55 4.77a.75.75 0 0 0-.8.14L5.1 9.2a1.2 1.2 0 0 0-.39.88v3.84A2.95 2.95 0 1 0 6.2 16.5v-6.1l3.6-3.33a.75.75 0 0 0 .24-.8.75.75 0 0 0-.49-.5Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="chip-icon-svg" aria-hidden="true">
                <path
                  d="M16.75 4.75a.75.75 0 0 0-.75.75v7.6a3.2 3.2 0 1 0 1.5 2.7V9.12l2.5-.72a.75.75 0 1 0-.42-1.44L17.5 7.56V5.5a.75.75 0 0 0-.75-.75Z"
                  fill="currentColor"
                />
              </svg>
            )}
            <span className="chip-label">{audioOn ? t.muteMusic : t.playMusic}</span>
          </button>
          <button
            type="button"
            className={`notify-bell ${notificationPermission === "granted" ? "is-active" : ""}`}
            onClick={handleEnableBrowserAlerts}
            aria-label={t.updatesEnableBrowser}
            title={t.updatesEnableBrowser}
          >
            <svg viewBox="0 0 24 24" className="notify-bell-icon" aria-hidden="true">
              <path
                d="M12 3.5a5 5 0 0 0-5 5v2.8c0 .95-.33 1.88-.93 2.62l-1.15 1.4c-.72.88-.1 2.18 1.04 2.18h12.08c1.14 0 1.76-1.3 1.04-2.18l-1.15-1.4a4.16 4.16 0 0 1-.93-2.62V8.5a5 5 0 0 0-5-5Z"
                fill="currentColor"
              />
              <path
                d="M9.85 19a2.15 2.15 0 0 0 4.3 0h-4.3Z"
                fill="currentColor"
              />
            </svg>
            {hasFreshUpdate && notificationPermission === "granted" ? (
              <span className="chip-notify-dot" aria-hidden="true" />
            ) : null}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="hero">
          <div className="hero-overlay" />
          <div className="royal-frame" />
          <div className="hero-content">
            <p className="eyebrow">{heroEyebrowText}</p>
            <h1 className={`shimmer ${isHindi ? "hero-title-compact" : ""}`}>{heroTitleText}</h1>
            <p className="date-line">{t.dateLine}</p>

            <div className="mini-countdown">
              {[
                countdown.days,
                countdown.hours,
                countdown.minutes,
                countdown.seconds,
              ].map((value, index) => (
                <article key={countdownUnits[index]}>
                  <strong>{String(value).padStart(2, "0")}</strong>
                  <span>{countdownUnits[index]}</span>
                </article>
              ))}
            </div>

            <div className="hero-buttons">
              <a className="btn" href="#rsvp">
                {t.acceptNow}
              </a>
              <a className="btn btn-outline" href={buildCalendarUrl(t)} target="_blank" rel="noreferrer">
                {t.addToCalendar}
              </a>
            </div>
            <div className={`quick-nav-wrap ${quickNavOpen ? "open" : ""}`}>
              <button
                type="button"
                className="quick-nav-toggle"
                onClick={() => setQuickNavOpen((v) => !v)}
                aria-label={t.quickNav}
                title={t.quickNav}
              >
                {quickNavOpen ? t.close : t.moreInfo}
              </button>
              {quickNavOpen ? (
                <nav className="quick-nav-panel" aria-label="Quick section links">
                  {quickSections.map((item) => (
                    <button key={item.id} type="button" onClick={() => jumpToSection(item.id)}>
                      {item.label}
                    </button>
                  ))}
                </nav>
              ) : null}
            </div>
          </div>
          <div className="scroll-indicator" aria-hidden="true" />
        </section>

        <section className="section story" id="story">
          <h2>{t.storyTitle}</h2>
          <p className="section-subtitle">{t.storySubtitle}</p>
          <div className="timeline">
            {t.timeline.map((item) => (
              <article key={item.title} className="timeline-card reveal">
                <p>{item.date}</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section shagun" id="shagun">
          <h2>{t.shagunTitle}</h2>
          <div className="gold-card reveal">
            <dl>
              <div>
                <dt>{t.dateLabel}</dt>
                <dd>{t.shagunDate}</dd>
              </div>
              <div>
                <dt>{t.timeLabel}</dt>
                <dd>{t.shagunTime}</dd>
              </div>
              <div>
                <dt>{t.venueLabel}</dt>
                <dd>{t.shagunVenue}</dd>
              </div>
              <div>
                <dt>{t.dressCodeLabel}</dt>
                <dd>{t.shagunDress}</dd>
              </div>
            </dl>
            <p>{t.shagunDescription}</p>
          </div>
        </section>

        <section className="section baraat" id="baraat">
          <h2>{t.baraatTitle}</h2>
          <div className="procession reveal" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="grid-two">
            <article className="glass-card">
              <h3>{t.departureTitle}</h3>
              <p>{t.departureValue}</p>
            </article>
            <article className="glass-card">
              <h3>{t.routeTitle}</h3>
              <p>{t.routeValue}</p>
            </article>
            <article className="glass-card">
              <h3>{t.contactTitle}</h3>
              <p>{t.contactValue}</p>
            </article>
          </div>
        </section>

        <section className="section venue" id="venue">
          <h2>{t.venueTitle}</h2>
          <div className="venue-grid">
            <article className="gold-card">
              <h3>{t.venueName}</h3>
              <p>{t.venueAddress}</p>
              <a className="btn" href="https://maps.google.com/?q=mudhubani hotel Madhubani Bihar" target="_blank" rel="noreferrer">
                {t.openMaps}
              </a>
              <ul>
                <li>{t.nearestRailway}</li>
                <li>{t.nearestAirport}</li>
                <li>{t.landmark}</li>
              </ul>
            </article>
            <div className="map-frame">
              <iframe
                src={mapsEmbedUrl}
                loading="lazy"
                title={t.mapTitle}
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        <section className="section weather" id="weather">
          <h2>{t.weatherTitle}</h2>
          <p className="section-subtitle">{t.weatherSubtitle}</p>
          {weather.loading ? <p>{t.loadingWeather}</p> : null}
          {weather.error ? <p className="notice">{weather.error}</p> : null}
          {weather.now ? (
            <div className="grid-three">
              <article className="glass-card">
                <h3>{weather.now.temp}°C</h3>
                <p>{weather.now.condition}</p>
              </article>
              <article className="glass-card">
                <h3>{weather.now.humidity}%</h3>
                <p>{t.humidity}</p>
              </article>
              <article className="glass-card">
                <h3>{weather.now.wind} km/h</h3>
                <p>{t.windSpeed}</p>
              </article>
            </div>
          ) : null}

          {weather.aqi ? (
            <div className="aqi-box">
              <div>
                <strong>AQI {weather.aqi}</strong>
                <span>{aqiMeta.label}</span>
              </div>
              <div className="aqi-track">
                <div
                  className="aqi-progress"
                  style={{
                    width: `${Math.min(weather.aqi / 3, 100)}%`,
                    backgroundColor: aqiMeta.color,
                  }}
                />
              </div>
            </div>
          ) : null}

          {weather.forecast.length ? (
            <div className="grid-three forecast">
              {weather.forecast.map((day) => (
                <article className="glass-card" key={day.day}>
                  <h3>{day.day}</h3>
                  <p>{day.temp}°C</p>
                  <p>{day.condition}</p>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <section className="section celebration" id="countdown">
          <h2>{t.countdownTitle}</h2>
          {isFinalDay ? (
            <div className="final-day-banner" role="status" aria-live="polite">
              FINAL 24 HOURS
            </div>
          ) : null}
          <div className={`big-counter ${isFinalDay ? "big-counter-final" : ""}`}>
            {[
              countdown.days,
              countdown.hours,
              countdown.minutes,
              countdown.seconds,
            ].map((value, index) => (
              <article key={`big-${countdownUnits[index]}`}>
                <strong>{String(value).padStart(2, "0")}</strong>
                <span>{countdownUnits[index]}</span>
              </article>
            ))}
          </div>
          {isFinalDay ? <div className="final-sparks" aria-hidden="true" /> : null}

          {countdown.ended ? (
            <div className="celebrate-box">
              <div className="confetti" aria-hidden="true">
                {Array.from({ length: 30 }).map((_, i) => (
                  <span key={i} style={{ "--i": i }} />
                ))}
              </div>
              <p>{t.celebrationArrived}</p>
            </div>
          ) : null}
        </section>

        <section className="section traditions" id="traditions">
          <h2>{t.traditionsTitle}</h2>
          <div className="ritual-grid">
            {t.traditions.map((ritual) => (
              <article key={ritual.name} className="ritual-card reveal">
                <div className="ritual-icon">{ritual.icon}</div>
                <h3>{ritual.name}</h3>
                <p>{ritual.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section gallery" id="gallery">
          <h2>{t.galleryTitle}</h2>
          <div className="gallery-grid">
            {t.gallery.map((item) => (
              <button
                type="button"
                key={item.title}
                className={`photo-card ${item.color}`}
                onClick={() => setSelectedPhoto(item)}
              >
                <span className="photo-card-title">{item.title}</span>
                <small className="photo-card-hint">{t.clickToOpen}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="section rsvp" id="rsvp">
          <h2>{t.rsvpTitle}</h2>
          <div className="grid-two">
            <form className="gold-card" onSubmit={handleRsvpSubmit}>
              <label>
                {t.fullName}
                <input
                  required
                  value={rsvp.name}
                  onChange={(e) => setRsvp((prev) => ({ ...prev, name: e.target.value }))}
                />
              </label>
              <label>
                {t.phone}
                <input
                  required
                  pattern="[0-9+ ]{8,}"
                  value={rsvp.phone}
                  onChange={(e) => setRsvp((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </label>
              <label>
                {t.guests}
                <select
                  value={rsvp.attendees}
                  onChange={(e) => setRsvp((prev) => ({ ...prev, attendees: e.target.value }))}
                >
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </label>
              <label>
                {t.ceremony}
                <select
                  value={ceremonySelectValue}
                  onChange={(e) =>
                    setRsvp((prev) => ({
                      ...prev,
                      ceremonies:
                        e.target.value === "both"
                          ? ["shagun", "wedding"]
                          : [e.target.value],
                    }))
                  }
                >
                  <option value="shagun">{t.shagunCeremony}</option>
                  <option value="wedding">{t.weddingNight}</option>
                  <option value="both">{t.bothCeremonies}</option>
                </select>
              </label>
              <div className="form-actions">
                <button className="btn" type="submit">
                  {t.confirmNow}
                </button>
                <a className="btn btn-outline" href={whatsappLink} target="_blank" rel="noreferrer">
                  {t.whatsappConfirm}
                </a>
              </div>
              {rsvpSubmitted ? <p className="notice">{t.rsvpThanks}</p> : null}
              <a className="btn btn-outline pdf-link" href={invitationPdf || "#"} onClick={handlePdfClick}>
                {t.downloadPdf}
              </a>
            </form>

            <article className="gold-card message-wall">
              <h3>{t.messageWall}</h3>
              <div className="message-form">
                <textarea
                  rows={3}
                  placeholder={t.blessingPlaceholder}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button className="btn" type="button" onClick={handleAddMessage}>
                  {t.postMessage}
                </button>
              </div>
              <ul>
                {messages.length ? (
                  messages.map((msg) => <li key={msg.id}>{msg.text}</li>)
                ) : (
                  <li>{t.firstBlessing}</li>
                )}
              </ul>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer" aria-hidden="true" />

      <button
        type="button"
        className="chat-fab"
        onClick={() => {
          if (chatOpen) {
            closeChatAndRefresh();
            return;
          }
          setChatOpen(true);
        }}
        aria-label={chat.open}
        title={chat.open}
      >
        <img
          className="chat-guide-img"
          src={`${import.meta.env.BASE_URL}images/ai%20bot.png`}
          alt=""
          aria-hidden="true"
        />
        <span className="chat-fab-text">{chat.open}</span>
      </button>

      {chatOpen ? (
        <section className="chat-widget" aria-live="polite">
          <header>
            <div>
              <strong>{chat.title}</strong>
              <span>{chat.subtitle}</span>
            </div>
            <button type="button" className="chat-close" onClick={closeChatAndRefresh} aria-label={t.close}>
              ×
            </button>
          </header>
          <div className="chat-messages" ref={chatMessagesRef}>
            {chatMessages.map((item) => (
              <p key={item.id} className={item.sender === "user" ? "chat-user" : "chat-bot"}>
                {renderChatText(item.text)}
              </p>
            ))}
            {chatLoading ? (
              <p className="chat-bot chat-typing" aria-label="Bot is typing">
                <span />
                <span />
                <span />
              </p>
            ) : null}
          </div>
          {!hasUserChatted ? (
            <div className="chat-prompts">
              {chat.prompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => sendChatMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}
          {chatQuickActions ? (
            <div className="chat-prompts">
              {chat.prompts.map((prompt) => (
                <button key={`quick-${prompt}`} type="button" onClick={() => sendChatMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}
          {chatPending === "language" ? (
            <div className="chat-language-options">
              <button type="button" onClick={() => chooseLanguage("hi")}>
                {t.languageHindi}
              </button>
              <button type="button" onClick={() => chooseLanguage("en")}>
                {t.languageEnglish}
              </button>
              <button type="button" onClick={() => chooseLanguage("mai")}>
                {t.languageMaithili}
              </button>
            </div>
          ) : null}
          {chatPending === "venue" ? (
            <div className="chat-venue-options">
              <button type="button" onClick={() => sendChatMessage("Shagun")}>
                {t.shagunCeremony}
              </button>
              <button type="button" onClick={() => sendChatMessage("Wedding")}>
                {t.weddingNight}
              </button>
            </div>
          ) : null}
          {chatPending === "timing" ? (
            <div className="chat-venue-options">
              <button type="button" onClick={() => sendChatMessage("Shagun")}>
                {t.shagunCeremony}
              </button>
              <button type="button" onClick={() => sendChatMessage("Wedding")}>
                {t.weddingNight}
              </button>
            </div>
          ) : null}
          {chatPending === "confirmation" ? (
            <div className="chat-confirm-action">
              <button type="button" onClick={goToConfirmationSection}>
                {chat.goToConfirmation}
              </button>
            </div>
          ) : null}
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              sendChatMessage();
            }}
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={chat.placeholder}
            />
            <button type="submit">{chat.send}</button>
          </form>
        </section>
      ) : null}

      {selectedPhoto ? (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setSelectedPhoto(null)}>
          <div className={`lightbox-content ${selectedPhoto.color}`} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedPhoto.title}</h3>
            <div className="lightbox-actions">
              {selectedFolderLink ? (
                <a className="chip" href={selectedFolderLink} target="_blank" rel="noreferrer">
                  {t.viewAlbum}
                </a>
              ) : null}
              {selectedUploadLink ? (
                <a className="chip" href={selectedUploadLink} target="_blank" rel="noreferrer">
                  {t.uploadPhoto}
                </a>
              ) : null}
              <button className="chip" type="button" onClick={() => setSelectedPhoto(null)}>
                {t.close}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default App;

