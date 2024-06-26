interface Coordinates {
    type: string;
    coordinates: number[][];
  }
  
  interface City {
    _id: string;
    country_id: string;
    name: string;
    coordinates: Coordinates;
  }
  
  interface Country {
    _id: string;
    countryName: string;
    currency: string;
    country_code: string;
    country_calling_code: string;
  }
  
  interface Service {
    _id: string;
    name: string;
    icon: string;
  }
  
  interface User {
    _id: string;
    countryId: string;
    profilePic: string;
    username: string;
    email: string;
  }
  
  // Define the main interface
  export interface rideDetails {
      _id: string;
    bookingOption: string;
    city: City;
    cityId: string;
    country: Country;
    countryId: string;
    createdAt: string;
    date: string;
    estimeteFare: number;
    fromLocation: string;
    nearest: boolean;
    paymentOption: string;
    ridestatus: number;
    scheduledDate: string;
    scheduledTimeSeconds: number;
    service: Service;
    stopValue: string[];
    toLocation: string;
    totalDistanceKm: number;
    totalDurationMin: number;
    updatedAt: string;
    user: User;
    userId: string;
    vehicleId: string;
    driverId:string;
    feedback:{
        // type:{
            rating:Number,
            feedback:String

        // }
    } | null
  }
export interface feedback {
    feedback: string,
    rating: string
}