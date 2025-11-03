import axios from 'axios';
import toast from 'react-hot-toast';

export const fetchAgents = async (setData, setIsLoading) => {
    try {
        const res = await axios.get('/api/agent');
        setData(res.data);
    } catch (error) {
        toast.error('Erreur lors du chargement des agents.');
    } finally {
        if (setIsLoading) setIsLoading(false);
    }
};

export const submitForm = async ({
    data,
    onSuccess,
    onError,
    setLoading,
    reload,
    successMessage = 'Enregistré avec succès.',
    errorMessage = 'Erreur lors de l\'enregistrement.',
}) => {
    setLoading(true);
    const toastDep = toast.loading("Enregistrement en cours...");

    try {
        const res = await axios({
            method: 'post',
            url: "/api/agent",
            data,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        toast.success(successMessage, { id: toastDep });

        if (onSuccess) onSuccess(res.data);
        if (reload) reload();

    } catch (error) {
        const message =
            error?.response?.data?.error || errorMessage;

        toast.error(message, { id: toastDep });

        if (onError) onError(error);
    } finally {
        setLoading(false);
    }
};

//  Fonction pour supprimer
export const deleteAgent = async (id, reload = null) => {

    const toastDep = toast.loading("Suppression en cours...");

    try {
        await axios.delete(`/api/agent/${id}`);
        toast.success("Agent supprimé avec succès.", { id: toastDep });

        if (reload) reload();
    } catch (error) {
        const message = error?.response?.data?.error || "Erreur lors de la suppression.";
        toast.error(message, { id: toastDep });
    }
};

export const updateAgent = async (id, data, reload, setLoading, onClose) => {
    const toastId = toast.loading("Mise à jour en cours...");

    try {
        const res = await axios.patch(`/api/agent/${id}`, data);

        if (res.status === 200) {
            toast.success("Agent mis à jour avec succès ✅", { id: toastId });
            if (reload) reload();
            if (onClose) onClose();
        } else {
            toast.error("Erreur inattendue lors de la mise à jour.", { id: toastId });
        }
    } catch (error) {
        const message =
            error?.response?.data?.error ||
            error?.message ||
            "Erreur lors de la mise à jour.";
        toast.error(message, { id: toastId });
    } finally {
        if (setLoading) setLoading(false);
    }
};