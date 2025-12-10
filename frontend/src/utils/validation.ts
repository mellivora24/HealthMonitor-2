export const validators = {
    email: (value: string): string | undefined => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return 'Email is required';
        if (!emailRegex.test(value)) return 'Invalid email format';
        return undefined;
    },

    password: (value: string): string | undefined => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return undefined;
    },

    fullName: (value: string): string | undefined => {
        if (!value) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        return undefined;
    },

    phone: (value?: string): string | undefined => {
        if (!value) return undefined;
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(value)) return 'Invalid phone number';
        return undefined;
    },

    deviceCode: (value: string): string | undefined => {
        if (!value) return 'Device code is required';
        if (value.trim().length < 3) return 'Device code must be at least 3 characters';
        return undefined;
    },

    number: (value: number | undefined, min?: number, max?: number): string | undefined => {
        if (value === undefined) return undefined;
        if (min !== undefined && value < min) return `Value must be at least ${min}`;
        if (max !== undefined && value > max) return `Value must be at most ${max}`;
        return undefined;
    },
};
