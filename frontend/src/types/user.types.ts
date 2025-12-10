export interface User {
    id: string;
    email: string;
    full_name: string;
    date_of_birth?: string;
    gender?: string;
    phone?: string;
    height?: number;
    weight?: number;
    created_at: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface UpdateProfileRequest {
    full_name?: string;
    date_of_birth?: string;
    gender?: string;
    phone?: string;
    height?: number;
    weight?: number;
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
}
