import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, ChevronLeft } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import { chatApi } from '@/shared/api/chatAPI';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getWebSocketUrl } from '@/shared/utils/websocket';
import type { ChatMessage } from '@/shared/types/Chat.types';

const ChatRoomPage: React.FC = () => {
    const params = useParams<{ meetingId: string }>();
    const meetingId = params.meetingId;
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    // 테스트를 위한 임시 유저 (로그인 안 된 경우)
    const [guestId] = useState(() => guest-);
    const myId = user?.userId ? String(user.userId) : guestId;

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const stompClient = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auth Store에서 토큰 가져오기 (WebSocket 인증용)
    const token = useAuthStore((state) => state.accessToken);

    // 데모용 Fallback: meetingId가 없으면 1로 설정
    const parsedMeetingId = meetingId ? Number(meetingId) : 1;

    // 시간 포맷팅 함수
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? '오후' : '오전';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return ${ampm} :;
    };

    // 1. 기존 메시지 불러오기
    const { data: initialMessages } = useQuery({
        queryKey: ['chatMessages', parsedMeetingId],
        queryFn: async () => {
            try {
                const response = await chatApi.getMessages(parsedMeetingId);
                return response.data ?? [];
            } catch {
                // Fallback Dummy Data for UI Dev
                return [
                    { messageId: '1', senderId: '101', senderName: '김철수', message: '같이 가요!', createdAt: '2023-10-25T10:00:00', senderProfileImage: undefined, type: 'TALK' },
                    { messageId: '2', senderId: '202', senderName: '김쩌고', message: '다른 사람이 말하는 버전 1줄 버전!', createdAt: '2023-10-25T10:05:00', senderProfileImage: undefined, type: 'TALK' },
                ] as ChatMessage[];
            }
        },
        enabled: true,
    });

    // 메시지 읽음 처리 Mutation
    const { mutate: markAsRead } = useMutation({
        mutationFn: (id: number) => chatApi.markAsRead(id),
        onError: (error) => console.error("Failed to mark messages as read", error)
    });

    useEffect(() => {
        if (initialMessages) {
            setMessages(initialMessages);
            scrollToBottom();
            if (!isNaN(parsedMeetingId)) {
                markAsRead(parsedMeetingId);
            }
        }
    }, [initialMessages, parsedMeetingId, markAsRead]);

    // 2. STOMP 연결
    useEffect(() => {
        const wsUrl = getWebSocketUrl();
        console.log('Connecting to WebSocket:', wsUrl);

        const client = new Client({
            brokerURL: wsUrl,
            connectHeaders: {
                Authorization: token ? `Bearer ${token}` : '',
            },
            debug: (str) => {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('Connected: ' + frame);

            // Subscribe to Meeting Topic
            client.subscribe(/topic/meeting/, (message) => {
                if (message.body) {
                    try {
                        const newMessage: ChatMessage = JSON.parse(message.body);
                        setMessages((prev) => [...prev, newMessage]);
                        scrollToBottom();
                    } catch (e) {
                        console.error('Message parse error', e);
                    }
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        stompClient.current = client;

        return () => {
            client.deactivate();
        };
    }, [parsedMeetingId, token]);

    // 3. 메시지 전송
    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        // 전송할 메시지 객체 생성
        const messagePayload = {
            meetingId: parsedMeetingId,
            senderId: String(myId), // 로그인 안했으면 게스트 ID
            message: inputMessage,
            messageType: 'TALK'
        };

        // STOMP 전송
        if (stompClient.current && stompClient.current.connected) {
            const destination = `/app/chat.send/${parsedMeetingId}`;
            console.log(`Sending message to ${destination}`, messagePayload);
            stompClient.current.publish({
                destination: destination,
                body: JSON.stringify(messagePayload),
            });
            setInputMessage('');
            // Optimistic Update는 하지 않음 (서버 응답(구독)으로 받아서 처리)
        } else {
            console.error('STOMP Client is not connected. Status:', stompClient.current?.state);
            alert('채팅 서버와 연결되지 않았습니다.');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            handleSendMessage();
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className="absolute inset-0 flex flex-col w-full bg-white">
            {/* Header (Visible only when standalone usage) */}
            {!meetingId && (
                <header className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100 flex-none h-[50px]">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-1 -ml-2">
                            <ChevronLeft size={24} color="#000" />
                        </button>
                        <h1 className="font-bold text-lg">맛집 탐방 (Test)</h1>
                    </div>
                </header>
            )}

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scrollbar-hide">
                <div className="text-center text-xs text-gray-400 my-2">
                    {user ? '로그인 상태입니다.' : 게스트 모드 ()}
                </div>

                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <p>대화 내용이 없습니다.</p>
                        <p>첫 메시지를 보내보세요!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        // 내 메시지 판별 로직
                        const currentUserId = user?.userId ? String(user.userId) : null;
                        const messageSenderId = String(msg.senderId);

                        const isMe = messageSenderId === String(myId) || 
                                     msg.senderName === '나' || 
                                     messageSenderId === '999' ||
                                     (currentUserId && messageSenderId === currentUserId);

                        return (
                            <div key={idx} className={lex w-full  items-end mb-4}>
                                {!isMe && (
                                    <div className="flex flex-col items-center mr-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden mb-1">
                                            {msg.senderProfileImage ? <img src={msg.senderProfileImage} alt="profile" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-300" />}
                                        </div>
                                    </div>
                                )}

                                <div className={lex flex-col max-w-[70%] }>
                                    {!isMe && <span className="text-xs text-gray-600 mb-1 ml-1">{msg.senderName}</span>}
                                    <div className="flex items-end gap-1">
                                        {isMe && <span className="text-[10px] text-gray-400 min-w-fit mb-1">{formatTime(msg.createdAt)}</span>}
                                        <div className={p-3 text-sm whitespace-pre-wrap leading-relaxed }>
                                            {msg.message || msg.content} 
                                        </div>
                                        {!isMe && <span className="text-[10px] text-gray-400 min-w-fit mb-1">{formatTime(msg.createdAt)}</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white w-full border-t border-gray-100 flex-none z-10">
                <div className="flex items-center bg-[#F3F4F6] rounded-full px-4 py-3">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="메시지를 입력하세요"
                        className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400 text-black"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className="ml-2 text-black transition-colors disabled:opacity-30"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoomPage;
