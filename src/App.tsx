import { Redirect, Route, useHistory, useLocation } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { LazarilloMap } from '@lzdevelopers/lazarillo-maps';
import { useEffect } from 'react';
import Home from './pages/home/Home';
import MenuPage from './pages/menu/MenuPage';
import SubplacesListPage from './pages/scenarios/SubplacesListPage';
import PlaceProfilePage from './pages/scenarios/PlaceProfilePage';
import MapDirectPage from './pages/scenarios/MapDirectPage';
import { ParentPlaceProvider } from './contexts/ParentPlaceContext';
import { PerfMetricsProvider } from './contexts/PerfMetricsContext';
import { API_KEY } from './config';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Perf badge shared styling */
import './components/perf/PerfBadge.css';

setupIonicReact({
  mode: 'md'
});

// Capacitor iOS WKWebView restores the previous session URL on cold launch, so
// after upgrading the bundle the app would still land on whatever path was last
// shown (e.g. /home). Force-replace the path before React Router mounts so the
// Lab menu is always the entry point. Browser builds running at `/` are unaffected.
if (typeof window !== 'undefined') {
  const path = window.location.pathname;
  // eslint-disable-next-line no-console
  console.log('[App] initial pathname =', JSON.stringify(path));
  if (path === '/' || path === '' || path === '/home' || path === '/index.html') {
    window.history.replaceState(null, '', '/menu');
  }
}

// React-side guard: if React Router ends up on /home on first mount (because
// Capacitor restored the previous session URL after our top-of-module replace
// already ran), bounce to /menu programmatically. Subsequent user navigation
// to /home via the "Original demo" link is respected because the redirect is
// gated to the first render only.
function FirstMountRedirect() {
  const history = useHistory();
  const location = useLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[App] mounted at', location.pathname);
    if (location.pathname === '/home' || location.pathname === '/' || location.pathname === '') {
      history.replace('/menu');
    }
  }, []);
  return null;
}

const App: React.FC = () => {
  // Warm start: initialize the SDK before the user picks a place. On Android this
  // also wires up the 50 MB OkHttp cache (via LzSdkManager.initialize → LzApiBuilder)
  // so the very first getAvailablePlaces/getSubPlaces requests can populate it.
  // Idempotent — subsequent initializeLazarilloPlugin calls reuse the SDK setup.
  useEffect(() => {
    LazarilloMap.initializeLazarilloPlugin({ apiKey: API_KEY }).catch((err) => {
      console.warn('Lazarillo warm start failed', err);
    });
  }, []);

  return (
    <IonApp>
      <PerfMetricsProvider>
        <ParentPlaceProvider>
          <IonReactRouter>
            <FirstMountRedirect />
            <IonRouterOutlet>
              {/* IonRouterOutlet picks the FIRST matching child route. Putting the
                  root redirect ahead of the explicit `/home` route is what makes
                  iOS WKWebView land on /menu on cold launch — without this it
                  was bypassing the redirect and rendering Home directly. */}
              <Route exact path="/">
                <Redirect to="/menu" />
              </Route>
              <Route exact path="/menu">
                <MenuPage />
              </Route>
              <Route exact path="/scenario/list">
                <SubplacesListPage />
              </Route>
              <Route exact path="/scenario/profile">
                <PlaceProfilePage />
              </Route>
              <Route exact path="/scenario/map">
                <MapDirectPage />
              </Route>
              <Route exact path="/home">
                <Home />
              </Route>
            </IonRouterOutlet>
          </IonReactRouter>
        </ParentPlaceProvider>
      </PerfMetricsProvider>
    </IonApp>
  );
};

export default App;
