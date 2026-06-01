import { useEffect, useRef } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { LazarilloMap } from '@lzdevelopers/lazarillo-maps'
import { App as CapacitorApp, URLOpenListenerEvent } from '@capacitor/app'
import { Place } from '../components/places/Place'
import { useParentPlace } from './ParentPlaceContext'
import { API_KEY } from '../config'

/**
 * Bench harness auto-drive. The bench scripts can't reliably tap Ionic
 * popovers across Android Chromium and iOS WKWebView, so we expose a
 * scriptable entry point via URL.
 *
 *   #bench=<scenario>&parent=<name-or-id>[&place=<name-or-id>]
 *
 * `parent` and `place` match either an exact id (Firebase key) or a
 * case-insensitive substring of `title.default`. The scenario name maps
 * 1:1 to a router path: map_direct → /scenario/map, map_with_place →
 * /scenario/map-with-place, map_with_list → /scenario/map-with-list,
 * list → /scenario/list, profile → /scenario/profile.
 *
 * Three trigger paths into this module:
 *   1. Initial hash on cold launch (web or Capacitor) — read in `useEffect`
 *      against `location.hash`.
 *   2. Capacitor `appUrlOpen` event from a custom URL scheme (lzbench://…)
 *      registered in Info.plist / AndroidManifest. Lets the bench scripts
 *      drive via `xcrun simctl openurl` / `adb shell am start`.
 *   3. Hash mutation from CDP `Runtime.evaluate window.location.hash = …`
 *      — Android already drives this way; the listener picks it up.
 *
 * Idempotent: once a hash drive has resolved we strip it from the URL so
 * navigating back to /menu doesn't reapply.
 */
function parseDirective(input: string): Record<string, string> | null {
  if (!input) return null
  // Accept either a hash (#bench=…) or a query string (?bench=…) or a full
  // lzbench:// URL with either of the above.
  const idx = input.search(/[?#]bench=/)
  if (idx < 0) return null
  const tail = input.slice(idx + 1) // strip the ? or #
  const params: Record<string, string> = {}
  for (const part of tail.split('&')) {
    const [k, v] = part.split('=')
    if (k && v) params[decodeURIComponent(k)] = decodeURIComponent(v)
  }
  return params.bench ? params : null
}

const ROUTES: Record<string, string> = {
  map_direct: '/scenario/map',
  map_with_place: '/scenario/map-with-place',
  map_with_list: '/scenario/map-with-list',
  list: '/scenario/list',
  profile: '/scenario/profile',
}

function matchPlace(places: Place[], needle: string | undefined): Place | undefined {
  if (!needle) return undefined
  const lower = needle.toLowerCase()
  return (
    places.find((p) => p.id === needle) ??
    places.find((p) => (p.title?.default ?? '').toLowerCase().includes(lower))
  )
}

/**
 * Component installs once near the IonReactRouter root. No DOM, no UI.
 */
const BenchAutoDrive: React.FC = () => {
  const history = useHistory()
  const location = useLocation()
  const { setParentPlace } = useParentPlace()
  const consumedRef = useRef(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const drive = async (raw: string, source: string) => {
      if (consumedRef.current) return
      const params = parseDirective(raw)
      if (!params) return
      consumedRef.current = true
      // eslint-disable-next-line no-console
      console.log('[BenchAutoDrive]', source, params)

      const target = ROUTES[params.bench]
      if (!target) {
        console.warn('[BenchAutoDrive] unknown scenario', params.bench)
        return
      }

      try {
        await LazarilloMap.initializeLazarilloPlugin({ apiKey: API_KEY })
        const parents = (await LazarilloMap.getAvailablePlaces(API_KEY)) as Place[]
        const parent = matchPlace(parents, params.parent ?? params.venue)
        if (!parent) {
          console.warn('[BenchAutoDrive] parent not found:', params.parent)
          return
        }
        setParentPlace(parent)

        // If the scenario needs a sub-place id (map_with_place, profile),
        // resolve it before navigating so the page mounts with a known
        // target. We pass it on the URL search instead of context to keep
        // the scenario pages decoupled from the auto-drive state.
        let search = ''
        if (params.place) {
          const sub = (await LazarilloMap.getSubPlaces(parent.id)) as Place[]
          const child = matchPlace(sub, params.place)
          if (child) search = `?placeId=${encodeURIComponent(child.id)}`
        }

        // Strip the bench hash so back-navigation doesn't re-trigger.
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', '/menu')
        }
        history.replace(target + search)
      } catch (err) {
        console.warn('[BenchAutoDrive] failed', err)
      }
    }

    // (1) Initial hash on cold launch — covers Android CDP path
    // (window.location.hash = '#bench=…') and direct hand-typed URLs.
    void drive(window.location.hash || window.location.search, 'initial')

    // (2) Capacitor appUrlOpen event for lzbench:// scheme. Wrapped so the
    // app still builds in environments where @capacitor/app isn't bundled.
    let removeListener: { remove: () => void } | undefined
    CapacitorApp.addListener('appUrlOpen', (evt: URLOpenListenerEvent) => {
      void drive(evt.url, 'appUrlOpen')
    }).then((handle: { remove: () => void }) => {
      removeListener = handle
    }).catch(() => {
      // Not running under Capacitor or plugin missing — harmless.
    })

    // (3) Hash-mutation observer for CDP-driven runs where the bench writes
    // to `location.hash` after mount. `hashchange` fires synchronously.
    const onHashChange = () => {
      void drive(window.location.hash, 'hashchange')
    }
    window.addEventListener('hashchange', onHashChange)

    return () => {
      window.removeEventListener('hashchange', onHashChange)
      removeListener?.remove()
    }
  }, [])

  // Reset the consumed flag if the user manually returns to /menu, so a
  // second bench directive (e.g. driving a different scenario in the same
  // app session) can fire.
  useEffect(() => {
    if (location.pathname === '/menu') consumedRef.current = false
  }, [location.pathname])

  return null
}

export default BenchAutoDrive
