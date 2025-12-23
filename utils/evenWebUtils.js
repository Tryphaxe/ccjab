import axios from 'axios';
import toast from 'react-hot-toast';

// 🟢 Fonction pour récupérer la liste des évènements
export const fetchEvents = async (setData, setIsLoading) => {
    try {
        const res = await axios.get('/api/web/even');
        setData(res.data);
    } catch (error) {
        toast.error('Erreur lors du chargement des évènements.');
    } finally {
        if (setIsLoading) setIsLoading(false);
    }
};