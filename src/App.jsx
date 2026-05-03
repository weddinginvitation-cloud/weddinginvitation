const albumUrl = "https://drive.google.com/drive/folders/19TjjIsKZkT5rnssreugnOnBPnM8pQJhI";

const albums = ["Shagun Ceremony", "Wedding Ceremony"];

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
          {albums.map((title) => (
            <article className="glass-card" key={title}>
              <h2>{title}</h2>
              <a className="open-button" href={albumUrl} target="_blank" rel="noreferrer">
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
