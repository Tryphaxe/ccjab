"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/AuthContext";

export const useNotifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [nonluCount, setNonluCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // 🔹 Récupération initiale des notifications de l’agent connecté
  const fetchNotifications = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("Notif")
      .select("*")
      .eq("agent_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur Supabase:", error);
      setIsLoading(false);
      return;
    }

    setNotifs(data);
    setNonluCount(data.filter((n) => !n.isRead).length);
    setIsLoading(false);
  };

  // 🔹 Marquer une notification comme lue
  const markAsRead = async (id) => {
    const { error } = await supabase
      .from("Notif")
      .update({ isRead: true })
      .eq("id", id);

    if (error) {
      console.error("Erreur Supabase:", error);
      return;
    }

    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setNonluCount((prev) => Math.max(0, prev - 1));
  };

  // 🔹 Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    if (!user?.id) return;

    const { error } = await supabase
      .from("Notif")
      .update({ isRead: true })
      .eq("agent_id", user.id)
      .eq("isRead", false);

    if (error) {
      console.error("Erreur Supabase:", error);
      return;
    }

    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setNonluCount(0);
  };

  // 🔹 Abonnement temps réel
  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    const channel = supabase
      .channel("realtime_notifs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Notif", filter: `agent_id=eq.${user.id}` },
        (payload) => {
          const newNotif = payload.new;
          setNotifs((prev) => [newNotif, ...prev]);
          setNonluCount((prev) => prev + 1);
          toast(newNotif.message, { icon: "✦" });
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { notifs, nonluCount, markAsRead, markAllAsRead, isLoading };
};