import axios from 'axios';
import toast from 'react-hot-toast';

// 🟢 Fonction pour récupérer la liste des évènements
export const fetchSalles = async (setData, setIsLoading) => {
    try {
        const res = await axios.get('/api/web/salle');
        setData(res.data);
    } catch (error) {
        toast.error('Erreur lors du chargement des salles.');
    } finally {
        if (setIsLoading) setIsLoading(false);
    }
};