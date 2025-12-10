export const formatters = {
    date: (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    },

    dateTime: (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    },

    time: (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    },

    metric: (value: number | undefined, unit: string): string => {
        if (value === undefined) return 'N/A';
        return `${value.toFixed(1)} ${unit}`;
    },

    bloodPressure: (systolic?: number, diastolic?: number): string => {
        if (!systolic || !diastolic) return 'N/A';
        return `${systolic}/${diastolic} mmHg`;
    },
};