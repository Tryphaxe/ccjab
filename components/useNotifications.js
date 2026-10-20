"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/AuthContext";

const POLL_INTERVAL_MS = 30_000;

export const useNotifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [nonluCount, setNonluCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, isAgent } = useAuth();
  const hasLoadedNotifications = useRef(false);
  const notificationsRef = useRef([]);

  const fetchNotifications = useCallback(async ({ notifyNew = false, signal } = {}) => {
    if (!isAgent || !user?.id) return;

    try {
      const response = await fetch("/api/notif", { cache: "no-store", signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Impossible de charger les notifications.");

      const nextNotifications = Array.isArray(result.notifications) ? result.notifications : [];
      if (notifyNew && hasLoadedNotifications.current) {
        const existingIds = new Set(notificationsRef.current.map((notification) => notification.id));
        nextNotifications
          .filter((notification) => !notification.isRead && !existingIds.has(notification.id))
          .forEach((notification) => toast(notification.message, { icon: "✦" }));
      }

      setNotifs(nextNotifications);
      notificationsRef.current = nextNotifications;
      setNonluCount(Number(result.unreadCount) || 0);
      setError("");
      hasLoadedNotifications.current = true;
    } catch (fetchError) {
      if (fetchError.name !== "AbortError") {
        console.error("Erreur de chargement des notifications:", fetchError.message);
        setError(fetchError.message || "Impossible de charger les notifications.");
      }
    } finally {
      if (signal?.aborted !== true) setIsLoading(false);
    }
  }, [isAgent, user?.id]);

  const updateNotifications = useCallback(async (body) => {
    const response = await fetch("/api/notif", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Impossible de mettre à jour les notifications.");
    return result;
  }, []);

  const markAsRead = useCallback(async (id) => {
    if (!isAgent || !user?.id) return;
    const notification = notificationsRef.current.find((item) => item.id === id);
    try {
      await updateNotifications({ id });
      notificationsRef.current = notificationsRef.current.map((item) => item.id === id ? { ...item, isRead: true } : item);
      setNotifs(notificationsRef.current);
      if (notification && !notification.isRead) setNonluCount((count) => Math.max(0, count - 1));
      setError("");
    } catch (updateError) {
      console.error("Erreur de mise à jour des notifications:", updateError.message);
      setError(updateError.message || "Impossible de mettre à jour la notification.");
    }
  }, [isAgent, user?.id, notifs, updateNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!isAgent || !user?.id) return;
    try {
      await updateNotifications({ markAllRead: true });
      notificationsRef.current = notificationsRef.current.map((item) => ({ ...item, isRead: true }));
      setNotifs(notificationsRef.current);
      setNonluCount(0);
      setError("");
    } catch (updateError) {
      console.error("Erreur de mise à jour des notifications:", updateError.message);
      setError(updateError.message || "Impossible de mettre à jour les notifications.");
    }
  }, [isAgent, user?.id, updateNotifications]);

  useEffect(() => {
    if (!isAgent || !user?.id) {
      setNotifs([]);
      notificationsRef.current = [];
      setNonluCount(0);
      setError("");
      setIsLoading(false);
      hasLoadedNotifications.current = false;
      return;
    }

    const controller = new AbortController();
    hasLoadedNotifications.current = false;
    setIsLoading(true);
    fetchNotifications({ signal: controller.signal });

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchNotifications({ notifyNew: true, signal: controller.signal });
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchNotifications({ notifyNew: true, signal: controller.signal });
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      controller.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAgent, user?.id, fetchNotifications]);

  return { notifs, nonluCount, markAsRead, markAllAsRead, isLoading, error };
};
