import React from 'react';
import Navigation from './src/navigation';
import { AuthProvider } from './src/context/AuthContext';
import { NewsProvider } from './src/context/NewsContext';
import { EventsProvider } from './src/context/EventsContext';
import { ResourcesProvider } from './src/context/ResourcesContext';
import { ProfilesProvider } from './src/context/ProfilesContext';
import { SocialProvider } from './src/context/SocialContext';

export default function App() {
  return (
    <AuthProvider>
      <NewsProvider>
        <EventsProvider>
          <ResourcesProvider>
            <ProfilesProvider>
              <SocialProvider>
                <Navigation />
              </SocialProvider>
            </ProfilesProvider>
          </ResourcesProvider>
        </EventsProvider>
      </NewsProvider>
    </AuthProvider>
  );
}
