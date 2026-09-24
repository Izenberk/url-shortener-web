import { useRef, useState } from 'react';
import './App.css';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiryHours, setExpiryHours] = useState('24');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [error, setError] = useState('');
  const requestVersion = useRef(0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    requestVersion.current += 1;
    setResult(null);
    setError('');
    setCopied(false);
    setCopyError('');
    setCopying(false);

    const url = longUrl.trim();
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
        throw new Error();
      }
    } catch {
      setError('Enter a complete URL starting with http:// or https://.');
      return;
    }

    if (customCode !== '' && !/^[A-Za-z0-9_-]{3,32}$/.test(customCode)) {
      setError('Custom code must be 3–32 characters: letters, digits, hyphens or underscores.');
      return;
    }

    const expiry = expiryHours === '' ? 0 : Number(expiryHours);
    if (!Number.isInteger(expiry) || expiry < 0 || expiry > 720) {
      setError('Expiry must be a whole number from 1 to 720 hours, or 0 for the default.');
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('http://localhost:3000/api/v1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, short: customCode, expiry }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || `Request failed (${response.status}). Please try again.`);
      }
      if (typeof data?.short !== 'string' || !data.short) {
        throw new Error('The server returned an invalid short link. Please try again.');
      }
      setResult({ short: data.short, expiry: data.expiry });
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('The request timed out. Please try again.');
      } else if (err instanceof TypeError) {
        setError('Cannot reach the API. Check your connection and that the backend is running.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result || copying) return;
    const version = requestVersion.current;
    setCopying(true);
    setCopied(false);
    setCopyError('');
    try {
      await navigator.clipboard.writeText(result.short);
      // Ignore completion if another link request has started.
      if (version === requestVersion.current) setCopied(true);
    } catch {
      if (version === requestVersion.current) {
        setCopyError('Could not copy automatically. Select and copy the link manually.');
      }
    } finally {
      if (version === requestVersion.current) setCopying(false);
    }
  };

  return (
    <main className="container">
      <header>
        <span className="eyebrow">SMALL LINKS. SIMPLE SHARING.</span>
        <h1>URL Shortener</h1>
        <p className="intro">Make a long link easier to share. Choose a name and how long it stays active.</p>
      </header>

      <form onSubmit={handleSubmit} className="shortener-form" aria-busy={loading}>
        <fieldset disabled={loading}>
          <div className="field">
            <label htmlFor="long-url">Destination URL</label>
            <input id="long-url" type="url" placeholder="https://example.com/your-long-link"
              value={longUrl} onChange={(e) => setLongUrl(e.target.value)}
              aria-describedby="url-hint" required />
            <small id="url-hint">Include http:// or https://.</small>
          </div>

          <div className="options-grid">
            <div className="field">
              <label htmlFor="custom-code">Custom code <span>(optional)</span></label>
              <input id="custom-code" type="text" placeholder="my-link"
                value={customCode} onChange={(e) => setCustomCode(e.target.value)}
                minLength={3} maxLength={32} pattern="[A-Za-z0-9_\-]{3,32}"
                autoCapitalize="none" spellCheck={false} aria-describedby="code-hint" />
              <small id="code-hint">3–32 letters, digits, - or _. Leave blank for a random code.</small>
            </div>
            <div className="field">
              <label htmlFor="expiry">Expiry <span>(hours)</span></label>
              <input id="expiry" type="number" min="0" max="720" step="1"
                placeholder="24" value={expiryHours}
                onChange={(e) => setExpiryHours(e.target.value)} aria-describedby="expiry-hint" />
              <small id="expiry-hint">1–720 hours. Blank or 0 uses 24 hours.</small>
            </div>
          </div>
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? 'Creating your link…' : 'Create short link'}
          </button>
        </fieldset>
      </form>

      {error && <p className="error-message" role="alert">{error}</p>}
      <div aria-live="polite" aria-atomic="true">
        {result && (
          <section className="result-card" aria-label="Created short link">
            <div className="result-heading">
              <h2>Your link is ready</h2>
              <span className="success-dot" aria-hidden="true">✓</span>
            </div>
            <a className="short-link" href={result.short} target="_blank" rel="noopener noreferrer">
              {result.short}
            </a>
            <div className="result-footer">
              <p>Link lifetime: {result.expiry} hours from creation.</p>
              <button type="button" onClick={handleCopy} disabled={copying}
                className={`copy-btn ${copied ? 'copied' : ''}`}>
                {copying ? 'Copying…' : copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
            {copyError && <p className="copy-error">{copyError}</p>}
          </section>
        )}
      </div>
      <p className="footer-note">No account needed. Links stop working when they expire.</p>
    </main>
  );
}

export default App;
