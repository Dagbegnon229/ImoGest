"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MessageSquare, Send, ArrowLeft, User, Loader2, Trash2 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { uploadMultipleFiles } from "@/lib/supabase";
import { AttachmentPreview } from "@/components/chat/AttachmentPreview";
import { FileUploadButton } from "@/components/chat/FileUploadButton";
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
export default function AdminMessagesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    conversations,
    getMessagesByConversation,
    getTenant,
    getAdmin,
    addMessage,
    deleteMessage,
    markMessagesRead,
  } = useData();

  // --- State ---------------------------------------------------------------
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Data ----------------------------------------------------------------
  const adminId = user?.id ?? "";

  // Show all conversations, sorted by most recent message
  const sortedConversations = useMemo(() => {
    return [...conversations].sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );
  }, [conversations]);

  const selectedConversation = useMemo(
    () => sortedConversations.find((c) => c.id === selectedConvId) ?? null,
    [sortedConversations, selectedConvId],
  );

  const conversationMessages = useMemo(() => {
    if (!selectedConvId) return [];
    return getMessagesByConversation(selectedConvId);
  }, [selectedConvId, getMessagesByConversation]);

  // Auto-select first conversation on desktop if none selected
  useEffect(() => {
    if (!selectedConvId && sortedConversations.length > 0) {
      setSelectedConvId(sortedConversations[0].id);
    }
  }, [sortedConversations, selectedConvId]);

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (selectedConvId && selectedConversation && selectedConversation.unreadAdmin > 0) {
      markMessagesRead(selectedConvId, "admin");
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

  const handleSendMessage = useCallback(async () => {
    const trimmed = messageText.trim();
    if ((!trimmed && attachedFiles.length === 0) || !selectedConvId || !adminId) return;

    setIsSending(true);
    try {
      let attachments: { name: string; url: string; size: number; type: string }[] = [];
      if (attachedFiles.length > 0) {
        attachments = await uploadMultipleFiles(
          "message-attachments",
          `${selectedConvId}/${adminId}`,
          attachedFiles,
        );
      }
      await addMessage({
        conversationId: selectedConvId,
        senderId: adminId,
        senderType: "admin",
        content: trimmed || (attachments.length > 0 ? `📎 ${attachments.length} fichier(s)` : ""),
        attachments,
      });
      setMessageText("");
      setAttachedFiles([]);
    } catch {
      showToast("Erreur lors de l'envoi", "error");
    } finally {
      setIsSending(false);
    }
  }, [messageText, attachedFiles, selectedConvId, adminId, addMessage, showToast]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const handleBack = useCallback(() => {
    setMobileShowChat(false);
  }, []);

  const handleDeleteMessage = useCallback(async (msgId: string) => {
    try {
      await deleteMessage(msgId);
      setDeletingMsgId(null);
      showToast("Message supprimé", "success");
    } catch {
      showToast("Erreur lors de la suppression", "error");
    }
  }, [deleteMessage, showToast]);

  // --- Helpers for rendering -----------------------------------------------
  const getTenantName = useCallback(
    (tenantId: string): string => {
      const tenant = getTenant(tenantId);
      return tenant ? `${tenant.firstName} ${tenant.lastName}` : "Locataire";
    },
    [getTenant],
  );

  const getLastMessagePreview = useCallback(
    (convId: string): string => {
      const msgs = getMessagesByConversation(convId);
      if (msgs.length === 0) return "Aucun message";
      const last = msgs[msgs.length - 1];
      const prefix = last.senderType === "admin" ? "Vous: " : "";
      const content = last.content;
      return prefix + (content.length > 60 ? content.slice(0, 60) + "..." : content);
    },
    [getMessagesByConversation],
  );

  // Total unread count
  const totalUnread = useMemo(
    () => sortedConversations.reduce((sum, c) => sum + c.unreadAdmin, 0),
    [sortedConversations],
  );

  // =========================================================================
  // RENDER
  // =========================================================================

  // No conversations at all
  if (sortedConversations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1b2d]">Messagerie</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Gerez les conversations avec vos locataires
          </p>
        </div>

        <Card>
          <EmptyState
            icon={<MessageSquare className="h-10 w-10" />}
            title="Aucune conversation"
            description="Les locataires n'ont pas encore initie de conversation. Les messages apparaitront ici lorsqu'un locataire vous contactera."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f1b2d]">Messagerie</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          {sortedConversations.length} conversation{sortedConversations.length !== 1 ? "s" : ""}
          {totalUnread > 0 && (
            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-[#10b981] text-white text-[10px] font-bold align-middle">
              {totalUnread} non lu{totalUnread !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>

      {/* Chat Layout */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden flex" style={{ height: "calc(100vh - 240px)", minHeight: "500px" }}>
        {/* ----- Left Panel: Conversation List ----- */}
        <div
          className={`w-full md:w-[340px] lg:w-[380px] flex-shrink-0 border-r border-[#e5e7eb] flex flex-col ${
            mobileShowChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#e5e7eb]">
            <h2 className="text-sm font-semibold text-[#0f1b2d]">Conversations</h2>
          </div>

          {/* Conversation items */}
          <div className="flex-1 overflow-y-auto">
            {sortedConversations.map((conv) => {
              const isActive = conv.id === selectedConvId;
              const tenantName = getTenantName(conv.tenantId);
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
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#f0fdf4] flex-shrink-0">
                          <User className="h-3.5 w-3.5 text-[#10b981]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#0f1b2d] truncate">
                            {tenantName}
                          </p>
                          <p className="text-xs text-[#6b7280] truncate">
                            {conv.subject}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-[#6b7280] mt-1.5 truncate pl-10">
                        {preview}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] text-[#6b7280] whitespace-nowrap">
                        {formatRelative(conv.lastMessageAt)}
                      </span>
                      {conv.unreadAdmin > 0 && (
                        <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-[#10b981] text-white text-[10px] font-bold">
                          {conv.unreadAdmin}
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
                    {getTenantName(selectedConversation.tenantId)}
                  </p>
                  <p className="text-xs text-[#6b7280] truncate">
                    {selectedConversation.subject}
                  </p>
                </div>
                <Badge variant="info">
                  {selectedConversation.tenantId}
                </Badge>
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
                      const isAdmin = msg.senderType === "admin";

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
                          <div className={`flex ${isAdmin ? "justify-end" : "justify-start"} group/msg`}>
                            {/* Client avatar for client messages */}
                            {!isAdmin && (
                              <div className="flex items-end mr-2 mb-1 flex-shrink-0">
                                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-[#e5e7eb]">
                                  <User className="h-3.5 w-3.5 text-[#6b7280]" />
                                </div>
                              </div>
                            )}
                            {/* Delete button - left of own messages */}
                            {isAdmin && (
                              <div className="flex items-center mr-1.5 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                {deletingMsgId === msg.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      className="text-[10px] font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                                    >
                                      Confirmer
                                    </button>
                                    <button
                                      onClick={() => setDeletingMsgId(null)}
                                      className="text-[10px] font-medium text-[#6b7280] hover:text-[#374151] px-1.5 py-1 rounded transition-colors"
                                    >
                                      Non
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeletingMsgId(msg.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#9ca3af] hover:text-red-500 transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                                isAdmin
                                  ? "bg-[#0f1b2d] text-white rounded-br-md"
                                  : "bg-white text-[#0f1b2d] border border-[#e5e7eb] rounded-bl-md"
                              }`}
                            >
                              {!isAdmin && (
                                <p className="text-[10px] font-semibold text-[#10b981] mb-1">
                                  {getTenantName(selectedConversation.tenantId)}
                                </p>
                              )}
                              {msg.content && (
                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                  {msg.content}
                                </p>
                              )}
                              <AttachmentPreview attachments={msg.attachments} isOwn={isAdmin} />
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <p
                                  className={`text-[10px] ${
                                    isAdmin ? "text-white/60" : "text-[#6b7280]"
                                  }`}
                                >
                                  {formatTime(msg.createdAt)}
                                </p>
                                {isAdmin && msg.readAt && (
                                  <span className="text-[10px] text-[#10b981]" title="Lu">
                                    ✓✓
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Delete button - right of client messages */}
                            {!isAdmin && (
                              <div className="flex items-center ml-1.5 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                {deletingMsgId === msg.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      className="text-[10px] font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                                    >
                                      Confirmer
                                    </button>
                                    <button
                                      onClick={() => setDeletingMsgId(null)}
                                      className="text-[10px] font-medium text-[#6b7280] hover:text-[#374151] px-1.5 py-1 rounded transition-colors"
                                    >
                                      Non
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeletingMsgId(msg.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#9ca3af] hover:text-red-500 transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
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
                <FileUploadButton
                  selectedFiles={attachedFiles}
                  onFilesSelected={(files) => setAttachedFiles((prev) => [...prev, ...files])}
                  onRemoveFile={(idx) => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                />
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Tapez votre réponse..."
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
                    variant="primary"
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={isSending || (!messageText.trim() && attachedFiles.length === 0)}
                    className="h-[42px] w-[42px] !p-0 flex-shrink-0"
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
    </div>
  );
}
