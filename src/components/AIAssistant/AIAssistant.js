import React, { useState, useEffect, useRef } from 'react';
import { Paper, Typography, InputBase, IconButton, Fab } from '@material-ui/core';
import { Send, Chat as MessageCircle, Close as X } from '@material-ui/icons';
import { startTravelChat } from '../../api/ai';
import useStyles from './styles';

const AIAssistant = () => {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! I am your AI Travel Advisor. I am connected to Google\'s Grounding data, so I can find the best real-time spots for you anywhere in the world! Where are we exploring today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && !chatSession) {
      try {
        const session = startTravelChat();
        setChatSession(session);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to start chat session:', error);
        setMessages((prev) => [...prev, { role: 'model', text: 'Sorry, I am currently unavailable. Please ensure your Gemini API key is configured correctly.' }]);
      }
    }
  }, [isOpen, chatSession]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatSession) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessage(userMessage);
      const responseText = result.response.text();

      setMessages((prev) => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { role: 'model', text: 'Sorry, I encountered an error while trying to fetch that information for you. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple formatter to bold text surrounded by **
  const formatText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      <Fab className={classes.fab} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <MessageCircle />}
      </Fab>

      {isOpen && (
        <Paper className={classes.chatWindow} elevation={6}>
          <div className={classes.header}>
            <Typography variant="h6" style={{ fontWeight: 600, fontSize: '1.1rem' }}>
              Travel Advisor AI
            </Typography>
            <IconButton size="small" onClick={() => setIsOpen(false)} style={{ color: 'white' }}>
              <X fontSize="small" />
            </IconButton>
          </div>

          <div className={classes.messagesContainer}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${classes.messageBubble} ${msg.role === 'user' ? classes.userMessage : classes.aiMessage}`}
              >
                {formatText(msg.text)}
              </div>
            ))}

            {isLoading && (
              <div className={classes.loadingContainer}>
                <div className={`${classes.dot} ${classes.dot1}`} />
                <div className={`${classes.dot} ${classes.dot2}`} />
                <div className={classes.dot} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className={classes.inputArea} onSubmit={handleSend}>
            <InputBase
              className={classes.inputBase}
              placeholder="Ask about places to visit..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || !chatSession}
            />
            <IconButton 
              type="submit" 
              className={classes.sendButton}
              disabled={!input.trim() || isLoading || !chatSession}
            >
              <Send fontSize="small" />
            </IconButton>
          </form>
        </Paper>
      )}
    </>
  );
};

export default AIAssistant;
