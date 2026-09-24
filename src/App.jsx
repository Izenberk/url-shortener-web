import { useState } from "react";
import './App.css';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!longUrl) return;

    setLoading(true);
    setError('');
    setCopied(false);

    try {
      // Using a clean, free public endpoint
      const response = await fetch('http://localhost:3000/api/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: longUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten the URL');
      }

      setShortUrl(data.short)
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset feedback after 2s
  };

  return (
    <div className="container">
      <h1>✂ URL Shortener</h1>
      <p>Paste your long, messy link to get a clean, bite-sized short link.</p>

      <form onSubmit={handleSubmit} className="shortener-form">
        <input
          type="url"
          placeholder="https://example.com"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Shortening...':'Shorten'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {shortUrl && (
        <div className="result-card">
          <div className="result-text">
            <span>Short Link:</span>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
          </div>
          <button
            onClick={handleCopy}
            className={`copy-btn ${copied ? 'copied' : ''}`}
          >
            {copied ? '✅ Copied' : '📋 Copy'}
          </button>
        </div>
      )}
    </div>
  )
}

export default App;