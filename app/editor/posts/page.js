"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, ImageIcon, Loader2, Pencil, UploadCloud, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea"; // Assure-toi d'avoir ce composant ou utilise <textarea> standard
import Dash from "./Dash";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false); // État pour le drag & drop

  const [editingId, setEditingId] = useState(null);
  const [oldMediaUrl, setOldMediaUrl] = useState(""); // Pour stocker l'URL à supprimer si on change d'image

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

  // --- GESTION DU FORMULAIRE ---
  const resetForm = () => {
    setFormData({ titre: "", contenu: "", type: "ACTU", mediaUrl: "", isPromoted: false });
    setSelectedFile(null);
    setPreviewUrl("");
    setEditingId(null);
    setOldMediaUrl("");
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
    setOldMediaUrl(post.mediaUrl || ""); // On garde l'ancien URL en mémoire
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  // --- GESTION DU DRAG & DROP & FICHIERS ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (Max 50Mo)");
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // --- LOGIQUE SUPABASE (Upload & Delete) ---

  // Fonction pour extraire le chemin du fichier depuis l'URL publique Supabase
  const getPathFromUrl = (url) => {
    if (!url) return null;
    // Exemple URL: https://xyz.supabase.co/storage/v1/object/public/media/ACTU/image.jpg
    // On veut récupérer: ACTU/image.jpg
    const parts = url.split('/media/');
    return parts.length > 1 ? parts[1] : null;
  };

  const deleteFromSupabase = async (url) => {
    if (!url) return;
    const path = getPathFromUrl(url);
    if (path) {
      const { error } = await supabase.storage.from('media').remove([path]);
      if (error) console.error("Erreur suppression image:", error);
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

      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Erreur Supabase:", error);
      throw new Error("Impossible d'envoyer le fichier.");
    }
  };

  // --- SOUMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      let finalMediaUrl = formData.mediaUrl;

      // 1. Upload du nouveau fichier
      if (selectedFile) {
        const uploadToast = toast.loading("Envoi du média...");
        try {
          finalMediaUrl = await uploadToSupabase(selectedFile);

          // 2. Si on est en édition et qu'on a mis une nouvelle image, supprimer l'ancienne
          if (editingId && oldMediaUrl && oldMediaUrl !== finalMediaUrl) {
            await deleteFromSupabase(oldMediaUrl);
          }

          toast.success("Média envoyé !", { id: uploadToast });
        } catch (err) {
          toast.error("Erreur d'upload", { id: uploadToast });
          setSubmitLoading(false);
          return;
        }
      }

      // 3. Sauvegarde en BDD
      const method = editingId ? "PUT" : "POST";
      const bodyData = { ...formData, mediaUrl: finalMediaUrl };
      if (editingId) bodyData.id = editingId;

      const res = await fetch(editingId ? "/api/post/update" : "/api/post", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        toast.success(editingId ? "Publication mise à jour !" : "Publication créée !");
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

  const handleDelete = async (post) => {
    if (!confirm("Voulez-vous vraiment supprimer ce contenu ? Cette action est irréversible.")) return;

    // Optimistic UI update (suppression visuelle immédiate)
    const previousPosts = [...posts];
    setPosts(posts.filter(p => p.id !== post.id));

    try {
      // 1. Supprimer l'image associée de Supabase
      if (post.mediaUrl) {
        await deleteFromSupabase(post.mediaUrl);
      }

      // 2. Supprimer de la BDD
      const res = await fetch(`/api/post?id=${post.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Supprimé avec succès");
      } else {
        throw new Error("Erreur API");
      }
    } catch (e) {
      setPosts(previousPosts); // Rétablir si erreur
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleTogglePromote = async (id, status) => {
    const newStatus = !status;
    setPosts(posts.map(p => p.id === id ? { ...p, isPromoted: newStatus } : p)); // Optimistic UI
    try {
      await fetch("/api/post", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPromoted: newStatus })
      });
      toast.success(newStatus ? "Mis à la une" : "Retiré de la une");
    } catch (e) { toast.error("Erreur mise à jour"); fetchPosts(); }
  };

  // --- LISTE DES POSTS ---
  const PostsList = ({ type }) => {
    const filtered = posts.filter(p => p.type === type);
    if (filtered.length === 0) return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
        <div className="bg-gray-50 p-4 rounded-full mb-3"><ImageIcon size={32} /></div>
        <p>Aucun contenu dans cette catégorie.</p>
      </div>
    );

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((post) => (
          <Card key={post.id} className="group overflow-hidden flex flex-col hover:shadow-lg transition-all border-gray-200">
            <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
              {post.mediaUrl ? (
                post.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <video src={post.mediaUrl} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={post.mediaUrl} alt={post.titre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon size={40} />
                </div>
              )}
              {/* Badge Overlay */}
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className={`${post.type === 'ACTU' ? 'bg-emerald-500' : 'bg-purple-500'} text-white border-none shadow-sm`}>
                  {post.type}
                </Badge>
              </div>
            </div>
            <CardContent className="flex-1 p-5">
              <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">{post.titre}</h3>
              <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{post.contenu || "Pas de description"}</p>
            </CardContent>
            <CardFooter className="p-4 bg-gray-50/50 border-t flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Switch
                  id={`promote-${post.id}`}
                  checked={post.isPromoted}
                  onCheckedChange={() => handleTogglePromote(post.id, post.isPromoted)}
                />
                <Label htmlFor={`promote-${post.id}`} className="text-xs text-gray-500 cursor-pointer">
                  {post.isPromoted ? "À la une" : "Standard"}
                </Label>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(post)} className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600 rounded-full">
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(post)} className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full">
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
    <div className="space-y-8 min-h-screen bg-gray-50/50 p-4 lg:p-8">
      <Dash />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Gestion des Contenus</h2>
          <p className="text-gray-500 mt-1">Gérez les actualités et les publicités du site web.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Créer un contenu
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-[600px] overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle className="text-xl">{editingId ? "Modifier le contenu" : "Nouveau contenu"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6 max-h-[75vh] overflow-y-auto custom-scrollbar">

              {/* Type Selection */}
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-gray-700">Type de contenu</Label>
                <Select
                  onValueChange={(val) => setFormData({ ...formData, type: val })}
                  value={formData.type}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="ACTU">Actualité (Article, Évènement)</SelectItem>
                    <SelectItem value="PUB">Publicité (Vidéo/Image promotionnelle)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Titre */}
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-gray-700">Titre</Label>
                <Input
                  placeholder="Ex: Festival des Arts 2024..."
                  className="focus-visible:ring-emerald-500"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  required
                />
              </div>

              {/* Upload Zone (Drag & Drop) */}
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-gray-700">Média (Image ou Vidéo)</Label>

                <div
                  className={`relative w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer
                    ${dragActive ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100"}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {previewUrl ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-black/5">
                      {previewUrl.match(/\.(mp4|webm|ogg|mov)$/i) || (selectedFile?.type.startsWith('video')) ? (
                        <video src={previewUrl} className="w-full h-full object-contain" controls />
                      ) : (
                        <img src={previewUrl} alt="Aperçu" className="w-full h-full object-contain" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault(); // Empêche le click sur l'input
                          setSelectedFile(null);
                          setPreviewUrl("");
                        }}
                        className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1.5 shadow-md hover:bg-red-50 z-10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 pointer-events-none">
                      <div className="bg-white p-3 rounded-full shadow-sm w-fit mx-auto mb-3">
                        <UploadCloud className="h-6 w-6 text-emerald-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">Cliquez ou glissez un fichier ici</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, MP4 jusqu'à 50Mo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contenu (Textarea amélioré) */}
              {formData.type === 'ACTU' && (
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-gray-700">Contenu de l'article</Label>
                  <Textarea
                    className="min-h-[150px] focus-visible:ring-emerald-500"
                    placeholder="Écrivez votre article ici..."
                    value={formData.contenu}
                    onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                  />
                </div>
              )}

              {/* Options */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="space-y-0.5">
                  <Label className="text-base">Mettre à la une</Label>
                  <p className="text-xs text-gray-500">Apparaîtra en grand sur la page d'accueil.</p>
                </div>
                <Switch
                  checked={formData.isPromoted}
                  onCheckedChange={(c) => setFormData({ ...formData, isPromoted: c })}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={submitLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]">
                  {submitLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingId ? "Mettre à jour" : "Publier"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="ACTU" className="w-full">
        <TabsList className="bg-white p-1 rounded-xl border">
          <TabsTrigger value="ACTU" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">Actualités</TabsTrigger>
          <TabsTrigger value="PUB" className="rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Publicités</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>)}
            </div>
          ) : (
            <>
              <TabsContent value="ACTU"><PostsList type="ACTU" /></TabsContent>
              <TabsContent value="PUB"><PostsList type="PUB" /></TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
}