const albums = [
  {
    title: "Shagun Ceremony",
    url: "https://drive.google.com/drive/folders/19TjjIsKZkT5rnssreugnOnBPnM8pQJhI",
  },
  {
    title: "Wedding Ceremony",
    url: "https://drive.google.com/drive/folders/1RC3PxDFvFDu-aIx6DAeKacUZFaz9m232?usp=drive_link",
  },
];

function App() {
  return (
    <main className="gallery-page">
      <section className="gallery-hero">
        <div className="hero-content">
          <h1>Wedding Gallery</h1>
          <p>A collection of memories from the celebration.</p>
        </div>
      </section>

      <section className="gallery-section" aria-label="Wedding albums">
        <div className="album-grid">
          {albums.map((album) => (
            <article className="glass-card" key={album.title}>
              <h2>{album.title}</h2>
              <a className="open-button" href={album.url} target="_blank" rel="noreferrer">
                Open
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
