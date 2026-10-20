import axios from 'axios';
import toast from 'react-hot-toast';

// 🟢 Fonction pour récupérer la liste des évènements
export const fetchEvents = async (setData, setIsLoading) => {
    try {
        const res = await axios.get('/api/even');
        setData(res.data);
    } catch (error) {
        toast.error('Erreur lors du chargement des évènements.');
    } finally {
        if (setIsLoading) setIsLoading(false);
    }
};

// 🟢 Fonction pour enregistrer un évènement
export const submitForm = async ({
    data,
    onSuccess,
    onError,
    setLoading,
    reload,
    successMessage = 'Évènement enregistré avec succès.',
    errorMessage = "Erreur lors de l'enregistrement de l'évènement.",
}) => {
    setLoading(true);
    const toastDep = toast.loading("Enregistrement en cours...");

    try {
        const res = await axios({
            method: 'post',
            url: "/api/even",
            data,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        toast.success(successMessage, { id: toastDep });

        if (onSuccess) onSuccess(res.data);
        if (reload) reload();

    } catch (error) {
        const message = error?.response?.data?.error || errorMessage;
        toast.error(message, { id: toastDep });
        if (onError) onError(error);
    } finally {
        setLoading(false);
    }
};

// 🗑️ Fonction pour supprimer un évènement
export const deleteEvent = async (id, reload = null) => {
    const toastDep = toast.loading("Suppression en cours...");

    try {
        await axios.delete(`/api/even/${id}`);
        toast.success("Évènement supprimé avec succès.", { id: toastDep });

        if (reload) reload();
    } catch (error) {
        const message = error?.response?.data?.error || "Erreur lors de la suppression de l'évènement.";
        toast.error(message, { id: toastDep });
    }
};

// ✏️ Fonction pour modifier un évènement
export const updateEvent = async (id, data, reload, setLoading, onClose) => {
    const toastId = toast.loading("Mise à jour en cours...");

    try {
        await axios.patch(`/api/even/${id}`, data);
        toast.success("Évènement mis à jour avec succès.", { id: toastId });
        if (reload) reload();
        if (onClose) onClose();
    } catch (error) {
        const message = error?.response?.data?.error || "Erreur lors de la mise à jour de l'évènement.";
        toast.error(message, { id: toastId });
    } finally {
        setLoading(false);
    }
};

// Ajoutez ceci à vos imports si besoin
// import { toast } from "sonner" ou votre lib de notification

export const deleteManyEvents = async (ids, reloadCallback) => {
  try {
    const response = await fetch('/api/even/bulk-delete', {
      method: 'POST', // On utilise POST souvent pour envoyer un body complexe, ou DELETE si votre backend le supporte avec body
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }

    const data = await response.json();
    
    // Notification de succès (exemple avec alert, remplacez par toast si vous avez)
    // alert(data.message); 
    toast.success("Suppression réussie.");
    
    // Recharger la liste
    if (reloadCallback) reloadCallback();

  } catch (error) {
    toast.error("Impossible de supprimer les évènements sélectionnés.");
  }
};

export const updateEventVisibility = async (id, visible) => {
  try {
    const response = await fetch(`/api/even/${id}`, {
      method: 'PATCH', // ou PUT
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ visible }),
    });
	toast.success("L'évènement a bien changé de visibilité.");
    return await response.json();
  } catch (error) {
    toast.error(error?.response?.data?.error || "Erreur lors de la mise à jour");
  }
};

export const fetchEventPage = async ({ page, pageSize, filters = {} }, setData, setTotal, setIsLoading) => {
    setIsLoading?.(true);
    try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        const keys = { agent: 'agent', type: 'type', categorie: 'category', statut: 'status', date_debut: 'dateStart', date_fin: 'dateEnd', q: 'q' };
        Object.entries(keys).forEach(([key, queryKey]) => {
            if (filters[key]) params.set(queryKey, filters[key]);
        });
        const { data } = await axios.get(`/api/even/search?${params.toString()}`);
        setData(data.events);
        setTotal(data.total);
    } catch (error) {
        toast.error(error?.response?.data?.error || 'Erreur lors du chargement des événements.');
    } finally {
        setIsLoading?.(false);
    }
};
