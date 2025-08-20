import React, { useState, useEffect, useRef } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Badge,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Chat,
  Close,
  Send,
  SupportAgent,
  Person,
  Minimize
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { toast } from 'react-toastify';

const ChatWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && open && !chat) {
      loadOrCreateChat();
    }
  }, [isAuthenticated, open]);

  useEffect(() => {
    if (chat) {
      // Initialize socket
      const socket = chatService.initializeSocket();
      chatService.connect();
      chatService.joinChat(chat._id);

      // Listen for new messages
      chatService.onNewMessage((message) => {
        setMessages(prev => [...prev, message]);
        if (!open) {
          setUnreadCount(prev => prev + 1);
        }
        scrollToBottom();
      });

      // Listen for typing indicator
      chatService.onUserTyping(({ isTyping, userName }) => {
        setTyping(isTyping);
        setTypingUser(userName);
      });

      return () => {
        chatService.removeListeners();
        chatService.leaveChat(chat._id);
      };
    }
  }, [chat, open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open) {
      setUnreadCount(0);
    }
  }, [open]);

  const loadOrCreateChat = async () => {
    try {
      setLoading(true);
      
      // Try to get existing active chat
      const chatsResponse = await chatService.getChats();
      const activeChat = chatsResponse.data.find(c => 
        ['active', 'waiting'].includes(c.status)
      );

      if (activeChat) {
        setChat(activeChat);
        setMessages(activeChat.messages || []);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async (initialMessage) => {
    try {
      setLoading(true);
      const newChat = await chatService.createChat({
        subject: 'Consulta de soporte',
        category: 'general',
        message: initialMessage
      });
      
      setChat(newChat);
      setMessages(newChat.messages || []);
      toast.success('Chat iniciado exitosamente');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      if (!chat) {
        // Create new chat with first message
        await createNewChat(messageText);
      } else {
        // Add message to existing chat
        const updatedChat = await chatService.addMessage(chat._id, {
          content: messageText
        });
        
        const newMsg = updatedChat.messages[updatedChat.messages.length - 1];
        setMessages(prev => [...prev, newMsg]);
        
        // Send via socket for real-time update
        chatService.sendMessageSocket(chat._id, newMsg);
      }
    } catch (error) {
      toast.error(error.message);
      setNewMessage(messageText); // Restore message on error
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = () => {
    if (chat && user) {
      chatService.sendTyping(chat._id, true, `${user.firstName} ${user.lastName}`);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        chatService.sendTyping(chat._id, false, `${user.firstName} ${user.lastName}`);
      }, 2000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-CU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUserMessage = (message) => {
    return message.sender._id === user?.id;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Chat Fab */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
        onClick={() => setOpen(true)}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Chat />
        </Badge>
      </Fab>

      {/* Chat Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            position: 'fixed',
            bottom: minimized ? -400 : 24,
            right: 24,
            top: 'auto',
            left: 'auto',
            margin: 0,
            maxHeight: minimized ? 60 : 500,
            width: 400,
            transition: 'all 0.3s ease'
          }
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'primary.main',
            color: 'white',
            py: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SupportAgent sx={{ mr: 1 }} />
            <Typography variant="h6">
              Soporte Técnico
            </Typography>
          </Box>
          
          <Box>
            <IconButton
              size="small"
              onClick={() => setMinimized(!minimized)}
              sx={{ color: 'white', mr: 1 }}
            >
              <Minimize />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setOpen(false)}
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        {!minimized && (
          <DialogContent sx={{ p: 0, height: 400, display: 'flex', flexDirection: 'column' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Messages Area */}
                <Box
                  sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  {messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <SupportAgent sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        ¡Hola! ¿En qué podemos ayudarte?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Escribe tu consulta y te responderemos lo antes posible
                      </Typography>
                    </Box>
                  ) : (
                    messages.map((message, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: isUserMessage(message) ? 'flex-end' : 'flex-start',
                          mb: 1
                        }}
                      >
                        {!isUserMessage(message) && (
                          <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                            <SupportAgent />
                          </Avatar>
                        )}
                        
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            maxWidth: '70%',
                            bgcolor: isUserMessage(message) ? 'primary.main' : 'grey.100',
                            color: isUserMessage(message) ? 'white' : 'text.primary'
                          }}
                        >
                          <Typography variant="body2">
                            {message.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.7,
                              fontSize: '0.7rem'
                            }}
                          >
                            {formatTime(message.createdAt)}
                          </Typography>
                        </Paper>
                        
                        {isUserMessage(message) && (
                          <Avatar sx={{ ml: 1, width: 32, height: 32 }}>
                            <Person />
                          </Avatar>
                        )}
                      </Box>
                    ))
                  )}

                  {/* Typing Indicator */}
                  {typing && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <SupportAgent />
                      </Avatar>
                      <Chip
                        label={`${typingUser} está escribiendo...`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  )}

                  <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Escribe tu mensaje..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={handleKeyPress}
                      multiline
                      maxRows={3}
                    />
                    <Button
                      variant="contained"
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || loading}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      <Send />
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default ChatWidget;