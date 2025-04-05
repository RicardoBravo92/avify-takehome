import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';

// Type guard for null element
const container = document.getElementById('reactMountPoint');
if (!container) {
  throw new Error('Failed to find the root element');
}

// Create a root and render the app
const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
