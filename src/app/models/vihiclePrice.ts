export interface VehiclePrice {
    _id?:string
    countryId: string;
    cityId: string;
    vehicleId: string;
    Driver_Profit: number;
    min_fare: number;
    Distance_for_base_price: number;
    Base_price: number;
    Price_per_Unit_Distance: number;
    Price_per_Unit_time: number;
    Max_space: number;
  }
export interface getVehiclePrice {
  _id?: string
  countryId: string;
  cityId: string;
  vehicleId: string;
  Driver_Profit: number;
  min_fare: number;
  Distance_for_base_price: number;
  Base_price: number;
  Price_per_Unit_Distance: number;
  Price_per_Unit_time: number;
  Max_space: number;
  country: string,
  city: string,
  vehicle: string,
  success: string,
  message: string
}