import { supabase } from "@/lib/supabaseClient";

export const uploadFile = async (file, bucket) => {
  if (!file) return null;
  
  // 1. Créer un nom de fichier unique (timestamp + nom original nettoyé)
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  // 2. Upload vers Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    console.error('Erreur upload:', error);
    throw error;
  }

  // 3. Récupérer l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};