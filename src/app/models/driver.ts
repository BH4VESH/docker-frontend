import { Zone } from "./zone";

export interface Driver {
    _id: string;
    countryId: string;
    cityId: string;
    serviceID: string;
    profilePic: string;
    username: string;
    email: string;
    phone: string;
    status: boolean;
    success: boolean;
    message: string;
    Driver: any;
    countryCode : string;
    cityName: string;
}
export interface UserSearchResponse {
    Drivers: Driver[];
    totalCount: number;
    success: boolean;
    message?: string;
}
export interface FatchDriver {
    Drivers: Driver[];
    totalItems: number;
    message?:string;
    success: boolean;
}
export interface DriverServiceType {
    Drivers: Driver[];
    status:boolean;
    service: {
        serviceID: string;
      };
    message?:string;
    success: boolean;
}
export interface fetchCity{
   _id:string;
    name:string;
    cities:Zone[];
    message:string;
    success:boolean;

}
