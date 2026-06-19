import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from './components/ui/sonner'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 minutes — don't refetch if data is fresh
      gcTime: 10 * 60 * 1000,     // 10 minutes — keep in cache
      retry: 1,                    // retry once before reporting error
      refetchOnWindowFocus: false, // don't refetch just because tab was re-focused
    }
  }
})
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>
    <Toaster/>
    <App />
    </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
