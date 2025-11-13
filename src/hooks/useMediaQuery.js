import { useEffect, useState } from 'react'

/**
 * React hook to track a CSS media query and respond to viewport changes.
 * Defaults to `false` during SSR to avoid hydration mismatches.
 */
export default function useMediaQuery(query) {
  const getMatches = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState(getMatches)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQueryList = window.matchMedia(query)
    const update = (event) => setMatches(event.matches)

    setMatches(mediaQueryList.matches)

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', update)
      return () => mediaQueryList.removeEventListener('change', update)
    }

    mediaQueryList.addListener(update)
    return () => mediaQueryList.removeListener(update)
  }, [query])

  return matches
}
