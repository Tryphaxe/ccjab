import { format } from 'date-fns';

function formatEventDateTime(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, 'dd/MM/yyyy HH:mm')} - ${format(endDate, 'dd/MM/yyyy HH:mm')}`;
}

export default formatEventDateTime;