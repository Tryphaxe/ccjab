import axios from 'axios';
import toast from 'react-hot-toast';

export const fetchCommodites = async (setData, setIsLoading) => {
	try {
		const res = await axios.get('/api/commodite');
		setData(res.data);
	} catch (error) {
		toast.error('Erreur lors du chargement des commodités.');
	} finally {
		if (setIsLoading) setIsLoading(false);
	}
};

export const submitCommodite = async ({
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
			url: "/api/commodite",
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
export const deleteCommodite = async (id, reload = null) => {

	const toastDep = toast.loading("Suppression en cours...");

	try {
		await axios.delete(`/api/commodite/${id}`);
		toast.success("Commodite supprimée avec succès.", { id: toastDep });
		if (reload) reload();
	} catch (error) {
		const message = error?.response?.data?.error || "Erreur lors de la suppression.";
		toast.error(message, { id: toastDep });
	}
};