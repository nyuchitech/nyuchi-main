import { createRequestHandler } from "@react-router/node";
import * as build from "../build/server/index.js";

const handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
});

export default async function (req, res) {
  // Add Ubuntu philosophy headers
  res.setHeader('X-Ubuntu-Philosophy', 'I am because we are');
  res.setHeader('X-Platform-Identity', 'Nyuchi Africa Platform - Zimbabwe 🇿🇼');
  
  // Handle auth-specific headers
  if (req.url?.startsWith('/api/auth') || req.url?.startsWith('/auth')) {
    res.setHeader('X-Auth-Provider', 'Passage ID');
    res.setHeader('X-Community-Access', 'Always Free');
  }
  
  // Convert Vercel request to standard Request
  const url = new URL(req.url, `https://${req.headers.host}`);
  const request = new Request(url, {
    method: req.method,
    headers: new Headers(req.headers),
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
  });

  try {
    const response = await handler(request);
    
    // Set status and headers
    res.status(response.status);
    
    // Copy response headers
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }
    
    // Send response body
    if (response.body) {
      const text = await response.text();
      res.send(text);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Ubuntu Platform Auth Error:', error);
    
    // Redirect auth errors to friendly error page
    if (req.url?.includes('/auth')) {
      res.redirect('/auth/error?error=' + encodeURIComponent(error.message || 'Authentication failed'));
    } else {
      res.status(500).send('Ubuntu Platform: "I am because we are" - Temporary issue, please try again.');
    }
  }
}