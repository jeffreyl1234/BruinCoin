'use client'

import { use } from 'react'
import { useState } from 'react'

export default function ChatPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params) // 👈 unwraps the params Promise
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([]) // starts empty

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      content: newMessage,
      sender: 'you',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages([...messages, message])
    setNewMessage('')
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200 shadow-sm">
        <img
          src="/placeholder-profile.png"
          alt="profile"
          className="w-10 h-10 rounded-full border border-gray-300"
        />
        <div>
          <h2 className="text-gray-900 font-semibold">{username}</h2>
          <p className="text-xs text-green-500">Active now</p>
        </div>
      </div>

      {/* Chat messages */}
      <div
        id="chat-scroll"
        className="flex-1 overflow-y-auto p-4 bg-gray-100 space-y-3"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === 'you' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs text-sm ${
                  msg.sender === 'you'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                }`}
              >
                <p>{msg.content}</p>
                <span className="block text-[10px] text-gray-400 mt-1 text-right">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="bg-white p-4 flex items-center gap-3 border-t border-gray-200"
        style={{ flexShrink: 0 }}
      >
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition"
        >
          Send
        </button>
      </form>
    </div>
  )
}