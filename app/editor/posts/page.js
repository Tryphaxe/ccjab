"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Video, FileText, Megaphone, Loader2, Image as ImageIcon, ExternalLink, Eye } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    titre: "", contenu: "", type: "ACTU", mediaUrl: "", isPromoted: false
  });

  // --- LOGIQUE (Identique à avant) ---
  const fetchPosts = async () => {
    try {
      // Note: Assurez-vous que votre route est bien /api/posts ou /api/post selon votre structure
      const res = await fetch("/api/post"); 
      const data = await res.json();
      if (res.ok) setPosts(data);
    } catch (error) { toast.error("Erreur chargement"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Publication créée !");
        setIsDialogOpen(false);
        setFormData({ titre: "", contenu: "", type: "ACTU", mediaUrl: "", isPromoted: false });
        fetchPosts();
      } else { toast.error("Erreur création"); }
    } catch (error) { toast.error("Erreur serveur"); }
    finally { setSubmitLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce contenu ?")) return;
    try {
      const res = await fetch(`/api/post?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Contenu supprimé");
        setPosts(posts.filter(p => p.id !== id));
      }
    } catch (error) { toast.error("Erreur suppression"); }
  };

  const handleTogglePromote = async (id, currentStatus) => {
    const originalPosts = [...posts];
    setPosts(posts.map(p => p.id === id ? { ...p, isPromoted: !currentStatus } : p));

    try {
      const res = await fetch("/api/post", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPromoted: !currentStatus })
      });

      if (res.ok) {
        toast.success(!currentStatus ? "Mis à la une" : "Retiré de la une");
      } else { throw new Error(); }
    } catch (error) {
      toast.error("Erreur modification");
      setPosts(originalPosts);
    }
  };

  // --- NOUVEAU COMPOSANT D'AFFICHAGE (CARDS) ---
  const PostsList = ({ type }) => {
    const filtered = posts.filter(p => p.type === type);
    
    if (filtered.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                <div className="p-4 bg-gray-50 rounded-full mb-3">
                    {type === 'PUB' ? <Megaphone size={32} /> : <FileText size={32} />}
                </div>
                <p>Aucun contenu de ce type pour le moment.</p>
            </div>
        );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((post) => (
            <Card key={post.id} className="group overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 border-gray-200">
                
                {/* ZONE IMAGE / HEADER */}
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    {post.mediaUrl ? (
                        <img 
                            src={post.mediaUrl} 
                            alt={post.titre} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.target.style.display = 'none'; }} // Cache l'image si lien cassé
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                            {type === 'PUB' ? <Video size={40} /> : <ImageIcon size={40} />}
                        </div>
                    )}
                    
                    {/* Badge TYPE en haut à gauche */}
                    <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-black shadow-sm font-semibold">
                            {post.type}
                        </Badge>
                    </div>

                    {/* Badge PROMU en haut à droite */}
                    {post.isPromoted && (
                        <div className="absolute top-3 right-3">
                             <Badge className="bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                                <Eye size={10} /> À la une
                             </Badge>
                        </div>
                    )}
                </div>

                {/* ZONE CONTENU */}
                <CardContent className="flex-1 p-5">
                    <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-1" title={post.titre}>
                        {post.titre}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-3 h-[60px]">
                        {post.contenu || "Aucune description..."}
                    </p>
                    
                    {post.mediaUrl && (
                        <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-xs text-blue-600 hover:underline">
                            <ExternalLink size={12} className="mr-1"/> Voir le média original
                        </a>
                    )}
                </CardContent>

                {/* ZONE ACTIONS (Footer) */}
                <CardFooter className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Switch 
                            id={`promote-${post.id}`}
                            checked={post.isPromoted} 
                            onCheckedChange={() => handleTogglePromote(post.id, post.isPromoted)}
                        />
                        <Label htmlFor={`promote-${post.id}`} className="text-xs cursor-pointer text-gray-600 font-medium">
                            {post.isPromoted ? "En ligne" : "Hors ligne"}
                        </Label>
                    </div>

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(post.id)} 
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={16} />
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 min-h-screen bg-gray-50/50 p-6">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Gestion des Contenus</h2>
            <p className="text-gray-500 mt-1">Gérez les actualités et les publicités affichées sur le site.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black hover:bg-gray-800 text-white shadow-lg transition-all hover:-translate-y-0.5">
                <Plus className="mr-2 h-4 w-4" /> Créer un contenu
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Nouveau contenu</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>Type de contenu</Label>
                <Select onValueChange={(val) => setFormData({ ...formData, type: val })} defaultValue={formData.type}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="ACTU">Actualité (Article)</SelectItem>
                    <SelectItem value="PUB">Publicité (Bannière/Vidéo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                  <Label>Titre</Label>
                  <Input 
                    value={formData.titre} 
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })} 
                    placeholder="Ex: Festival des arts..."
                    required 
                   />
              </div>
              {formData.type === 'ACTU' && (
                  <div className="grid gap-2">
                      <Label>Contenu / Description</Label>
                      <textarea 
                        className="border rounded-md p-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-black/5" 
                        value={formData.contenu} 
                        onChange={(e) => setFormData({ ...formData, contenu: e.target.value })} 
                        placeholder="Détails de l'article..."
                      />
                  </div>
              )}
              <div className="grid gap-2">
                  <Label>Lien Média (Image URL)</Label>
                  <Input 
                    value={formData.mediaUrl} 
                    onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })} 
                    placeholder="https://exemple.com/image.jpg" 
                   />
              </div>
              <div className="flex items-center space-x-2 pt-4 bg-gray-50 p-3 rounded-md border border-gray-100">
                  <Switch checked={formData.isPromoted} onCheckedChange={(c) => setFormData({ ...formData, isPromoted: c })} />
                  <div className="flex flex-col">
                      <Label className="font-semibold">Mettre à la une</Label>
                      <span className="text-xs text-gray-500">Visible sur la page d'accueil du site</span>
                  </div>
              </div>
              <DialogFooter>
                  <Button type="submit" disabled={submitLoading} className="w-full">
                      {submitLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                      Publier maintenant
                  </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ONGLETS */}
      <Tabs defaultValue="ACTU" className="w-full">
        <TabsList className="bg-white p-1 border border-gray-200 rounded-lg mb-6">
            <TabsTrigger value="ACTU" className="data-[state=active]:bg-gray-100 data-[state=active]:text-black px-6">Actualités</TabsTrigger>
            <TabsTrigger value="PUB" className="data-[state=active]:bg-gray-100 data-[state=active]:text-black px-6">Publicités</TabsTrigger>
        </TabsList>

        <TabsContent value="ACTU" className="outline-none">
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : (
                <PostsList type="ACTU" />
            )}
        </TabsContent>
        
        <TabsContent value="PUB" className="outline-none">
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : (
                <PostsList type="PUB" />
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}