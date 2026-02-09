"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MessageSquare, Send, Plus, ArrowLeft, User } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Badge, Button, EmptyState, Input, Modal, Textarea } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Conversation } from "@/types/message";

// ---------------------------------------------------------------------------
// Helper: format message time as HH:MM
// ---------------------------------------------------------------------------
function formatTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Helper: format relative date for conversation list
// ---------------------------------------------------------------------------
function formatRelative(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    }
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return formatDate(dateString);
  } catch {
    return "";
  }
}

// ===========================================================================
// Main page component
// ===========================================================================
export default function ClientMessagesPage() {
  const { user } = useAuth();
  const {
    getConversationsByTenant,
    getMessagesByConversation,
    getAdmin,
    addConversation,
    addMessage,
    markMessagesRead,
    admins,
  } = useData();

  // --- State ---------------------------------------------------------------
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Data ----------------------------------------------------------------
  const tenantId = user?.id ?? "";

  const conversations = useMemo(() => {
    if (!tenantId) return [];
    return [...getConversationsByTenant(tenantId)].sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );
  }, [tenantId, getConversationsByTenant]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConvId) ?? null,
    [conversations, selectedConvId],
  );

  const conversationMessages = useMemo(() => {
    if (!selectedConvId) return [];
    return getMessagesByConversation(selectedConvId);
  }, [selectedConvId, getMessagesByConversation]);

  // Auto-select first conversation on desktop if none selected
  useEffect(() => {
    if (!selectedConvId && conversations.length > 0) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (selectedConvId && selectedConversation && selectedConversation.unreadClient > 0) {
      markMessagesRead(selectedConvId, "client");
    }
  }, [selectedConvId, selectedConversation, markMessagesRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  // --- Handlers ------------------------------------------------------------
  const handleSelectConversation = useCallback(
    (conv: Conversation) => {
      setSelectedConvId(conv.id);
      setMobileShowChat(true);
      setMessageText("");
    },
    [],
  );

  const handleSendMessage = useCallback(() => {
    const trimmed = messageText.trim();
    if (!trimmed || !selectedConvId || !tenantId) return;

    addMessage({
      conversationId: selectedConvId,
      senderId: tenantId,
      senderType: "client",
      content: trimmed,
    });
    setMessageText("");
  }, [messageText, selectedConvId, tenantId, addMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const handleCreateConversation = useCallback(() => {
    const trimmedSubject = newSubject.trim();
    const trimmedMsg = newMessage.trim();
    if (!trimmedSubject || !trimmedMsg || !tenantId) return;

    // Default admin assignment
    const adminId = admins.length > 0 ? admins[0].id : "ADM-0001";

    const conv = addConversation({
      tenantId,
      adminId,
      subject: trimmedSubject,
    });

    addMessage({
      conversationId: conv.id,
      senderId: tenantId,
      senderType: "client",
      content: trimmedMsg,
    });

    setNewSubject("");
    setNewMessage("");
    setShowNewModal(false);
    setSelectedConvId(conv.id);
    setMobileShowChat(true);
  }, [newSubject, newMessage, tenantId, admins, addConversation, addMessage]);

  const handleBack = useCallback(() => {
    setMobileShowChat(false);
  }, []);

  // --- Helpers for rendering -----------------------------------------------
  const getLastMessagePreview = useCallback(
    (convId: string): string => {
      const msgs = getMessagesByConversation(convId);
      if (msgs.length === 0) return "Aucun message";
      const last = msgs[msgs.length - 1];
      const prefix = last.senderType === "client" ? "Vous: " : "";
      const content = last.content;
      return prefix + (content.length > 60 ? content.slice(0, 60) + "..." : content);
    },
    [getMessagesByConversation],
  );

  const getAdminName = useCallback(
    (adminId: string): string => {
      const admin = getAdmin(adminId);
      return admin ? `${admin.firstName} ${admin.lastName}` : "Administrateur";
    },
    [getAdmin],
  );

  // =========================================================================
  // RENDER
  // =========================================================================

  // No conversations at all
  if (conversations.length === 0 && !showNewModal) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0f1b2d]">Messagerie</h1>
            <p className="text-sm text-[#6b7280] mt-1">
              Communiquez avec votre gestionnaire
            </p>
          </div>
          <Button variant="secondary" className="gap-2" onClick={() => setShowNewModal(true)}>
            <Plus className="h-4 w-4" />
            Nouveau message
          </Button>
        </div>

        <Card>
          <EmptyState
            icon={<MessageSquare className="h-10 w-10" />}
            title="Aucune conversation"
            description="Vous n'avez aucune conversation pour le moment. Envoyez un premier message a votre gestionnaire."
            action={
              <Button variant="secondary" size="sm" className="gap-2" onClick={() => setShowNewModal(true)}>
                <Plus className="h-4 w-4" />
                Nouveau message
              </Button>
            }
          />
        </Card>

        {/* New Conversation Modal */}
        <NewConversationModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          subject={newSubject}
          message={newMessage}
          onSubjectChange={setNewSubject}
          onMessageChange={setNewMessage}
          onSubmit={handleCreateConversation}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1b2d]">Messagerie</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="secondary" className="gap-2" onClick={() => setShowNewModal(true)}>
          <Plus className="h-4 w-4" />
          Nouveau message
        </Button>
      </div>

      {/* Chat Layout */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden flex" style={{ height: "calc(100vh - 240px)", minHeight: "500px" }}>
        {/* ----- Left Panel: Conversation List ----- */}
        <div
          className={`w-full md:w-[340px] lg:w-[380px] flex-shrink-0 border-r border-[#e5e7eb] flex flex-col ${
            mobileShowChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search/filter header */}
          <div className="p-4 border-b border-[#e5e7eb]">
            <h2 className="text-sm font-semibold text-[#0f1b2d]">Conversations</h2>
          </div>

          {/* Conversation items */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
              const isActive = conv.id === selectedConvId;
              const adminName = getAdminName(conv.adminId);
              const preview = getLastMessagePreview(conv.id);

              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full text-left px-4 py-3 border-b border-[#e5e7eb] transition-colors hover:bg-[#f8fafc] ${
                    isActive ? "bg-[#f0fdf4] border-l-2 border-l-[#10b981]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${isActive ? "text-[#0f1b2d]" : "text-[#0f1b2d]"}`}>
                        {conv.subject}
                      </p>
                      <p className="text-xs text-[#6b7280] mt-0.5 truncate">
                        {adminName}
                      </p>
                      <p className="text-xs text-[#6b7280] mt-1 truncate">
                        {preview}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] text-[#6b7280] whitespace-nowrap">
                        {formatRelative(conv.lastMessageAt)}
                      </span>
                      {conv.unreadClient > 0 && (
                        <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-[#10b981] text-white text-[10px] font-bold">
                          {conv.unreadClient}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ----- Right Panel: Chat ----- */}
        <div
          className={`flex-1 flex flex-col ${
            !mobileShowChat ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center gap-3 bg-white">
                <button
                  onClick={handleBack}
                  className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-[#6b7280] transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-[#f0fdf4] flex-shrink-0">
                  <User className="h-4 w-4 text-[#10b981]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#0f1b2d] truncate">
                    {selectedConversation.subject}
                  </p>
                  <p className="text-xs text-[#6b7280] truncate">
                    {getAdminName(selectedConversation.adminId)}
                  </p>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#f8fafc]">
                {conversationMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-[#6b7280]">Aucun message dans cette conversation</p>
                  </div>
                ) : (
                  <>
                    {/* Date separator for first message */}
                    <div className="flex justify-center mb-2">
                      <span className="text-[10px] text-[#6b7280] bg-white px-3 py-1 rounded-full border border-[#e5e7eb]">
                        {formatDate(conversationMessages[0].createdAt)}
                      </span>
                    </div>

                    {conversationMessages.map((msg, idx) => {
                      const isClient = msg.senderType === "client";

                      // Show date separator when day changes
                      const showDateSep =
                        idx > 0 &&
                        formatDate(msg.createdAt) !== formatDate(conversationMessages[idx - 1].createdAt);

                      return (
                        <div key={msg.id}>
                          {showDateSep && (
                            <div className="flex justify-center my-3">
                              <span className="text-[10px] text-[#6b7280] bg-white px-3 py-1 rounded-full border border-[#e5e7eb]">
                                {formatDate(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                isClient
                                  ? "bg-[#10b981] text-white rounded-br-md"
                                  : "bg-white text-[#0f1b2d] border border-[#e5e7eb] rounded-bl-md"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                {msg.content}
                              </p>
                              <p
                                className={`text-[10px] mt-1 text-right ${
                                  isClient ? "text-white/70" : "text-[#6b7280]"
                                }`}
                              >
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message input */}
              <div className="px-4 py-3 border-t border-[#e5e7eb] bg-white">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Tapez votre message..."
                      rows={1}
                      className="w-full resize-none rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 py-2.5 text-sm text-[#0f1b2d] placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent hover:border-[#6b7280] transition-colors"
                      style={{ maxHeight: "120px" }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = Math.min(target.scrollHeight, 120) + "px";
                      }}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="h-[42px] w-[42px] !p-0 flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* No conversation selected placeholder (desktop) */
            <div className="flex-1 flex items-center justify-center bg-[#f8fafc]">
              <div className="text-center">
                <div className="mx-auto mb-4 rounded-full bg-white p-4 w-fit border border-[#e5e7eb]">
                  <MessageSquare className="h-8 w-8 text-[#6b7280]" />
                </div>
                <p className="text-sm text-[#6b7280]">
                  Selectionnez une conversation pour afficher les messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        subject={newSubject}
        message={newMessage}
        onSubjectChange={setNewSubject}
        onMessageChange={setNewMessage}
        onSubmit={handleCreateConversation}
      />
    </div>
  );
}

// ===========================================================================
// New Conversation Modal
// ===========================================================================
interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  message: string;
  onSubjectChange: (val: string) => void;
  onMessageChange: (val: string) => void;
  onSubmit: () => void;
}

function NewConversationModal({
  isOpen,
  onClose,
  subject,
  message,
  onSubjectChange,
  onMessageChange,
  onSubmit,
}: NewConversationModalProps) {
  const canSubmit = subject.trim().length > 0 && message.trim().length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle conversation" size="lg">
      <div className="space-y-4">
        <Input
          label="Sujet"
          placeholder="Ex: Question sur mon bail, Demande de maintenance..."
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
        />
        <Textarea
          label="Message"
          placeholder="Redigez votre message ici..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={5}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="secondary"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Envoyer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
