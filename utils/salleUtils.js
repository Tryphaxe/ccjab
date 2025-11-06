import axios from 'axios';
import toast from 'react-hot-toast';

export const fetchSalles = async (setData, setIsLoading) => {
	try {
		const res = await axios.get('/api/salle');
		setData(res.data);
	} catch (error) {
		toast.error('Erreur lors du chargement des salles.');
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
			url: "/api/salle",
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
export const deleteSalle = async (id, reload = null) => {

	const toastDep = toast.loading("Suppression en cours...");

	try {
		await axios.delete(`/api/salle/${id}`);
		toast.success("Salle supprimée avec succès.", { id: toastDep });

		if (reload) reload();
	} catch (error) {
		const message = error?.response?.data?.error || "Erreur lors de la suppression.";
		toast.error(message, { id: toastDep });
	}
};