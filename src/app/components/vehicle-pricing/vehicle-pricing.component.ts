import { Component, OnInit } from '@angular/core';
import { CountryService } from '../../services/country.service';
import { CommonModule } from '@angular/common';
import { CityService } from '../../services/city.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';
import { VehiclePriceService } from '../../services/vehicle-price.service';
import {VehiclePrice, getVehiclePrice} from '../../models/vihiclePrice';
import {Country} from '../../models/country';
import {Zone} from '../../models/zone';
import {VehicleType} from '../../models/vihicle-type';
import { ToastrService } from 'ngx-toastr';
import { positiveNumberValidator } from '../../validator/positive_number';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-vehicle-pricing',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,MatPaginatorModule],
  templateUrl: './vehicle-pricing.component.html',
  styleUrl: './vehicle-pricing.component.css'
})
export class VehiclePricingComponent implements OnInit{
  vehicleForm: FormGroup;
  countryId!:string;
  cityId!:string;
  vehicleId!:string;
  countries: Country[] = []; 
  cities: Zone[] = []; 
  vehicles: VehicleType[] = []; 
  city: Zone[] = []; 
  allPrice: getVehiclePrice[] = []; 
  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 3;
  priceId!:string
  isEditMode:Boolean=false
  


  constructor(
    private fb: FormBuilder,
    private countryService: CountryService,
    private CityService:CityService,
    private VehicleService:VehicleService,
    private VehiclePriceService:VehiclePriceService,
    private ToastrService:ToastrService) {
      this.vehicleForm = this.fb.group({
      selectedCountryId: [null, Validators.required],
      selectedCityId: [null, Validators.required],
      selectedVehicleId: [null, Validators.required],
      Driver_Profit: [null, [Validators.required,positiveNumberValidator()]],
      min_fare: [null, [Validators.required,positiveNumberValidator()]],
      Distance_for_base_price: [null, [Validators.required,positiveNumberValidator()]],
      Base_price: [null,[Validators.required,positiveNumberValidator()]],
      Price_per_Unit_Distance: [null,[Validators.required,positiveNumberValidator()]],
      Price_per_Unit_time: [null,[Validators.required,positiveNumberValidator()]],
      Max_space: [null,[Validators.required,positiveNumberValidator()]]
      });
     }
  
  ngOnInit(): void {
    this.fetchCountries(); 
    this.fetchCities();
    this.getPrice()
    
  }

  fetchCountries(): void {
    this.countryService.fatchCountry().subscribe((countries:Country[]) => {
      this.countries = countries; 
     
    });
  }

  fetchCities(): void {
    this.CityService.getAllZone().subscribe((cities:Zone[]) => {
      this.cities = cities; 
      this.fetchVehicles()
      
    });
  }
  fetchVehicles(): void {
    this.VehicleService.getAllVehicles().subscribe((vehicles:VehicleType[]) => {
      this.vehicles = vehicles; 
    }); 
  }

  onChangeCountry(event: any): void {
    const selectedCountryId = event.target.value;
    console.log(selectedCountryId);
    this.countryId=selectedCountryId
    this.city = this.cities.filter(city => city.country_id === selectedCountryId);
  }
  onChangeCity(event: any): void {
    const selectedCityId=event.target.value;
    this.cityId=selectedCityId  
    console.log("Selected City ID:", selectedCityId);
  }
  onChangeVehicle(event: any): void {
    const selectedVehicleId=event.target.value;
    this.vehicleId=selectedVehicleId  
    console.log("Selected vehecle ID:", selectedVehicleId);
  } 
  sendDataToServer(): void {
    // console.log("valid:",this.vehicleForm.valid)
    if (this.vehicleForm.valid) {
      const Data = {
        countryId: this.countryId,
        cityId: this.cityId,
        vehicleId: this.vehicleId,
        Driver_Profit: this.vehicleForm.value.Driver_Profit,
        min_fare: this.vehicleForm.value.min_fare,
        Distance_for_base_price: this.vehicleForm.value.Distance_for_base_price,
        Base_price: this.vehicleForm.value.Base_price,
        Price_per_Unit_Distance: this.vehicleForm.value.Price_per_Unit_Distance,
        Price_per_Unit_time: this.vehicleForm.value.Price_per_Unit_time,
        Max_space: this.vehicleForm.value.Max_space
      };

      this.VehiclePriceService.sendData(Data).subscribe((response:VehiclePrice) => {
        this.ToastrService.success("Data saved successfully");
        this.emptyAll();
        this.getPrice()
      }, error => {
        this.ToastrService.error(error.error.message)
        console.error('Error sending data:', error.error.message);
      });
    } else {
      this.ToastrService.error("Error: All fields are required");
      this.vehicleForm?.markAllAsTouched();
    }
  }

  emptyAll(): void {
    this.vehicleForm?.reset();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
      console.log("else part")
      this.getPrice()
    
  }

  getPrice(): void {
    this.VehiclePriceService.getPrice(this.currentPage, this.itemsPerPage).subscribe(
      (data:any) => {
        if (data.success) {
          this.allPrice = data.result;
          this.totalItems = data.totalItems;
        console.log("it is price : ",this.allPrice)
        } else {
          this.ToastrService.error('Error fetching  data:', data.message);
        }
      },
      error => {
        this.ToastrService.error('Error fetching data');
      }
    );
  }

  onEdit(data: any): void {
    this.vehicleForm.patchValue({
      selectedCountryId: data.countryId,
      selectedCityId: data.cityId,
      selectedVehicleId: data.vehicleId,
      Driver_Profit: data.Driver_Profit,
      min_fare: data.min_fare,
      Distance_for_base_price: data.Distance_for_base_price,
      Base_price: data.Base_price,
      Price_per_Unit_Distance: data.Price_per_Unit_Distance,
      Price_per_Unit_time: data.Price_per_Unit_time,
      Max_space: data.Max_space
    });
    this.fetchCities();
    this.city = this.cities.filter(city => city.country_id === data.countryId);
    this.priceId=data._id
    this.isEditMode=true
  }

  // editPrice(price:VehiclePrice){
  //   console.log(price._id)
  // }
  onUpdate() {  
    this.VehiclePriceService.updatePrice(this.vehicleForm.value, this.priceId)
      .subscribe(
        (response) => {
          this.ToastrService.success(response.message)
          console.log(response);
          this.getPrice()
        },
        (error) => {
          console.error(error);
          // Handle error
        }
      );
  }
  onCancel(){
    this.vehicleForm.reset()
    this.isEditMode=false
  }

}
