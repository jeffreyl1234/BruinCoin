'use client'

import Link from 'next/link'

export default function MessagesPage() {
  // Empty list for now (will later be replaced with Supabase data)
  const chats: any[] = []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600 mb-6">View and manage your conversations.</p>

        {chats.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            <p>No messages yet.</p>
            <p className="text-sm text-gray-400 mt-1">Start chatting with a seller or buyer to see them here.</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
            {chats.map((chat) => (
              <Link
                key={chat.username}
                href={`/messages/${chat.username}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div>
                  <h3 className="font-medium text-gray-900">@{chat.username}</h3>
                  <p className="text-sm text-gray-600 truncate max-w-xs">{chat.lastMessage}</p>
                </div>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}