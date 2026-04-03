import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { GatePage } from '@/pages/GatePage';
import { VaultPage } from '@/pages/VaultPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            border: '4px solid black',
            boxShadow: '4px 4px 0 0 rgba(62, 2, 75, 0.3)',
            fontFamily: 'Space Grotesk, sans-serif',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<GatePage />} />
        <Route path="/vault" element={<VaultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
