import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import NavBar from './components/NavBar'
import LiveFeed from './pages/LiveFeed'
import TokenDeepDive from './pages/TokenDeepDive'
import HallOfShame from './pages/HallOfShame'

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main className="pt-16 min-h-screen bg-bg">
        <Routes>
          <Route path="/" element={<LiveFeed />} />
          <Route path="/token/:address" element={<TokenDeepDive />} />
          <Route path="/hall-of-shame" element={<HallOfShame />} />
        </Routes>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a0a0a',
            border: '1px solid #ef4444',
            color: '#f1f5f9',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
          },
          duration: 5000,
        }}
      />
    </BrowserRouter>
  )
}
