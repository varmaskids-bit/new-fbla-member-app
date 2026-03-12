import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Navigation from './src/navigation';
import { AuthProvider } from './src/context/AuthContext';
import { NewsProvider } from './src/context/NewsContext';
import { EventsProvider } from './src/context/EventsContext';
import { ResourcesProvider } from './src/context/ResourcesContext';
import { ProfilesProvider } from './src/context/ProfilesContext';
import { SocialProvider } from './src/context/SocialContext';
import { ChatProvider } from './src/context/ChatContext';

// ─── Error Boundary ───────────────────────────────────────────────────────────
interface ErrorBoundaryState { hasError: boolean; error: Error | null }
class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={eb.container}>
          <Text style={eb.title}>Something went wrong</Text>
          <Text style={eb.msg}>{this.state.error?.message ?? 'Unknown error'}</Text>
          <TouchableOpacity style={eb.btn} onPress={() => this.setState({ hasError: false, error: null })}>
            <Text style={eb.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const eb = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#D00', marginBottom: 12 },
  msg: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 24 },
  btn: { backgroundColor: '#1E66FF', paddingVertical: 10, paddingHorizontal: 28, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NewsProvider>
          <EventsProvider>
            <ResourcesProvider>
              <ProfilesProvider>
                <SocialProvider>
                  <ChatProvider>
                    <Navigation />
                  </ChatProvider>
                </SocialProvider>
              </ProfilesProvider>
            </ResourcesProvider>
          </EventsProvider>
        </NewsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

