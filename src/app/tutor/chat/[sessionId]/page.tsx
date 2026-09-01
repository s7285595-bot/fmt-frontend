"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getChatMessages,
  sendChatMessage,
} from "@/lib/api";
import styles from "./page.module.css";

type ChatMessage = {
  id: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  message: string;
  createdAt: string;
};

function getCurrentUserEmail(): string | null {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    return payload.sub ?? payload.email ?? null;
  } catch {
    return null;
  }
}

export default function TutorChatPage() {
  const params = useParams();
  const router = useRouter();

  const sessionId = Number(params.sessionId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentUserEmail = getCurrentUserEmail();

  async function loadMessages() {
    try {
      setError("");

      const result = await getChatMessages(sessionId);

      setMessages(result);
    } catch (err) {
      console.error("LOAD CHAT ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load chat messages."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sessionId || Number.isNaN(sessionId)) {
      setError("Invalid session.");
      setLoading(false);
      return;
    }

    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSend() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const newMessage = await sendChatMessage(
        sessionId,
        trimmedMessage
      );

      setMessages((previous) => [
        ...previous,
        newMessage,
      ]);

      setMessage("");
    } catch (err) {
      console.error("SEND CHAT ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/");
  }

  return (
    <main className={styles.page}>
      {/* HEADER */}

      <header className={styles.header}>
        <div
          className={styles.logo}
          onClick={() => router.push("/tutor")}
        >
          Find<span>MyTutor</span>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() =>
              router.push("/tutor/sessions")
            }
          >
            ← My Sessions
          </button>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* CHAT */}

      <section className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <div>
            <h1>Chat with Parent</h1>

            <p>
              Session #{sessionId}
            </p>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className={styles.errorBox}>
            {error}
          </div>
        )}

        {/* MESSAGES */}

        <div className={styles.messages}>
          {loading ? (
            <div className={styles.loading}>
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                💬
              </div>

              <h2>No messages yet</h2>

              <p>
                Start the conversation with the
                parent.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine =
                currentUserEmail !== null &&
                msg.senderEmail === currentUserEmail;

              return (
                <div
                  key={msg.id}
                  className={`${styles.messageRow} ${
                    isMine
                      ? styles.myMessageRow
                      : styles.otherMessageRow
                  }`}
                >
                  <div
                    className={`${styles.messageBubble} ${
                      isMine
                        ? styles.myMessage
                        : styles.otherMessage
                    }`}
                  >
                    {!isMine && (
                      <div className={styles.senderName}>
                        {msg.senderName}
                      </div>
                    )}

                    <div className={styles.messageText}>
                      {msg.message}
                    </div>

                    <div className={styles.messageTime}>
                      {new Date(
                        msg.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}

        <div className={styles.inputArea}>
          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            disabled={sending}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={
              sending || !message.trim()
            }
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </section>
    </main>
  );
}