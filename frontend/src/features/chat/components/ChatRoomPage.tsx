import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Users, ChevronLeft } from 'lucide-react';
import { chatApi } from '@/shared/api/chatAPI';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { ChatMessage } from '@/shared/types/Chat.types';

const ChatRoomPage: React.FC = () => {
    const params = useParams<{ meetingId: string }>();
    const meetingId = params.meetingId;
    const navigate = useNavigate();
    // const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const myId = user?.userId || 999; // Fallback ID

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const socketRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
        return `${ampm} ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    };

    // 1. 기존 메시지 불러오기
    const { data: initialMessages } = useQuery({
        queryKey: ['chatMessages', parsedMeetingId],
        queryFn: async () => {
            try {
                const response = await chatApi.getMessages(parsedMeetingId);
                // @ts-ignore
                return response.result || response.data || []; 
            } catch (e) {
                // Fallback Dummy Data for UI Dev
                return [
                    { messageId: '1', senderId: 101, senderName: '김철수', content: '같이 가요!', createdAt: '2023-10-25T10:00:00', senderProfileImage: undefined }, 
                    { messageId: '2', senderId: 202, senderName: '김쩌고', content: '다른 사람이 말하는 버전 1줄 버전!', createdAt: '2023-10-25T10:05:00', senderProfileImage: undefined },
                    { messageId: '3', senderId: 202, senderName: '김쩌고', content: '다른 사람이 말하는 버전 2줄 버전!\n다른 사람이 말하는 버전 2줄 버전!', createdAt: '2023-10-25T10:06:00', senderProfileImage: undefined },
                    { messageId: '4', senderId: myId, senderName: '나', content: '자신이 말하는 버전 2줄 버전!\n자신이 말하는 버전 2줄 버전!', createdAt: '2023-10-25T10:07:00' },
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
    }, [initialMessages, parsedMeetingId]);

    // 2. WebSocket 연결
    useEffect(() => {
        if (!user) return; // Allow demo without user check effectively, but safe check

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = 'localhost:8080'; // Should use env var
        const wsUrl = `${protocol}//${host}/api/chat/ws/chat`;

        try {
            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log('Connected to WebSocket');
            };

            socket.onmessage = (event) => {
                try {
                    const newMessage: ChatMessage = JSON.parse(event.data);
                    setMessages((prev) => [...prev, newMessage]);
                    scrollToBottom();
                } catch (e) {
                    console.error('Message parse error', e);
                }
            };

            socket.onclose = () => {
                console.log('Disconnected from WebSocket');
            };
        } catch (e) {
            console.error("WebSocket Init Failed", e);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [parsedMeetingId, user]);

    // 3. 메시지 전송
    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;
        
        // Optimistic UI Update (즉시 추가)
        const tempMessage: ChatMessage = {
            messageId: Date.now().toString(),
            senderId: user?.userId || myId,
            senderName: user?.nickname || '나',
            senderProfileImage: user?.profileImage,
            content: inputMessage,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMessage]);
        setInputMessage('');
        scrollToBottom();

        // WebSocket 전송
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const messagePayload = {
                meetingId: parsedMeetingId,
                senderId: user?.userId || myId,
                content: inputMessage,
                type: 'TALK'
            };
            socketRef.current.send(JSON.stringify(messagePayload));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // 한글 입력 중 조합 문제 방지 (isComposing)
        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            handleSendMessage();
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // 헤더 뒤로가기 버튼 제거 (모임 상세 내부 탭으로 들어갈 경우)
    return (
        <div className="absolute inset-0 flex flex-col w-full bg-white">
            {/* Header (Visible only when standalone usage) */}
            {!meetingId && (
                <header className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100 flex-none h-[50px]">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-1 -ml-2">
                            <ChevronLeft size={24} color="#000" />
                        </button>
                        <h1 className="font-bold text-lg">맛집 탐방</h1>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users size={18} />
                        <span className="text-sm font-medium">14</span>
                    </div>
                </header>
            )}

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scrollbar-hide">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <p>대화 내용이 없습니다.</p>
                        <p>첫 메시지를 보내보세요!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderName === '나' || msg.senderId === user?.userId || msg.senderId === 999;
                        
                        return (
                            <div key={idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} items-end mb-4`}>
                                {!isMe && (
                                    <div className="flex flex-col items-center mr-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden mb-1">
                                            {msg.senderProfileImage ? <img src={msg.senderProfileImage} alt="profile" className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gray-300" />}
                                        </div>
                                    </div>
                                )}
                                
                                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    {!isMe && <span className="text-xs text-gray-600 mb-1 ml-1">{msg.senderName}</span>}
                                    <div className="flex items-end gap-1">
                                        {isMe && <span className="text-[10px] text-gray-400 min-w-fit mb-1">{formatTime(msg.createdAt)}</span>}
                                        <div className={`p-3 text-sm whitespace-pre-wrap leading-relaxed ${
                                            isMe 
                                            ? 'bg-[#FF206E] text-white rounded-[20px] rounded-tr-none' 
                                            : 'bg-[#BDBDBD] text-white rounded-[20px] rounded-tl-none' 
                                        }`}>
                                            {msg.content}
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
