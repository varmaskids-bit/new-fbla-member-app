import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { EventsProvider } from './src/context/EventsContext';
import { ResourcesProvider } from './src/context/ResourcesContext';
import { NewsProvider } from './src/context/NewsContext';
import Navigation from './src/navigation';

export default function App() {
  return (
    <AuthProvider>
      <NewsProvider>
        <EventsProvider>
          <ResourcesProvider>
            <Navigation />
          </ResourcesProvider>
        </EventsProvider>
      </NewsProvider>
    </AuthProvider>
  );
}
