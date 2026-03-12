import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventsContext';
import { useChat } from '../context/ChatContext';

export default function ChatScreen() {
  const { currentUser, users } = useAuth();
  const { events } = useEvents();
  const {
    participants,
    threads,
    getThreadMessages,
    startDirectThread,
    startEventThread,
    openThread,
    closeThread,
    markThreadRead,
    sendMessage,
    simulateIncomingReply,
    hasEventAccess,
    getPendingRequestForEvent,
  } = useChat();

  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState('');
  const [memberQuery, setMemberQuery] = React.useState('');
  const [eventQuery, setEventQuery] = React.useState('');

  const activeThread = React.useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [activeThreadId, threads]
  );

  const activeMessages = React.useMemo(
    () => (activeThreadId ? getThreadMessages(activeThreadId) : []),
    [activeThreadId, getThreadMessages]
  );

  const openThreads = React.useMemo(() => threads.filter((thread) => thread.isOpen), [threads]);
  const closedThreads = React.useMemo(() => threads.filter((thread) => !thread.isOpen), [threads]);

  const filteredMembers = React.useMemo(() => {
    const term = memberQuery.trim().toLowerCase();
    if (!term) return [];
    return participants.filter((member) => {
      if (!currentUser || member.id === currentUser.id) return false;
      return `${member.name} ${member.role}`.toLowerCase().includes(term);
    });
  }, [participants, memberQuery, currentUser]);

  const filteredEvents = React.useMemo(() => {
    const term = eventQuery.trim().toLowerCase();
    if (!term) return [];
    return [...events]
      .filter((event) => `${event.title} ${event.location || ''}`.toLowerCase().includes(term))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [events, eventQuery]);

  function openOrCreateDirectChat(memberId: string) {
    const id = startDirectThread(memberId);
    if (id) {
      setActiveThreadId(id);
      markThreadRead(id);
    }
  }

  function openOrCreateEventChat(eventId: string) {
    const result = startEventThread(eventId);
    if (!result) return;
    if (result.status === 'opened' && result.threadId) {
      setActiveThreadId(result.threadId);
      markThreadRead(result.threadId);
    }
  }

  function selectThread(threadId: string) {
    openThread(threadId);
    markThreadRead(threadId);
    setActiveThreadId(threadId);
  }

  function closeSession(threadId: string) {
    closeThread(threadId);
    if (activeThreadId === threadId) {
      const nextThread = openThreads.find((thread) => thread.id !== threadId);
      setActiveThreadId(nextThread?.id ?? null);
    }
  }

  function reopenSession(threadId: string) {
    openThread(threadId);
    setActiveThreadId(threadId);
    markThreadRead(threadId);
  }

  function handleSend() {
    if (!activeThreadId) return;
    sendMessage(activeThreadId, draft);
    setDraft('');
  }

  function renderThreadCard(thread: typeof threads[number], closed = false) {
    const isActive = thread.id === activeThreadId;
    return (
      <View style={[styles.threadCard, isActive && styles.threadCardActive, closed && styles.threadCardClosed]}>
        <TouchableOpacity style={styles.threadInfo} onPress={() => (closed ? reopenSession(thread.id) : selectThread(thread.id))}>
          <View style={styles.threadTitleRow}>
            <Text style={styles.threadName}>{thread.title}</Text>
            {thread.unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{thread.unreadCount}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.threadPreview} numberOfLines={1}>
            {thread.lastMessagePreview || (thread.type === 'event' ? 'Event group chat' : 'Direct conversation')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sessionButton, closed ? styles.reopenButton : styles.closeButton]}
          onPress={() => (closed ? reopenSession(thread.id) : closeSession(thread.id))}
        >
          <Text style={[styles.sessionButtonText, closed ? styles.reopenButtonText : styles.closeButtonText]}>
            {closed ? 'Open' : 'Close'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
      >
        <View style={styles.container}>
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Open chats</Text>
          <FlatList
            data={openThreads}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderThreadCard(item)}
            ListEmptyComponent={<Text style={styles.empty}>No open chat sessions yet.</Text>}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />

          <Text style={[styles.sectionTitle, styles.spacedSection]}>Closed chats</Text>
          <FlatList
            data={closedThreads}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderThreadCard(item, true)}
            ListEmptyComponent={<Text style={styles.empty}>No closed chat sessions.</Text>}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />

          <Text style={[styles.sectionTitle, styles.spacedSection]}>Start member chat</Text>
          <TextInput
            placeholder="Search members"
            value={memberQuery}
            onChangeText={setMemberQuery}
            style={styles.searchInput}
            autoCapitalize="none"
          />
          <FlatList
            data={filteredMembers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.selectorCard} onPress={() => openOrCreateDirectChat(item.id)}>
                <Text style={styles.selectorTitle}>{item.name}</Text>
                <Text style={styles.selectorMeta}>{item.role}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Search for a member to start chatting.</Text>}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />

          <Text style={[styles.sectionTitle, styles.spacedSection]}>Start event chat</Text>
          <TextInput
            placeholder="Search events"
            value={eventQuery}
            onChangeText={setEventQuery}
            style={styles.searchInput}
            autoCapitalize="none"
          />
          <FlatList
            data={filteredEvents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.selectorCard}>
                <TouchableOpacity onPress={() => openOrCreateEventChat(item.id)}>
                  <Text style={styles.selectorTitle}>{item.title}</Text>
                  <Text style={styles.selectorMeta}>{item.location || 'Event group'}</Text>
                  {!hasEventAccess(item.id) ? (
                    <Text style={styles.requestNote}>
                      Invite required. Request goes to {getPendingRequestForEvent(item.id)?.approverName || 'the event admin'}.
                    </Text>
                  ) : null}
                  {getPendingRequestForEvent(item.id) ? <Text style={styles.pendingBadge}>Approval pending</Text> : null}
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Search for an event to start or request chat access.</Text>}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />
          </ScrollView>
        </View>

        <View style={styles.chatPanel}>
          <View style={styles.threadHeader}>
            <Text style={styles.panelTitle}>{activeThread?.title || 'Choose an open chat session'}</Text>
            {activeThread ? (
              <>
                <Text style={styles.panelSubtitle}>
                  {activeThread.type === 'event'
                    ? `${activeThread.participantIds.length} members in this event chat`
                    : activeThread.participantIds
                        .filter((id) => id !== currentUser?.id)
                        .map((id) => users[id]?.name || users[id]?.username || users[id]?.email)
                        .join(', ')}
                </Text>
                <View style={styles.panelActions}>
                  <TouchableOpacity style={styles.inlineAction} onPress={() => simulateIncomingReply(activeThread.id)}>
                    <Text style={styles.inlineActionText}>Simulate new message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.inlineAction} onPress={() => closeSession(activeThread.id)}>
                    <Text style={styles.inlineActionText}>Close session</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>

          {activeThread ? (
            <>
              <FlatList
                data={activeMessages}
                keyExtractor={(item) => item.id}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContainer}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const mine = item.senderId === currentUser?.id;
                  const sender = users[item.senderId];
                  return (
                    <View style={[styles.messageBubble, mine ? styles.myMessage : styles.theirMessage]}>
                      <Text style={[styles.senderName, mine && styles.mySenderName]}>
                        {mine ? 'You' : sender?.name || sender?.username || sender?.email || 'Member'}
                      </Text>
                      <Text style={[styles.messageText, mine && styles.myMessageText]}>{item.body}</Text>
                      <Text style={[styles.timestamp, mine && styles.myTimestamp]}>
                        {new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </View>
                  );
                }}
                ListEmptyComponent={<Text style={styles.empty}>No messages yet. Start the conversation.</Text>}
              />

              <View style={styles.composer}>
                <TextInput
                  placeholder="Type a message"
                  value={draft}
                  onChangeText={setDraft}
                  style={styles.composerInput}
                  multiline
                  textAlignVertical="top"
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                  <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Manage multiple chats</Text>
              <Text style={styles.emptyHint}>
                You can keep several member and event chats open, close sessions when you’re done, and reopen them later from the closed list.
              </Text>
            </View>
          )}
        </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  keyboardArea: { flex: 1 },
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#fff' },
  sidebar: {
    width: '45%',
    borderRightWidth: 1,
    borderRightColor: '#e6eefc',
    padding: 12,
    backgroundColor: '#f8fbff',
  },
  chatPanel: { flex: 1, padding: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0b2b66', marginBottom: 8 },
  spacedSection: { marginTop: 18 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#dbe9ff',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbe9ff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  threadCardActive: {
    borderColor: '#1E66FF',
    backgroundColor: '#eef4ff',
  },
  threadCardClosed: {
    opacity: 0.82,
  },
  threadInfo: { flex: 1 },
  threadTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  threadName: { fontSize: 14, fontWeight: '700', color: '#102a56', flex: 1, marginRight: 8 },
  threadPreview: { fontSize: 12, color: '#5b6b85', marginTop: 4 },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D7263D',
    paddingHorizontal: 6,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  sessionButton: {
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  closeButton: { borderColor: '#D7263D' },
  reopenButton: { borderColor: '#1E66FF' },
  sessionButtonText: { fontWeight: '700', fontSize: 12 },
  closeButtonText: { color: '#D7263D' },
  reopenButtonText: { color: '#1E66FF' },
  selectorCard: {
    borderWidth: 1,
    borderColor: '#dbe9ff',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  selectorTitle: { fontSize: 14, fontWeight: '700', color: '#102a56' },
  selectorMeta: { fontSize: 12, color: '#5b6b85', marginTop: 4 },
  listContent: { paddingBottom: 4 },
  threadHeader: { paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e6eefc', marginBottom: 10 },
  panelTitle: { fontSize: 18, fontWeight: '700', color: '#102a56' },
  panelSubtitle: { marginTop: 4, color: '#5b6b85', fontSize: 12 },
  panelActions: { flexDirection: 'row', marginTop: 10 },
  inlineAction: {
    borderWidth: 1,
    borderColor: '#dbe9ff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  inlineActionText: { color: '#1E66FF', fontWeight: '600', fontSize: 12 },
  messagesList: { flex: 1 },
  messagesContainer: { paddingBottom: 12 },
  messageBubble: {
    maxWidth: '88%',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E66FF',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef4ff',
  },
  senderName: { fontSize: 12, fontWeight: '700', color: '#0b2b66', marginBottom: 4 },
  mySenderName: { color: '#dfe9ff' },
  messageText: { color: '#102a56' },
  myMessageText: { color: '#fff' },
  timestamp: { marginTop: 6, fontSize: 10, color: '#5b6b85' },
  myTimestamp: { color: '#dfe9ff' },
  composer: {
    borderTopWidth: 1,
    borderTopColor: '#e6eefc',
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: '#dbe9ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#1E66FF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendButtonText: { color: '#fff', fontWeight: '700' },
  requestNote: { color: '#8b5a00', fontSize: 12, marginTop: 6 },
  pendingBadge: { color: '#D7263D', fontWeight: '700', marginTop: 6, fontSize: 12 },
  empty: { color: '#73819c', textAlign: 'center', marginTop: 12 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#102a56', marginBottom: 8, textAlign: 'center' },
  emptyHint: { color: '#5b6b85', textAlign: 'center', lineHeight: 20 },
});