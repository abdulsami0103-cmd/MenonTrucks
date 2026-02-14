'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Conversation {
  contact: { id: string; name: string; companyName?: string; avatar?: string };
  lastMessage: { content: string; createdAt: string; listing?: { title: string; slug: string } };
  unreadCount: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }

      const res = await fetch('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen">
      <div className="container-main py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" /> Messages
        </h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <MessageSquare className="w-16 h-16 text-text-secondary/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No messages yet</h3>
            <p className="text-text-secondary">Messages from buyers will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden divide-y divide-border">
            {conversations.map((conv) => (
              <Link
                key={conv.contact.id}
                href={`/dashboard/messages/${conv.contact.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {(conv.contact.companyName || conv.contact.name).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-text-primary text-sm truncate">
                      {conv.contact.companyName || conv.contact.name}
                    </h3>
                    <span className="text-xs text-text-secondary shrink-0 ml-2">
                      {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {conv.lastMessage.listing && (
                    <p className="text-xs text-accent truncate">Re: {conv.lastMessage.listing.title}</p>
                  )}
                  <p className="text-sm text-text-secondary truncate mt-0.5">{conv.lastMessage.content}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <Badge variant="accent" className="shrink-0">{conv.unreadCount}</Badge>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
