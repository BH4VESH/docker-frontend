import { VehicleType } from "./vihicle-type";
import { VehiclePrice } from "./vihiclePrice";
import { Zone } from "./zone";
export interface User {
    _id:string
    countryId?: string;
    profilePic: string;
    username: string;
    email: string;
    phone: string;
    stripeCustomerId?: string;
    success: boolean;
    message?:string;
    city:Zone
}
export interface Coordinate {
    lat: number;
    lng: number;
}
export interface getVehiclePrice {
    vehicleData:Zone
    vehicle:VehicleType;
    vehicle_price:VehiclePrice
    success: boolean;
    message?:string;
}
