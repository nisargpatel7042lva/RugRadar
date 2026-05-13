import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export function useNewListings(pollInterval = 30000) {
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const seenAddresses = useRef(new Set())
  const isFirstFetch = useRef(true)

  const fetchData = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await axios.get(`${API_BASE}/new-listings`)
      const newTokens = res.data.tokens || []

      if (!isFirstFetch.current) {
        const newHighRisk = newTokens.filter(
          (t) =>
            t.rugScore?.level === 'HIGH RISK' &&
            !seenAddresses.current.has(t.address)
        )
        if (newHighRisk.length > 0) {
          toast(`🚨 ${newHighRisk.length} new HIGH RISK token(s) detected`, {
            icon: '🚨',
            duration: 5000,
            style: {
              background: '#1a0a0a',
              border: '1px solid #ef4444',
              color: '#f1f5f9',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
            },
          })
        }
      }

      newTokens.forEach((t) => seenAddresses.current.add(t.address))
      setTokens(newTokens)
      setLastUpdated(res.data.timestamp || new Date().toISOString())
      setError(null)
      isFirstFetch.current = false
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setRefreshing(false)
      if (isFirstFetch.current) {
        setLoading(false)
        isFirstFetch.current = false
      } else {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, pollInterval)
    return () => clearInterval(interval)
  }, [fetchData, pollInterval])

  return { tokens, loading, refreshing, error, lastUpdated, refresh: fetchData }
}

export function useTokenDetail(address) {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!address) return
    setLoading(true)
    setError(null)
    setToken(null)

    axios
      .get(`${API_BASE}/token/${address}`)
      .then((res) => {
        setToken(res.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message)
        setLoading(false)
      })
  }, [address])

  return { token, loading, error }
}

export function useTrending() {
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get(`${API_BASE}/trending`)
      .then((res) => {
        setTrending(res.data.tokens || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { trending, loading }
}
