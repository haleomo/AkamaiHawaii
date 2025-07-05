import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Anchor, Send, Search, Settings, Paperclip, Smile, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

const channels = [
  { id: "general", name: "general", active: true },
  { id: "announcements", name: "announcements", active: false },
  { id: "sports", name: "sports", active: false },
  { id: "homework-help", name: "homework-help", active: false },
  { id: "events", name: "events", active: false },
];

const authorColors = [
  "hsl(220, 70%, 50%)",
  "hsl(200, 70%, 50%)",
  "hsl(150, 70%, 50%)",
  "hsl(280, 70%, 50%)",
  "hsl(30, 70%, 50%)",
  "hsl(340, 70%, 50%)",
];

function getAuthorColor(name: string): string {
  const index = name.length % authorColors.length;
  return authorColors[index];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ChatView() {
  const [activeChannel, setActiveChannel] = useState("general");
  const [messageContent, setMessageContent] = useState("");
  const [authorName, setAuthorName] = useState("Student");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", activeChannel],
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      content: string;
      channel: string;
      authorName: string;
      authorInitials: string;
      authorColor: string;
    }) => {
      const response = await apiRequest("POST", "/api/messages", messageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessageContent("");
    },
  });

  const markInappropriateMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest("PATCH", `/api/messages/${messageId}/inappropriate`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Message flagged",
        description: "The message has been marked as inappropriate and hidden.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to flag message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageContent.trim()) return;

    const messageData = {
      content: messageContent,
      channel: activeChannel,
      authorName,
      authorInitials: getInitials(authorName),
      authorColor: getAuthorColor(authorName),
    };

    sendMessageMutation.mutate(messageData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg h-[700px] flex flex-col">
        <div className="animate-pulse p-6 space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[700px] flex flex-col">
      {/* Chat Header */}
      <div className="gradient-navy-columbia p-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Anchor className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Tide Talk</h2>
            <p className="text-blue-100 text-sm">Connected to #{activeChannel}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="hover:bg-white/20 text-white">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-white/20 text-white">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Channel Selection */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex space-x-2 overflow-x-auto">
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant={activeChannel === channel.id ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveChannel(channel.id)}
              className={`whitespace-nowrap ${
                activeChannel === channel.id
                  ? "bg-columbia text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              # {channel.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No messages in #{activeChannel} yet.</p>
            <p className="text-slate-400 text-sm mt-2">Be the first to start the conversation!</p>
          </div>
        ) : (
          <>
            {/* Today's messages */}
            <div className="text-center py-2">
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {format(new Date(), "MMMM d, yyyy")}
              </span>
            </div>

            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3 group">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: message.authorColor }}
                >
                  <span className="text-white text-xs font-bold">
                    {message.authorInitials}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-slate-800">
                      {message.authorName}
                    </span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(message.createdAt), "h:mm a")}
                    </span>
                  </div>
                  <p className="text-slate-700">{message.content}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markInappropriateMutation.mutate(message.id)}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                    title="Mark as inappropriate"
                  >
                    <Flag className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Input
            type="text"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Share with the team..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10 bg-slate-100 border-0 focus:ring-2 focus:ring-columbia focus:bg-white"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-columbia"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!messageContent.trim() || sendMessageMutation.isPending}
            className="bg-columbia hover:bg-blue-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
