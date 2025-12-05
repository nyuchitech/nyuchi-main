/**
 * 🇿🇼 Ubuntu AI Chat Component
 * "I am because we are" - AI assistant with African cultural intelligence
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  SmartToy as AIIcon,
} from '@mui/icons-material';
import { nyuchiColors } from '../../theme/zimbabwe-theme';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  ubuntu?: {
    principle?: string;
    communityImpact?: string;
    suggestions?: string[];
  };
}

interface UbuntuAIChatProps {
  communityId?: string;
  onUbuntuAction?: (action: string, data: unknown) => void;
}

export function UbuntuAIChat({ communityId, onUbuntuAction }: UbuntuAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Ubuntu AI ready! "I am because we are" - How can I help strengthen your business and community connections today?',
      timestamp: new Date().toISOString(),
      ubuntu: {
        principle: 'Ubuntu Philosophy',
        communityImpact: 'Fostering Ubuntu connections across Africa',
        suggestions: [
          'Tell me about business challenges',
          'Find collaboration opportunities',
          'How to strengthen community',
        ],
      },
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ubuntu-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          context: {
            communityId,
            conversationHistory: messages.slice(-10),
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response?.content || 'Ubuntu AI is thinking...',
        timestamp: new Date().toISOString(),
        ubuntu: {
          principle: data.response?.ubuntu_principle,
          communityImpact: data.response?.community_impact,
          suggestions: data.response?.follow_up_suggestions,
        },
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (onUbuntuAction && data.response?.ubuntu_action) {
        onUbuntuAction(data.response.ubuntu_action.type, data.response.ubuntu_action.data);
      }
    } catch (error) {
      console.error('Ubuntu AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Ubuntu AI is experiencing high community demand. The spirit of Ubuntu reminds us that challenges are temporary - please try again.',
        timestamp: new Date().toISOString(),
        ubuntu: {
          principle: 'Ubuntu Patience',
        },
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  return (
    <Card
      sx={{
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: `${nyuchiColors.sunsetOrange}08`,
        }}
      >
        <Avatar sx={{ bgcolor: nyuchiColors.sunsetOrange, width: 36, height: 36 }}>
          <AIIcon fontSize="small" />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Ubuntu AI
          </Typography>
          <Typography variant="caption" color="text.secondary">
            "I am because we are"
          </Typography>
        </Box>
        <Tooltip title="Clear chat">
          <IconButton size="small" onClick={clearChat}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Messages */}
      <CardContent sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {message.role !== 'user' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <Avatar sx={{ width: 20, height: 20, bgcolor: nyuchiColors.sunsetOrange }}>
                    <AIIcon sx={{ fontSize: 12 }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    Ubuntu AI
                  </Typography>
                  {message.ubuntu?.principle && (
                    <Chip
                      label={message.ubuntu.principle}
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem' }}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              )}

              <Box
                sx={{
                  maxWidth: '85%',
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: message.role === 'user' ? nyuchiColors.sunsetOrange : 'grey.100',
                  color: message.role === 'user' ? 'white' : 'text.primary',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
              </Box>

              {message.ubuntu?.suggestions && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {message.ubuntu.suggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      size="small"
                      variant="outlined"
                      onClick={() => setInput(suggestion)}
                      sx={{ fontSize: '0.7rem', cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              )}

              {message.ubuntu?.communityImpact && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                  Community: {message.ubuntu.communityImpact}
                </Typography>
              )}
            </Box>
          ))}

          {isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                Ubuntu AI is thinking...
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
      </CardContent>

      {/* Input */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Ask about business, collaboration, community..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Card>
  );
}
