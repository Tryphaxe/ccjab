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

export const fetchVisible = async (setData, setIsLoading) => {
	try {
		const res = await axios.get('/api/salle/visible');
		setData(res.data);
	} catch (error) {
		toast.error('Erreur lors du chargement des salles visibles.');
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

export const updateSalleVisibility = async (id, visible) => {
  try {
    const response = await fetch(`/api/salle/${id}`, { // Assurez-vous que cette route existe pour gérer le PATCH/PUT
      method: 'PATCH', // ou PUT
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ visible }),
    });
	toast.success("La salle a bien changé de visibilité.");
    return await response.json();
  } catch (error) {
    toast.error(error?.response?.data?.error || "Erreur lors de la mise à jour");
  }
};

// utils/salleUtils.js

export const updateSalleFull = async (up, formData, reloadCallback) => {
    try {
        const response = await fetch(`/api/salle/modif-${up}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Erreur lors de la modification');
        
        // Si tout est bon, on recharge la liste
        if (reloadCallback) reloadCallback();
        
    } catch (error) {
        console.error(error);
        alert("Erreur lors de la modification de la salle");
    }
};