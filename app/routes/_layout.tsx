import { Outlet, useLocation } from "react-router";
import {
  Frame,
  Navigation,
  TopBar,
} from '@shopify/polaris';
import { 
  HomeIcon, 
  SettingsIcon, 
} from '@shopify/polaris-icons';

export default function Layout() {
  const location = useLocation();

  const topBarMarkup = <TopBar showNavigationToggle />;

  const navigationMarkup = (
    <Navigation location={location.pathname}>
      <Navigation.Section
        title="🇿🇼 Ubuntu Platform"
        items={[
          {
            label: 'Dashboard',
            icon: HomeIcon,
            url: '/',
            selected: location.pathname === '/',
          },
          {
            label: 'Community Hub',
            url: '/community',
            selected: location.pathname.startsWith('/community'),
            badge: 'Always Free',
          },
          {
            label: 'Admin Panel',
            icon: SettingsIcon,
            url: '/admin',
            selected: location.pathname.startsWith('/admin'),
          },
        ]}
      />
    </Navigation>
  );

  return (
    <Frame
      topBar={topBarMarkup}
      navigation={navigationMarkup}
      showMobileNavigation={false}
      onNavigationDismiss={() => {}}
    >
      <Outlet />
    </Frame>
  );
}
