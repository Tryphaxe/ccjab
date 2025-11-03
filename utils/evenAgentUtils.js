import axios from 'axios';
import toast from 'react-hot-toast';

// 🟢 Fonction pour récupérer la liste des évènements d'un agent
export const fetchEventsAgent = async (agentId, setData, setIsLoading) => {
  try {
    const res = await axios.get(`/api/even/agent/${agentId}`);
    setData(res.data);
  } catch (error) {
    console.error(error);
    toast.error('Erreur lors du chargement des évènements.');
  } finally {
    if (setIsLoading) setIsLoading(false);
  }
};