/**
 * Ubuntu AI Chat Component
 * "I am because we are" - AI assistant with African cultural intelligence
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Bot, Send, RotateCcw, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  ubuntu?: {
    principle?: string
    communityImpact?: string
    suggestions?: string[]
  }
}

interface UbuntuAIChatProps {
  communityId?: string
  onUbuntuAction?: (action: string, data: unknown) => void
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
  ])

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

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
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

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
      }

      setMessages((prev) => [...prev, aiMessage])

      if (onUbuntuAction && data.response?.ubuntu_action) {
        onUbuntuAction(data.response.ubuntu_action.type, data.response.ubuntu_action.data)
      }
    } catch (error) {
      console.error('Ubuntu AI Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Ubuntu AI is experiencing high community demand. The spirit of Ubuntu reminds us that challenges are temporary - please try again.',
        timestamp: new Date().toISOString(),
        ubuntu: {
          principle: 'Ubuntu Patience',
        },
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([messages[0]])
  }

  return (
    <Card className="h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b bg-primary/5">
        <Avatar className="w-9 h-9 bg-primary text-primary-foreground">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-semibold">Ubuntu AI</p>
          <p className="text-xs text-muted-foreground">&quot;I am because we are&quot;</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearChat}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear chat</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Messages */}
      <CardContent className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {message.role !== 'user' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Avatar className="w-5 h-5 bg-primary text-primary-foreground">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                      <Bot className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">Ubuntu AI</span>
                  {message.ubuntu?.principle && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                      {message.ubuntu.principle}
                    </Badge>
                  )}
                </div>
              )}

              <div
                className={`max-w-[85%] px-3 py-2.5 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.ubuntu?.suggestions && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {message.ubuntu.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}

              {message.ubuntu?.communityImpact && (
                <p className="text-xs text-muted-foreground italic mt-1">
                  Community: {message.ubuntu.communityImpact}
                </p>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Ubuntu AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <Input
          placeholder="Ask about business, collaboration, community..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
