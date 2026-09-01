"use client";

import { useEffect, useState } from "react";
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
  message: string;
  createdAt: string;
};

export default function ParentChatPage() {
  const router = useRouter();
  const params = useParams();

  const sessionId = Number(params.sessionId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [currentUserId, setCurrentUserId] =
    useState<number | null>(null);

  /* =========================
     GET CURRENT USER
  ========================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      setCurrentUserId(Number(payload.userId));
    } catch {
      console.error("Unable to read JWT.");
    }
  }, [router]);

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
          : "Unable to load chat."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sessionId) return;

    loadMessages();
  }, [sessionId]);

  /* =========================
     SEND MESSAGE
  ========================= */

  async function handleSendMessage() {
    const trimmedMessage =
      message.trim();

    if (!trimmedMessage) return;

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
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSendMessage();
    }
  }

  /* =========================
     FORMAT TIME
  ========================= */

  function formatTime(
    createdAt: string
  ) {
    return new Date(
      createdAt
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  return (
    <main className={styles.page}>

      {/* ================= HEADER ================= */}

      <header className={styles.header}>

        <button
          type="button"
          className={styles.backButton}
          onClick={() =>
            router.push("/parent")
          }
        >
          ←
        </button>

        <div>
          <h1>Chat with Tutor</h1>
          <p>
            Session #{sessionId}
          </p>
        </div>

      </header>

      {/* ================= CHAT ================= */}

      <section className={styles.chatContainer}>

        <div className={styles.chatHeader}>
          <div className={styles.avatar}>
            👨‍🏫
          </div>

          <div>
            <strong>
              Tutor
            </strong>

            <span>
              Session chat
            </span>
          </div>
        </div>

        {/* ================= MESSAGES ================= */}

        <div className={styles.messages}>

          {loading ? (
            <div className={styles.centerMessage}>
              Loading messages...
            </div>
          ) : error ? (
            <div className={styles.centerMessage}>
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyMessage}>
              <div>
                💬
              </div>

              <strong>
                Start the conversation
              </strong>

              <span>
                Send a message to your tutor.
              </span>
            </div>
          ) : (
            messages.map((chatMessage) => {

              const isMine =
                currentUserId !== null &&
                chatMessage.senderId ===
                  currentUserId;

              return (
                <div
                  key={chatMessage.id}
                  className={`${styles.messageRow} ${
                    isMine
                      ? styles.myMessageRow
                      : styles.tutorMessageRow
                  }`}
                >

                  <div
                    className={`${styles.messageBubble} ${
                      isMine
                        ? styles.myMessage
                        : styles.tutorMessage
                    }`}
                  >

                    {!isMine && (
                      <span
                        className={
                          styles.senderName
                        }
                      >
                        {chatMessage.senderName}
                      </span>
                    )}

                    <p>
                      {chatMessage.message}
                    </p>

                    <small>
                      {formatTime(
                        chatMessage.createdAt
                      )}
                    </small>

                  </div>

                </div>
              );
            })
          )}

        </div>

        {/* ================= ERROR ================= */}

        {error && !loading && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {/* ================= INPUT ================= */}

        <div className={styles.inputArea}>

          <textarea
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={sending}
          />

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={
              sending ||
              !message.trim()
            }
          >
            {sending
              ? "..."
              : "Send"}
          </button>

        </div>

      </section>

    </main>
  );
}
