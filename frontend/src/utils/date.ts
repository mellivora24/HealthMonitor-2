export const getToday = (): Date => {
    return new Date();
};

export const getStartOfDay = (date: Date = new Date()): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

export const getEndOfDay = (date: Date = new Date()): Date => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

export const getDaysAgo = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

export const formatISO = (date: Date): string => {
    return date.toISOString();
};
