"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Video, ImageIcon, Loader2, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Dash from "./Dash";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // État pour l'édition (contient l'ID du post si on modifie, sinon null)
  const [editingId, setEditingId] = useState(null);

  // États pour les fichiers
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [formData, setFormData] = useState({
    titre: "", contenu: "", type: "ACTU", mediaUrl: "", isPromoted: false
  });

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/post");
      const data = await res.json();
      if (res.ok) setPosts(data);
    } catch (error) { toast.error("Erreur chargement"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  // --- GESTION DU FORMULAIRE (RESET & EDIT) ---
  const resetForm = () => {
    setFormData({ titre: "", contenu: "", type: "ACTU", mediaUrl: "", isPromoted: false });
    setSelectedFile(null);
    setPreviewUrl("");
    setEditingId(null);
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setFormData({
      titre: post.titre,
      contenu: post.contenu || "",
      type: post.type,
      mediaUrl: post.mediaUrl || "",
      isPromoted: post.isPromoted
    });
    setPreviewUrl(post.mediaUrl || "");
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  // --- GESTION DE L'UPLOAD SUPABASE ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux (max 50Mo)");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadToSupabase = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${formData.type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return data.publicUrl;

    } catch (error) {
      console.error("Erreur Supabase:", error);
      throw new Error("Impossible d'envoyer le fichier sur le serveur.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      let finalMediaUrl = formData.mediaUrl;

      // Upload seulement si un nouveau fichier est sélectionné
      if (selectedFile) {
        const uploadToast = toast.loading("Envoi vers le stockage...");
        try {
          finalMediaUrl = await uploadToSupabase(selectedFile);
          toast.success("Fichier stocké !", { id: uploadToast });
        } catch (err) {
          toast.error("Erreur d'upload", { id: uploadToast });
          setSubmitLoading(false);
          return;
        }
      }

      // Détermine la méthode et l'URL
      const method = editingId ? "PUT" : "POST";
      const bodyData = { ...formData, mediaUrl: finalMediaUrl };
      if (editingId) bodyData.id = editingId; // Important pour le PUT

      const res = await fetch(editingId ? "/api/post/update" : "/api/post", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        toast.success(editingId ? "Publication modifiée !" : "Publication créée !");
        setIsDialogOpen(false);
        resetForm();
        fetchPosts();
      } else { 
        const errData = await res.json();
        toast.error(errData.error || "Erreur enregistrement"); 
      }
    } catch (error) { toast.error("Erreur serveur"); }
    finally { setSubmitLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce contenu ?")) return;
    try {
      const res = await fetch(`/api/post?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id));
        toast.success("Supprimé");
      }
    } catch (e) { toast.error("Erreur"); }
  };

  const handleTogglePromote = async (id, status) => {
    const newStatus = !status;
    setPosts(posts.map(p => p.id === id ? { ...p, isPromoted: newStatus } : p));
    try {
      await fetch("/api/post", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPromoted: newStatus })
      });
      toast.success(newStatus ? "Mis à la une" : "Retiré");
    } catch (e) { toast.error("Erreur"); fetchPosts(); }
  };

  // --- LISTE DES POSTS ---
  const PostsList = ({ type }) => {
    const filtered = posts.filter(p => p.type === type);
    if (filtered.length === 0) return <div className="text-center py-20 text-gray-400">Aucun contenu.</div>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((post) => (
          <Card key={post.id} className="group overflow-hidden flex flex-col transition-all">
            <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
              {post.mediaUrl ? (
                post.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <video src={post.mediaUrl} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={post.mediaUrl} alt={post.titre} className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon size={40} />
                </div>
              )}
              <div className="absolute top-3 left-3"><Badge variant="secondary" className="bg-white/90">{post.type}</Badge></div>
            </div>
            <CardContent className="flex-1 p-5">
              <h3 className="font-bold text-lg mb-2 line-clamp-1">{post.titre}</h3>
              <p className="text-sm text-gray-500 line-clamp-3">{post.contenu}</p>
            </CardContent>
            <CardFooter className="p-4 bg-gray-50 border-t flex justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={post.isPromoted} onCheckedChange={() => handleTogglePromote(post.id, post.isPromoted)} />
                <span className="text-xs text-gray-500">{post.isPromoted ? "À la une" : "Standard"}</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(post)} className="text-blue-500 hover:bg-blue-50">
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-red-500 hover:bg-red-50">
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 min-h-screen bg-gray-50/50 p-4">
      <Dash />
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestion des Contenus</h2>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if(!open) resetForm(); // Reset du formulaire à la fermeture
        }}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Créer un contenu
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>{editingId ? "Modifier le contenu" : "Nouveau contenu"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select 
                    onValueChange={(val) => setFormData({ ...formData, type: val })} 
                    value={formData.type} // Important pour l'édition
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="ACTU">Actualité</SelectItem>
                    <SelectItem value="PUB">Publicité (Vidéo/Image)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Titre</Label>
                <Input value={formData.titre} onChange={(e) => setFormData({ ...formData, titre: e.target.value })} required />
              </div>

              <div className="grid gap-2">
                <Label>Média (Image ou Vidéo)</Label>

                {previewUrl && (
                  <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden mb-2 border">
                    {previewUrl.match(/\.(mp4|webm|ogg|mov)$/i) || (selectedFile?.type.startsWith('video')) ? (
                      <video src={previewUrl} className="w-full h-full object-contain" controls />
                    ) : (
                      <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setPreviewUrl(""); }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1">Stockage via Supabase (Max 50Mo)</p>
              </div>

              {formData.type === 'ACTU' && (
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <textarea className="border rounded-md p-2 text-sm" value={formData.contenu} onChange={(e) => setFormData({ ...formData, contenu: e.target.value })} />
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <Switch checked={formData.isPromoted} onCheckedChange={(c) => setFormData({ ...formData, isPromoted: c })} />
                <Label>Mettre à la une</Label>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={submitLoading} className="w-full">
                  {submitLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                  {editingId ? "Mettre à jour" : "Publier"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="ACTU" className="w-full">
        <TabsList><TabsTrigger value="ACTU">Actualités</TabsTrigger><TabsTrigger value="PUB">Publicités</TabsTrigger></TabsList>
        <TabsContent value="ACTU"><PostsList type="ACTU" /></TabsContent>
        <TabsContent value="PUB"><PostsList type="PUB" /></TabsContent>
      </Tabs>
    </div>
  );
}