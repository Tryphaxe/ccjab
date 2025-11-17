import axios from 'axios';
import toast from 'react-hot-toast';

export const fetchAgents = async (setData, setIsLoading) => {
    try {
        const res = await axios.get('/api/user/agent');
        setData(res.data);
    } catch (error) {
        toast.error('Erreur lors du chargement des agents.');
    } finally {
        if (setIsLoading) setIsLoading(false);
    }
};