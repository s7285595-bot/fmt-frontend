tsx
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

export default function TutorChatPage() {
  const router = useRouter();
  const params = useParams();

  const sessionId = Number(params.sessionId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* =========================
     GET CURRENT USER
  ========================= */

  function getCurrentUserEmail() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));

    return payload.sub ?? payload.email ?? null;
  } catch {
    return null;
  }
}
  /* =========================
     LOAD MESSAGES
  ========================= */

  async function loadMessages() {
    try {
      setError("");

      const result =
        await getChatMessages(sessionId);

      setMessages(result);
    } catch (error) {
      console.error(
        "LOAD CHAT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load messages."
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

    /*
      Refresh messages every 3 seconds.
      This gives us simple chat functionality
      without WebSocket yet.
    */

    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [sessionId]);

  /* =========================
     AUTO SCROLL
  ========================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* =========================
     SEND MESSAGE
  ========================= */

  async function handleSend() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    if (sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const newMessage =
        await sendChatMessage(
          sessionId,
          trimmedMessage
        );

      setMessages((previous) => [
        ...previous,
        newMessage,
      ]);

      setMessage("");
    } catch (error) {
      console.error(
        "SEND CHAT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  /* =========================
     ENTER KEY
  ========================= */

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  }

const currentUserEmail =
  getCurrentUserEmail();

  return (
    <main className={styles.page}>

      {/* HEADER */}

      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.push("/tutor")}
        >
          ←
        </button>

        <div className={styles.tutorInfo}>
          <div className={styles.avatar}>
            👤
          </div>

          <div>
            <h2>Parent</h2>
            <span>
              Session #{sessionId}
            </span>
          </div>
        </div>
      </header>


      {/* CHAT */}

      <section className={styles.chatContainer}>

        <div className={styles.messages}>

          {loading ? (
            <div className={styles.centerMessage}>
              Loading messages...
            </div>
          ) : error ? (
            <div className={styles.error}>
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                💬
              </div>

              <h3>
                Start the conversation
              </h3>

              <p>
                Send a message to the parent
                about the upcoming session.
              </p>
            </div>
          ) : (
            messages.map((msg) => {

              const isMine =
                currentUserId !== null &&
                Number(msg.senderId) ===
                  currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`${styles.messageRow} ${
                    isMine
                      ? styles.myMessageRow
                      : styles.theirMessageRow
                  }`}
                >
                  <div
                    className={`${styles.messageBubble} ${
                      isMine
                        ? styles.myMessage
                        : styles.theirMessage
                    }`}
                  >
                    {!isMine && (
                      <span
                        className={
                          styles.senderName
                        }
                      >
                        {msg.senderName}
                      </span>
                    )}

                    <p>
                      {msg.message}
                    </p>

                    <span
                      className={styles.time}
                    >
                      {new Date(
                        msg.createdAt
                      ).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />

        </div>


        {/* ERROR */}

        {error && !loading && (
          <div className={styles.errorBar}>
            {error}
          </div>
        )}


        {/* INPUT */}

        <div className={styles.inputArea}>

          <input
            type="text"
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={sending}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={
              sending ||
              !message.trim()
            }
          >
            {sending ? "..." : "➤"}
          </button>

        </div>

      </section>

    </main>
  );
}

