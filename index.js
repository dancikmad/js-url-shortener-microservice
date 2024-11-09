require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));


// In-memory storage for URLs and their shortened versions
let urlDatabase = {};
let urlCounter = 1;


// Function to validate URL format
function isValidUrl(string) {
  try {
    // Checks if the URL has a valid protocol and hostname
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", (req, res) => {
  const { url: originalUrl } = req.body;

  // Validate the provided URL
  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url'});
  }

  // Store the URL with a unique identifier if it hasn't been added yet
  if (!urlDatabase[originalUrl]) {
    urlDatabase[originalUrl] = urlCounter;
    urlDatabase[urlCounter] = originalUrl;
    urlCounter++;
  }

  // Respond with the original and shortened URL
  res.json({
    original_url: originalUrl,
    short_url: urlDatabase[originalUrl]
  });
});

// endpoint to redirect using the short URL
app.get('/api/shorturl/:shortUrl', (req, res) => {
  const shortUrl = parseInt(req.params.shortUrl, 10);
  const originalUrl = urlDatabase[shortUrl];

  // Redirect to the original URL if it exists
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "No short URL found for the given input"});
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
