'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatWidget.module.css';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm John's digital twin. Feel free to ask me anything about his career, experience, or skills." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen, error]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = { role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    // Add a placeholder for the assistant's streaming response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('The AI is currently rate-limited (too many requests). Please try again in a few moments.');
        }
        throw new Error('API response was not ok');
      }

      if (!response.body) throw new Error('No readable stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            if (line === 'data: [DONE]') return;
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                  setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    const updatedMsg = { ...lastMsg, content: lastMsg.content + data.choices[0].delta.content };
                    return [...prev.slice(0, -1), updatedMsg];
                  });
                }
              } catch (e) {
                console.error('Error parsing SSE data line', e);
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(`System malfunction: ${err.message || "I couldn't reach the mainframe."}`);
      // Remove the empty assistant message if it failed immediately
      setMessages(prev => {
        if (prev[prev.length - 1].role === 'assistant' && prev[prev.length - 1].content === '') {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatWidgetContainer}>
      {!isOpen && (
        <button className={styles.chatToggleBtn} onClick={toggleChat} aria-label="Open Chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <h3>Digital Twin</h3>
            <button className={styles.closeBtn} onClick={toggleChat}>&times;</button>
          </div>
          
          <div className={styles.chatMessages}>
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}
              >
                {msg.content}
              </div>
            ))}
            
            {error && (
              <div className={`${styles.message} ${styles.aiMessage}`} style={{ color: '#ff4444' }}>
                {error}
              </div>
            )}
            
            {isLoading && messages[messages.length - 1].content === '' && (
              <div className={styles.typingIndicator}>Connecting to mainframe...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={styles.chatInputContainer}>
            <input 
              type="text" 
              className={styles.chatInput}
              placeholder="Ask a question..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className={styles.sendBtn} disabled={isLoading || !inputValue.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
