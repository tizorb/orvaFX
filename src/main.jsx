
  import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { supabase } from '@/lib/supabaseClient';
import { configureDefaultBuckets } from '@/lib/supabaseStorage';

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log("User signed in, attempting to configure default buckets...");
    configureDefaultBuckets().catch(error => {
      console.error("Error during configureDefaultBuckets on SIGNED_IN:", error);
    });
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
