import { useEffect, useMemo, useRef, useState } from "react";

const weddingDate = new Date("2026-04-27T19:00:00+05:30");
const venueCity = "Madhubani";
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
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "6207398499";
const wishesWhatsappNumber =
  import.meta.env.VITE_WISHES_WHATSAPP_NUMBER || "7992371912";

const timeline = [
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
    title: "The Engagement",
    date: "April 26, 2026",
    text: "Ring ceremony with Maithil geet, marigold fragrance, and promises written in smiles.",
  },
];

const traditions = [
  {
    name: "Madhuparka",
    icon: "01",
    text: "A ritual of sacred hospitality where the groom is welcomed with reverence, sweetness, and divine blessing.",
  },
  {
    name: "Kanyadaan",
    icon: "02",
    text: "The bride's parents offer their daughter with prayerful hearts, marking a deeply emotional and spiritual moment.",
  },
  {
    name: "Panigrahan",
    icon: "03",
    text: "The sacred holding of hands, symbolizing mutual trust, responsibility, and companionship for life.",
  },
  {
    name: "Sindoor Daan",
    icon: "04",
    text: "The groom adorns the bride with sindoor, honoring marital vows in the presence of family and fire.",
  },
  {
    name: "Kohbar Ritual",
    icon: "05",
    text: "In the Kohbar chamber, symbolic Mithila motifs celebrate fertility, harmony, and auspicious beginnings.",
  },
  {
    name: "Maithil Geet",
    icon: "06",
    text: "Traditional songs echo blessings, humor, and ancestral wisdom across every ritual moment.",
  },
];

const gallery = [
  {
    title: "Haldi Courtyard",
    color: "from-mustard to-lotus",
  },
  {
    title: "Grand Entry",
    color: "from-maroon to-gold",
  },
  {
    title: "Varmala Stage",
    color: "from-emerald to-gold",
  },
  {
    title: "Kohbar Art",
    color: "from-lotus to-maroon",
  },
  {
    title: "Sacred Mandap",
    color: "from-gold to-cream",
  },
  {
    title: "Family Blessings",
    color: "from-emerald to-mustard",
  },
];

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

function getAqiMeta(value) {
  if (value <= 50) return { label: "Good", color: "#2E8B57" };
  if (value <= 100) return { label: "Moderate", color: "#E1AD01" };
  if (value <= 200) return { label: "Unhealthy", color: "#FF6F91" };
  if (value <= 300) return { label: "Very Unhealthy", color: "#B1476D" };
  return { label: "Hazardous", color: "#800020" };
}

function getWeatherLabel(code) {
  if ([0].includes(code)) return "Clear Sky";
  if ([1, 2].includes(code)) return "Partly Cloudy";
  if ([3].includes(code)) return "Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain Showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Weather Update";
}

function buildCalendarUrl() {
  const start = "20260427T133000Z";
  const end = "20260427T183000Z";
  const text = encodeURIComponent("Wedding of Sanu & Soni");
  const details = encodeURIComponent(
    "With blessings of both families, join us for a Mithilanchal wedding celebration."
  );
  const location = encodeURIComponent(
    "Madhubani, Bihar, India"
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
}

const initialRsvp = {
  name: "",
  phone: "",
  attendees: "2",
  event: "Wedding Night",
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
  const [weather, setWeather] = useState(initialWeather);
  const [rsvp, setRsvp] = useState(initialRsvp);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const audioRef = useRef(null);

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
          day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
          temp: Math.round(w.daily.temperature_2m_max?.[i] ?? 0).toString(),
          condition: getWeatherLabel(w.daily.weather_code?.[i]),
        }));

        const aqiValue = Math.round(a?.current?.us_aqi ?? 80);

        setWeather({
          loading: false,
          error: "",
          now: {
            temp: Math.round(w.current?.temperature_2m ?? 0).toString(),
            condition: getWeatherLabel(w.current?.weather_code),
            humidity: Math.round(w.current?.relative_humidity_2m ?? 0).toString(),
            wind: Math.round(w.current?.wind_speed_10m ?? 0).toString(),
          },
          forecast: forecastDaily,
          aqi: aqiValue,
        });
      } catch {
        setWeather({
          loading: false,
          error: "Live weather is currently unavailable.",
          now: null,
          forecast: [],
          aqi: null,
        });
      }
    }

    loadWeather();
  }, []);

  const aqiMeta = useMemo(() => getAqiMeta(weather.aqi || 0), [weather.aqi]);

  function handleRsvpSubmit(event) {
    event.preventDefault();

    if (!rsvp.name.trim() || !rsvp.phone.trim()) {
      return;
    }

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
    const messageForWhatsapp = `Guest Blessing: ${text}`;
    const wallWhatsappLink = `https://wa.me/${wishesWhatsappNumber}?text=${encodeURIComponent(
      messageForWhatsapp
    )}`;
    window.open(wallWhatsappLink, "_blank", "noopener,noreferrer");
    setMessageInput("");
  }

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Graciously Confirm: I would like to confirm my presence for your wedding celebration."
  )}`;

  return (
    <>
      <audio ref={audioRef} loop src={shehnaiSrc} preload="none" />

      <div className="loader" aria-hidden="true">
        <div className="crest">SS</div>
      </div>

      <header className="topbar">
        <p className="brand">SS Wedding</p>
        <div className="actions">
          <button onClick={() => setDarkMode((v) => !v)} className="chip">
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={() => setAudioOn((v) => !v)}
            className="chip"
            disabled={!shehnaiSrc}
            title={
              shehnaiSrc
                ? "Toggle shehnai music"
                : "Set VITE_SHEHNAI_AUDIO_URL to enable music"
            }
          >
            {audioOn ? "Mute Music" : "Play Music"}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="hero">
          <div className="hero-overlay" />
          <div className="royal-frame" />
          <div className="hero-content">
            <p className="eyebrow">Together with their families</p>
            <h1 className="shimmer">Sanu & Soni</h1>
            <p className="date-line">Monday, April 27, 2026 | Madhubani, Bihar</p>

            <div className="mini-countdown">
              {["days", "hours", "minutes", "seconds"].map((key) => (
                <article key={key}>
                  <strong>{String(countdown[key]).padStart(2, "0")}</strong>
                  <span>{key}</span>
                </article>
              ))}
            </div>

            <div className="hero-buttons">
              <a className="btn" href="#rsvp">
                Accept Now
              </a>
              <a className="btn btn-outline" href={buildCalendarUrl()} target="_blank" rel="noreferrer">
                Add to Calendar
              </a>
            </div>
          </div>
          <div className="scroll-indicator" aria-hidden="true" />
        </section>

        <section className="section story" id="story">
          <h2>Our Story</h2>
          <p className="section-subtitle">A timeline of moments that led us to forever.</p>
          <div className="timeline">
            {timeline.map((item) => (
              <article key={item.title} className="timeline-card reveal">
                <p>{item.date}</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section shagun" id="shagun">
          <h2>Shagun Ceremony</h2>
          <div className="gold-card reveal">
            <dl>
              <div>
                <dt>Date</dt>
                <dd>April 24, 2026</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>6:30 PM onwards</dd>
              </div>
              <div>
                <dt>Venue</dt>
                <dd>Putai, Bihar</dd>
              </div>
              <div>
                <dt>Dress Code</dt>
                <dd>Traditional Festive Gold / Maroon</dd>
              </div>
            </dl>
            <p>
              In Mithilanchal tradition, Shagun marks the graceful beginning of sacred wedding rites,
              where blessings, gifts, and goodwill flow between families.
            </p>
          </div>
        </section>

        <section className="section baraat" id="baraat">
          <h2>Baraat Experience</h2>
          <div className="procession reveal" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="grid-two">
            <article className="glass-card">
              <h3>Departure Time</h3>
              <p>5:00 PM from Putai</p>
            </article>
            <article className="glass-card">
              <h3>Route Preview</h3>
              <p>Putai -&gt; Madhubani Town -&gt; Wedding Venue</p>
            </article>
            <article className="glass-card">
              <h3>Contact Person</h3>
              <p>Pappu Ji: 123456789</p>
            </article>
          </div>
        </section>

        <section className="section venue" id="venue">
          <h2>Grand Venue</h2>
          <div className="venue-grid">
            <article className="gold-card">
              <h3>mudhubani hotel</h3>
              <p>Madhubani, Bihar 847211</p>
              <a className="btn" href="https://maps.google.com/?q=mudhubani hotel Madhubani Bihar" target="_blank" rel="noreferrer">
                Open in Google Maps
              </a>
              <ul>
                <li>Nearest Railway Station: Darbhanga Junction (5.8 km)</li>
                <li>Nearest Airport: Darbhanga Airport (8.1 km)</li>
                <li>Landmark: to be update</li>
              </ul>
            </article>
            <div className="map-frame">
              <iframe
                src={mapsEmbedUrl}
                loading="lazy"
                title="Wedding venue map"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        <section className="section weather" id="weather">
          <h2>Live Weather & AQI</h2>
          <p className="section-subtitle">Auto-updated for {venueCity}</p>
          {weather.loading ? <p>Loading weather details...</p> : null}
          {weather.error ? <p className="notice">{weather.error}</p> : null}
          {weather.now ? (
            <div className="grid-three">
              <article className="glass-card">
                <h3>{weather.now.temp}°C</h3>
                <p>{weather.now.condition}</p>
              </article>
              <article className="glass-card">
                <h3>{weather.now.humidity}%</h3>
                <p>Humidity</p>
              </article>
              <article className="glass-card">
                <h3>{weather.now.wind} km/h</h3>
                <p>Wind Speed</p>
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
          <h2>Countdown to the Grand Celebration</h2>
          <div className="big-counter">
            {["days", "hours", "minutes", "seconds"].map((key) => (
              <article key={key}>
                <strong>{String(countdown[key]).padStart(2, "0")}</strong>
                <span>{key}</span>
              </article>
            ))}
          </div>

          {countdown.ended ? (
            <div className="celebrate-box">
              <div className="confetti" aria-hidden="true">
                {Array.from({ length: 30 }).map((_, i) => (
                  <span key={i} style={{ "--i": i }} />
                ))}
              </div>
              <p>The sacred hour has arrived. Welcome to the wedding celebration.</p>
            </div>
          ) : null}
        </section>

        <section className="section traditions" id="traditions">
          <h2>Mithilanchal Wedding Traditions</h2>
          <div className="ritual-grid">
            {traditions.map((ritual) => (
              <article key={ritual.name} className="ritual-card reveal">
                <div className="ritual-icon">{ritual.icon}</div>
                <h3>{ritual.name}</h3>
                <p>{ritual.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section gallery" id="gallery">
          <h2>Wedding Gallery</h2>
          <div className="gallery-grid">
            {gallery.map((item) => (
              <button
                type="button"
                key={item.title}
                className={`photo-card ${item.color}`}
                onClick={() => setSelectedPhoto(item)}
              >
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="section rsvp" id="rsvp">
          <h2>Confirmation and Blessings</h2>
          <div className="grid-two">
            <form className="gold-card" onSubmit={handleRsvpSubmit}>
              <label>
                Full Name
                <input
                  required
                  value={rsvp.name}
                  onChange={(e) => setRsvp((prev) => ({ ...prev, name: e.target.value }))}
                />
              </label>
              <label>
                Phone Number
                <input
                  required
                  pattern="[0-9+ ]{8,}"
                  value={rsvp.phone}
                  onChange={(e) => setRsvp((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </label>
              <label>
                Number of Guests
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
                Ceremony
                <select
                  value={rsvp.event}
                  onChange={(e) => setRsvp((prev) => ({ ...prev, event: e.target.value }))}
                >
                  <option>Shagun Ceremony</option>
                  <option>Wedding Night</option>
                </select>
              </label>
              <div className="form-actions">
                <button className="btn" type="submit">
                  Confirm Now
                </button>
                <a className="btn btn-outline" href={whatsappLink} target="_blank" rel="noreferrer">
                  WhatsApp Confirm
                </a>
              </div>
              {rsvpSubmitted ? <p className="notice">Thank you. Your RSVP has been recorded.</p> : null}
              {invitationPdf ? (
                <a className="text-link" href={invitationPdf} target="_blank" rel="noreferrer">
                  Download Invitation PDF
                </a>
              ) : (
                <p className="notice">Set VITE_INVITATION_PDF_URL to enable PDF download.</p>
              )}
            </form>

            <article className="gold-card message-wall">
              <h3>Guest Message Wall</h3>
              <div className="message-form">
                <textarea
                  rows={3}
                  placeholder="Share your blessing..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button className="btn" type="button" onClick={handleAddMessage}>
                  Post Message
                </button>
              </div>
              <ul>
                {messages.length ? (
                  messages.map((msg) => <li key={msg.id}>{msg.text}</li>)
                ) : (
                  <li>Be the first to bless the couple.</li>
                )}
              </ul>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Developed by Harshit</p>
      </footer>

      {selectedPhoto ? (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setSelectedPhoto(null)}>
          <div className={`lightbox-content ${selectedPhoto.color}`} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedPhoto.title}</h3>
            <button className="chip" type="button" onClick={() => setSelectedPhoto(null)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default App;
