import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useEvents } from './EventsContext';

export type ChatParticipant = {
	id: string;
	name: string;
	role: string;
};

export type ChatThread = {
	id: string;
	type: 'direct' | 'event';
	title: string;
	participantIds: string[];
	eventId?: string;
	updatedAt: string;
	isOpen: boolean;
	unreadCount: number;
	lastMessagePreview?: string;
};

export type ChatMessage = {
	id: string;
	threadId: string;
	senderId: string;
	body: string;
	createdAt: string;
};

export type EventJoinRequest = {
	id: string;
	eventId: string;
	eventTitle: string;
	requesterId: string;
	requesterName: string;
	approverId: string;
	approverName: string;
	status: 'pending' | 'approved';
	createdAt: string;
};

type ChatState = {
	threads: ChatThread[];
	messages: ChatMessage[];
	joinRequests: EventJoinRequest[];
};

type ChatContextValue = {
	participants: ChatParticipant[];
	threads: ChatThread[];
	messages: ChatMessage[];
	joinRequests: EventJoinRequest[];
	getThreadMessages: (threadId: string) => ChatMessage[];
	getThreadById: (threadId: string) => ChatThread | undefined;
	startDirectThread: (memberId: string) => string | null;
	startEventThread: (eventId: string) => { status: 'opened' | 'requested'; threadId?: string; requestId?: string } | null;
	openThread: (threadId: string) => void;
	closeThread: (threadId: string) => void;
	markThreadRead: (threadId: string) => void;
	sendMessage: (threadId: string, body: string) => void;
	simulateIncomingReply: (threadId: string) => void;
	hasEventAccess: (eventId: string) => boolean;
	getPendingRequestForEvent: (eventId: string) => EventJoinRequest | undefined;
};

const KEY = 'fbla:chat:v2';
const ChatContext = React.createContext<ChatContextValue | undefined>(undefined);

function makeId(prefix: string) {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function sortThreads(threads: ChatThread[]) {
	return [...threads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function useChat() {
	const ctx = React.useContext(ChatContext);
	if (!ctx) throw new Error('useChat must be used within ChatProvider');
	return ctx;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
	const { users, currentUser } = useAuth();
	const { events } = useEvents();
	const [state, setState] = React.useState<ChatState>({ threads: [], messages: [], joinRequests: [] });
	const [loaded, setLoaded] = React.useState(false);

	React.useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const raw = await AsyncStorage.getItem(KEY);
				if (raw && mounted) {
					const parsed = JSON.parse(raw) as ChatState;
					setState({
						threads: (parsed.threads || []).map((thread) => ({
							...thread,
							isOpen: thread.isOpen ?? true,
							unreadCount: thread.unreadCount ?? 0,
						})),
						messages: parsed.messages || [],
						joinRequests: parsed.joinRequests || [],
					});
				}
			} catch (error) {
				console.warn('Failed to load chat store', error);
			} finally {
				if (mounted) setLoaded(true);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	React.useEffect(() => {
		if (!loaded) return;
		AsyncStorage.setItem(KEY, JSON.stringify(state)).catch((error) => {
			console.warn('Failed to persist chat store', error);
		});
	}, [loaded, state]);

	const participants = React.useMemo<ChatParticipant[]>(() => {
		return Object.values(users)
			.map((user) => ({
				id: user.id,
				name: user.name || user.username || user.email,
				role: user.role,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [users]);

	const getThreadMessages = React.useCallback(
		(threadId: string) =>
			state.messages
				.filter((message) => message.threadId === threadId)
				.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
		[state.messages]
	);

	const getThreadById = React.useCallback(
		(threadId: string) => state.threads.find((thread) => thread.id === threadId),
		[state.threads]
	);

	const hasEventAccess = React.useCallback(
		(eventId: string) => {
			if (!currentUser) return false;
			if (currentUser.role === 'admin') return true;
			const event = events.find((item) => item.id === eventId);
			if (!event) return false;
			if (event.location?.toLowerCase().includes('online')) return true;
			return currentUser.role !== 'member';
		},
		[currentUser, events]
	);

	const getPendingRequestForEvent = React.useCallback(
		(eventId: string) =>
			state.joinRequests.find(
				(request) => request.eventId === eventId && request.requesterId === currentUser?.id && request.status === 'pending'
			),
		[state.joinRequests, currentUser?.id]
	);

	const upsertExistingThread = React.useCallback((threadId: string) => {
		setState((prev) => ({
			...prev,
			threads: prev.threads.map((thread) =>
				thread.id === threadId ? { ...thread, isOpen: true } : thread
			),
		}));
	}, []);

	const startDirectThread = React.useCallback(
		(memberId: string) => {
			if (!currentUser || memberId === currentUser.id) return null;

			const sortedIds = [currentUser.id, memberId].sort();
			const existing = state.threads.find(
				(thread) =>
					thread.type === 'direct' &&
					thread.participantIds.length === 2 &&
					[...thread.participantIds].sort().join('|') === sortedIds.join('|')
			);

			if (existing) {
				upsertExistingThread(existing.id);
				return existing.id;
			}

			const other = users[memberId];
			if (!other) return null;

			const now = new Date().toISOString();
			const newThread: ChatThread = {
				id: makeId('direct'),
				type: 'direct',
				title: other.name || other.username || other.email,
				participantIds: sortedIds,
				updatedAt: now,
				isOpen: true,
				unreadCount: 0,
				lastMessagePreview: 'Conversation created',
			};

			setState((prev) => ({ ...prev, threads: sortThreads([newThread, ...prev.threads]) }));
			return newThread.id;
		},
		[currentUser, state.threads, upsertExistingThread, users]
	);

	const startEventThread = React.useCallback(
		(eventId: string): { status: 'opened' | 'requested'; threadId?: string; requestId?: string } | null => {
			if (!currentUser) return null;
			if (!hasEventAccess(eventId)) {
				const existingRequest = state.joinRequests.find(
					(request) => request.eventId === eventId && request.requesterId === currentUser.id && request.status === 'pending'
				);
				if (existingRequest) {
					return { status: 'requested', requestId: existingRequest.id };
				}

				const event = events.find((item) => item.id === eventId);
				if (!event) return null;
				const approver =
					Object.values(users).find((user) => user.role === 'admin') ||
					Object.values(users).find((user) => user.role === 'secretary') ||
					currentUser;
				const request: EventJoinRequest = {
					id: makeId('request'),
					eventId,
					eventTitle: event.title,
					requesterId: currentUser.id,
					requesterName: currentUser.name || currentUser.username || currentUser.email,
					approverId: approver.id,
					approverName: approver.name || approver.username || approver.email,
					status: 'pending',
					createdAt: new Date().toISOString(),
				};

				setState((prev) => ({
					...prev,
					joinRequests: [request, ...prev.joinRequests],
				}));
				return { status: 'requested', requestId: request.id };
			}

			const existing = state.threads.find((thread) => thread.type === 'event' && thread.eventId === eventId);
			if (existing) {
				upsertExistingThread(existing.id);
				return { status: 'opened', threadId: existing.id };
			}

			const event = events.find((item) => item.id === eventId);
			if (!event) return null;

			const now = new Date().toISOString();
			const participantIds = Object.values(users)
				.filter((user) => {
					if (!currentUser.chapter) return true;
					return !user.chapter || user.chapter === currentUser.chapter;
				})
				.map((user) => user.id)
				.sort();

			const newThread: ChatThread = {
				id: makeId('event'),
				type: 'event',
				title: `${event.title} Chat`,
				participantIds,
				eventId,
				updatedAt: now,
				isOpen: true,
				unreadCount: 0,
				lastMessagePreview: `Group chat started for ${event.title}`,
			};

			const seedMessage: ChatMessage = {
				id: makeId('msg'),
				threadId: newThread.id,
				senderId: currentUser.id,
				body: `Started the group chat for ${event.title}.`,
				createdAt: now,
			};

			setState((prev) => ({
				threads: sortThreads([newThread, ...prev.threads]),
				messages: [...prev.messages, seedMessage],
				joinRequests: prev.joinRequests.map((request) =>
					request.eventId === eventId && request.requesterId === currentUser.id
						? { ...request, status: 'approved' }
						: request
				),
			}));
			return { status: 'opened', threadId: newThread.id };
		},
		[currentUser, events, hasEventAccess, state.joinRequests, state.threads, upsertExistingThread, users]
	);

	const openThread = React.useCallback((threadId: string) => {
		setState((prev) => ({
			...prev,
			threads: prev.threads.map((thread) =>
				thread.id === threadId ? { ...thread, isOpen: true } : thread
			),
		}));
	}, []);

	const closeThread = React.useCallback((threadId: string) => {
		setState((prev) => ({
			...prev,
			threads: prev.threads.map((thread) =>
				thread.id === threadId ? { ...thread, isOpen: false } : thread
			),
		}));
	}, []);

	const markThreadRead = React.useCallback((threadId: string) => {
		setState((prev) => ({
			...prev,
			threads: prev.threads.map((thread) =>
				thread.id === threadId ? { ...thread, unreadCount: 0 } : thread
			),
		}));
	}, []);

	const sendMessage = React.useCallback(
		(threadId: string, body: string) => {
			if (!currentUser) return;
			const trimmed = body.trim();
			if (!trimmed) return;

			const timestamp = new Date().toISOString();
			const message: ChatMessage = {
				id: makeId('msg'),
				threadId,
				senderId: currentUser.id,
				body: trimmed,
				createdAt: timestamp,
			};

			setState((prev) => ({
				...prev,
				messages: [...prev.messages, message],
				threads: sortThreads(
					prev.threads.map((thread) =>
						thread.id === threadId
							? {
									...thread,
									updatedAt: timestamp,
									isOpen: true,
									unreadCount: 0,
									lastMessagePreview: trimmed,
								}
							: thread
					)
				),
			}));
		},
		[currentUser]
	);

	const simulateIncomingReply = React.useCallback(
		(threadId: string) => {
			if (!currentUser) return;
			const thread = state.threads.find((item) => item.id === threadId);
			if (!thread) return;

			const replySenderId =
				thread.participantIds.find((participantId) => participantId !== currentUser.id) || currentUser.id;
			if (replySenderId === currentUser.id) return;

			const sender = users[replySenderId];
			const senderName = sender?.name || sender?.username || 'Member';
			const timestamp = new Date().toISOString();
			const body =
				thread.type === 'event'
					? `${senderName} replied in ${thread.title}.`
					: `${senderName} sent a new message.`;

			const message: ChatMessage = {
				id: makeId('msg'),
				threadId,
				senderId: replySenderId,
				body,
				createdAt: timestamp,
			};

			setState((prev) => ({
				...prev,
				messages: [...prev.messages, message],
				threads: sortThreads(
					prev.threads.map((item) =>
						item.id === threadId
							? {
									...item,
									updatedAt: timestamp,
									unreadCount: item.unreadCount + 1,
									lastMessagePreview: body,
								}
							: item
					)
				),
			}));
		},
		[currentUser, state.threads, users]
	);

	const value = React.useMemo<ChatContextValue>(
		() => ({
			participants,
			threads: sortThreads(state.threads),
			messages: state.messages,
			joinRequests: state.joinRequests,
			getThreadMessages,
			getThreadById,
			startDirectThread,
			startEventThread,
			openThread,
			closeThread,
			markThreadRead,
			sendMessage,
			simulateIncomingReply,
			hasEventAccess,
			getPendingRequestForEvent,
		}),
		[
			participants,
			state.threads,
			state.messages,
			state.joinRequests,
			getThreadMessages,
			getThreadById,
			startDirectThread,
			startEventThread,
			openThread,
			closeThread,
			markThreadRead,
			sendMessage,
			simulateIncomingReply,
			hasEventAccess,
			getPendingRequestForEvent,
		]
	);

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
