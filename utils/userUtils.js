import axios from 'axios';
import toast from 'react-hot-toast';

export const fetchUsers = async (setData, setIsLoading) => {
    try {
        const res = await axios.get('/api/user');
        setData(res.data);
    } catch (error) {
        toast.error('Erreur lors du chargement des Users.');
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
            url: "/api/user",
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
export const deleteUser = async (id, reload = null) => {

    const toastDep = toast.loading("Suppression en cours...");

    try {
        await axios.delete(`/api/user/${id}`);
        toast.success("Utilisateur supprimé avec succès.", { id: toastDep });

        if (reload) reload();
    } catch (error) {
        const message = error?.response?.data?.error || "Erreur lors de la suppression.";
        toast.error(message, { id: toastDep });
    }
};

export const updateUser = async (id, data, reload, setLoading, onClose) => {
    const toastId = toast.loading("Mise à jour en cours...");

    try {
        await axios.patch(`/api/user/${id}`, data);
        toast.success("Utilisateur mis à jour avec succès.", { id: toastId });
        if (reload) reload();
        if (onClose) onClose();
    } catch (error) {
        const message =
            error?.response?.data?.error || "Erreur lors de la mise à jour.";
        toast.error(message, { id: toastId });
    } finally {
        setLoading(false);
    }
};