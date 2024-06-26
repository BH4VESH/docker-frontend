export interface User {
    countryId?: string;
    profilePic: string;
    username: string;
    email: string;
    phone: string;
    stripeCustomerId?: string;
    success: boolean;
    message?:string;
    user:string;
    users:string;
    totalItem:string;
}
export interface UserSearchResponse {
    users: User[];
    totalCount: number;
    success: boolean;
    message?: string;
}
export interface FatchUser {
    users: User[];
    totalItems: number;
    message?:string;
    success: boolean;
}
export interface SortResponce {
    users: User[];
    totalItems: number;
    message?:string;
    success: boolean;
}