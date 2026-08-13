'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './ChatWidget.module.css';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const STORAGE_KEY = 'digital_twin_chat_history';
const INITIAL_MESSAGE: Message = { 
  role: 'assistant', 
  content: "Hello! I'm John's digital twin. Feel free to ask me anything about his career, experience, or skills." 
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load chat history', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save history to localStorage whenever messages change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history', e);
    }
  }, [messages, isLoaded]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen, error]);

  // Focus input when chat opens or loading completes
  useEffect(() => {
    if (isOpen && !isLoading) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isLoading]);

  const toggleChat = () => setIsOpen(!isOpen);

  const clearHistory = () => {
    setMessages([INITIAL_MESSAGE]);
    localStorage.removeItem(STORAGE_KEY);
    setError(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = { role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    // AbortController with 30-second timeout to prevent hanging streams
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
        signal: controller.signal,
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
      // Provide a specific message for timeout/abort vs other errors
      const isAbort = err.name === 'AbortError';
      setError(isAbort
        ? 'System malfunction: Connection timed out after 30 seconds. Please try again.'
        : `System malfunction: ${err.message || "I couldn't reach the mainframe."}`
      );
      setMessages(prev => {
        if (prev[prev.length - 1].role === 'assistant' && prev[prev.length - 1].content === '') {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatWidgetContainer}>
      {!isOpen && (
        <button 
          className={styles.chatToggleBtn} 
          onClick={toggleChat} 
          aria-label="Open Digital Twin Chat"
          aria-expanded={isOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {isOpen && (
        <div 
          className={styles.chatWindow}
          role="dialog"
          aria-label="Digital Twin Chat Window"
        >
          <div className={styles.chatHeader}>
            <h3>Digital Twin</h3>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button 
                className={styles.clearBtn} 
                onClick={clearHistory}
                aria-label="Clear chat history"
                title="Clear History"
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Clear
              </button>
              <button 
                className={styles.closeBtn} 
                onClick={toggleChat}
                aria-label="Close Chat"
              >&times;</button>
            </div>
          </div>
          
          <div className={styles.chatMessages} aria-live="polite">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}
              >
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            ))}
            
            {error && (
              <div className={`${styles.message} ${styles.aiMessage}`} style={{ color: '#ff4444' }} role="alert">
                {error}
              </div>
            )}
            
            {isLoading && messages[messages.length - 1].content === '' && (
              <div className={styles.typingIndicator} aria-label="AI is typing">Connecting to mainframe...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={styles.chatInputContainer}>
            <input 
              ref={inputRef}
              type="text" 
              className={styles.chatInput}
              placeholder="Ask a question..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              aria-label="Type your message"
            />
            <button 
              type="submit" 
              className={styles.sendBtn} 
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send Message"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
