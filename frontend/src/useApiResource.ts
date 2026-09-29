import { useEffect, useState } from 'react'

async function apiRequest<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { message?: string } } | null
    throw new Error(body?.error?.message ?? 'The request could not be completed.')
  }
  return response.json() as Promise<T>
}

export function useResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    apiRequest<T>(path, controller.signal)
      .then(setData)
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name === 'AbortError') return
        setError(requestError instanceof Error ? requestError.message : 'The request could not be completed.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [path, attempt])

  return {
    data,
    loading,
    error,
    retry: () => {
      setLoading(true)
      setError('')
      setAttempt((current) => current + 1)
    },
  }
}