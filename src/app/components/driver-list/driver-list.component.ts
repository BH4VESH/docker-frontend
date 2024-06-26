
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CountryService } from '../../services/country.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, SortDirection } from '@angular/material/sort';
import { DriverListService } from '../../services/driver-list.service';
import { notSymbol, onlyChar } from '../../validator/username_validation';
import { AuthService } from '../../services/auth.service';
import { CityService } from '../../services/city.service';
import { VehicleService } from '../../services/vehicle.service';
import { Driver, DriverServiceType, FatchDriver, UserSearchResponse } from '../../models/driver';
import { VehicleType } from '../../models/vihicle-type';
import { Zone } from '../../models/zone';
import { Country } from '../../models/country';
import { SocketService } from '../../services/socket.service';
import { ThisReceiver } from '@angular/compiler';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatPaginatorModule, MatSortModule],
  templateUrl: './driver-list.component.html',
  styleUrl: './driver-list.component.css'
})
export class DriverListComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  userProfileForm: FormGroup;
  profilePic: File | null = null;
  countries: Country[] = [];
  allUsers: Driver[] = [];
  btn_name: string = "submit"
  currentDriverId!: string;

  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 4;

  search_query: string = '';
  cities: Zone[] = [];
  vehicles: VehicleType[] = [];
  selectVehicleId: string = '';
  selectVehicleName: string = '';

  constructor(
    private fb: FormBuilder,
    private DriverListService: DriverListService,
    private countryService: CountryService,
    private toastrService: ToastrService,
    private VehicleService: VehicleService,
    private SocketService:SocketService
  ) {
    this.userProfileForm = this.fb.group({
      profilePic: ['', Validators.required],
      username: ['', [Validators.required, notSymbol(), onlyChar()]],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['', Validators.required],
      phone: ['', Validators.required],
      city: ['', Validators.required],
      selectedCode: ['']
    });
  }

  ngOnInit(): void {
    // this._AuthService.sessionOut();
    this.fetchCountries();
    // this.fetchCities()
    this.fetchDriverData();
    this.fetchVehicle();
    this.getDriverStatus()
    this.getDriverService()

  }
  btn_name_chenge() {
    this.btn_name = "submit";
  }
  handleFileInput(event: any) {
    this.profilePic = event.target.files[0];
  }
  fetchCountries(): void {
    this.countryService.fatchCountry().subscribe(countries => {
      this.countries = countries;
    });
  }
  // fetchCities(): void {
  //   this.CityService.getAllZone().subscribe(cities => {
  //     this.cities = cities;
  //     console.log("it is city:", this.cities)
  //   });
  // }
  fetchCity(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedCountryId = target.value;
    if (target.value != "") {
      this.DriverListService.fatchCity(selectedCountryId).subscribe(
        (response)=>{
          this.cities=response.cities
          console.log(response.cities)
        }
      )
      console.log('Selected Country:', selectedCountryId);
    }else{
      this.cities=[]
    }
    // const selectedCountry = this.countries.find(country => country._id === selectedCountryId);
    // if (selectedCountry) {
      // Fetch the cities based on the selected country
      // ...
    // }
  }
  fetchVehicle(): void {
    this.VehicleService.getAllVehicles().subscribe(vehicles => {
      this.vehicles = vehicles
      console.log(vehicles)
    })
  }

  submitDriverProfile() {
    const { username, email, phone, countryCode, city } = this.userProfileForm.value;
    this.DriverListService.addDriver(countryCode, city, username, email, phone, this.profilePic as File).subscribe(
      (response:Driver) => {
        if (response.success) {
          this.toastrService.success(response.message);
          if (this.allUsers.length < this.itemsPerPage) {
            this.allUsers.push(response.Driver)
          }
          this.totalItems++;
          this.resetForm();
        } else {
          this.toastrService.error(response.message);
        }
      },
      (error) => {
        this.toastrService.error("server error");
      }
    );
  }

  resetForm() {
    // const startIndex = this.paginator.pageIndex * this.itemsPerPage + 1;
    // const endIndex = Math.min((this.paginator.pageIndex + 1) * this.itemsPerPage, this.totalItems);
    // console.log(`Range: ${startIndex} - ${endIndex}`);
    this.userProfileForm.reset();
    this.profilePic = null;
    this.fileInput.nativeElement.value = '';
    this.cities=[]
  }

  fetchDriverData(): void {
    this.DriverListService.getDriver(this.currentPage, this.itemsPerPage).subscribe(
      (response: FatchDriver) => {
        if (response.success) {
          this.allUsers = response.Drivers;
          this.totalItems = response.totalItems;
          console.log(response)
        } else {
          this.toastrService.error('Error fetching user data:', response.message);
        }
      },
      error => {
        this.toastrService.error('Error fetching driver data');
      }
    );
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    console.log(this.currentPage)
    if (this.sort.direction && this.sort.active) {
      this.getShortData(this.sort.active, this.sort.direction);
    } else if (this.search_query) {
      this.search();
    } else {
      this.paginator.pageIndex = this.currentPage - 1;
      console.log(this.paginator.length)
      console.log(this.paginator.lastPage)
      this.fetchDriverData();
    }
  }
  getUserPic(iconName: string): string {
    return `${environment.apiUrl}/uploads/driver_list_profile/${iconName}`;
  }

  getCurrentId(driver: any) {
    this.currentDriverId = driver._id;
  }
  editDriver(driver: any) {
    console.log("user is ", driver)
    this.btn_name = "Update";
    this.userProfileForm.patchValue({
      city: driver.cityId,
      countryCode: driver.countryId,
      username: driver.username,
      email: driver.email,
      phone: driver.phone
    });
    //fetch city automatic when edit click
    this.countries = this.countries.filter(c => c._id === driver.countryId);
    this.DriverListService.fatchCity(driver.countryId).subscribe(
      (response)=>{
        this.cities=response.cities
        console.log(response.cities)
      }
    )
  }

  updateDriver() {
    const DriverId = this.currentDriverId;
    const { username, email, phone, city, countryCode } = this.userProfileForm.value;
    const profilePic = this.profilePic as File;

    this.DriverListService.editDriver(DriverId, username, email, countryCode,
      city, phone, profilePic).subscribe(
        (response:Driver) => {
          if (response.success) {
            this.toastrService.success(response.message);
            console.log(response)

            let matchIndex = -1;//find and replace
            for (let i = 0; i < this.allUsers.length; i++) {
              const vehicle = this.allUsers[i];
              if (vehicle._id === this.currentDriverId) {
                matchIndex = i;
                break;
              }
            }
            this.allUsers[matchIndex] = response.Driver
            this.resetForm();
          } else {
            this.toastrService.error(response.message);
          }
        },
        (error) => {
          console.error('Error editing user:', error);
          this.toastrService.error('Error editing driver');
        }
      );
  }

  deleteDriver(driverId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.DriverListService.deleteDriver(driverId).subscribe(
        (response) => {
          if (response.success) {
            const index = this.allUsers.findIndex(user => user._id === driverId);
            this.totalItems--;
            if (index !== -1) {
              this.allUsers.splice(index, 1);
            }
            if (this.allUsers.length === 0) {
              this.currentPage--
              this.fetchDriverData()
            }
            this.toastrService.success(response.message)
          } else {
            this.toastrService.error(response.message)
          }
        },
        error => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }
  // ///////////////////////////////////////sort
  sortData(column: string): void {
    let sortOrder: SortDirection = 'asc';

    if (column === this.sort.active && this.sort.direction === 'asc') {
      sortOrder = 'desc';
    }
    this.sort.direction = sortOrder;
    this.getShortData(column, sortOrder);
  }

  getShortData(sortColumn: string = 'username', sortOrder: string = 'asc'): void {
    console.log(sortColumn)
    console.log(sortOrder)
    this.DriverListService.getSortDriver(this.currentPage, this.itemsPerPage, sortColumn, sortOrder).subscribe(
      (response: FatchDriver) => {
        if (response.success) {
          this.allUsers = response.Drivers;
          this.totalItems = response.totalItems;
        } else {
          this.toastrService.error('1Error fetching user data:', response.message);
        }
      },
      error => {
        this.toastrService.error('Error fetching user data:', error);
      }
    );
  }

  search(): void {
    this.DriverListService.searchDriver(this.search_query, this.currentPage, this.itemsPerPage).subscribe(
      (response:UserSearchResponse) => {
        if (response.success) {
          this.allUsers = response.Drivers;
          this.totalItems = response.totalCount;
        } else {
          this.toastrService.error('Error searching users:', response.message);
        }
      },
      error => {
        this.toastrService.error('Error searching users:', error);
      }
    );
  }
  
  onVehicleSelectionChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.selectVehicleId = target.value;
      console.log(this.selectVehicleId)
    }
  }

  // --------------service update using socket

  saveService() {
    const serviceId = this.selectVehicleId;
    this.DriverListService.addService(this.currentDriverId, serviceId).subscribe((driver:DriverServiceType) => {
      if (driver.success) {
        this.toastrService.success(driver.message)
        for (let index = 0; index < this.allUsers.length; index++) {
          const id = this.allUsers[index]._id;
          // this.selectVehicleId=this.allUsers[index].serviceID
          console.log("service id ", this.allUsers[index].serviceID)
          if (this.currentDriverId == id) {
            this.allUsers[index].serviceID = driver.service.serviceID
            break;
          }
        }

      }
    });
// --------------------socket
    // this.SocketService.updatedriverService(this.currentDriverId,serviceId)
    // over---------------------
  }
  getDriverService(){
    
    this.SocketService.onUpdateServiceData().subscribe({
      next: (response) => {
        
        this.fetchDriverData();
        this.toastrService.success(response.message);
      },
    error: (error: any) => {
        console.log(error);
        this.toastrService.error(error.error.message)
      }
  })
  }


  isSelected(vehicleId: string): boolean {
    return vehicleId === this.selectVehicleId;
    // return vehicleId === 'non';
  }
  preSelectedchek(selectDriver: any) {
    if (!selectDriver.serviceID) {
      this.selectVehicleId ='none'
    }
    else{
      this.selectVehicleId = selectDriver.serviceID
    }
  }

  // --------------status update using socket

  approveDecline(driver:any) {
    const status = !driver.status;
    console.log(status,driver._id)
    this.DriverListService.addStatus(this.currentDriverId).subscribe(
      (response:DriverServiceType) => {
        console.log(response)
        this.toastrService.success(response.message);
        for(let i=0;i<=this.allUsers.length;i++){
          if (this.allUsers[i]._id===this.currentDriverId) {
            this.allUsers[i].status=response.status;
            break
          }
        }
        console.log(this.allUsers)
    // this.SocketService.updatedriverStatus(this.currentDriverId,status)
      },
      (error) => {
        console.error(error);
        this.toastrService.error('An error occurred');
      }
    );
  }
  getDriverStatus(){
    
    this.SocketService.onUpdateStatusData().subscribe({
      next: (response) => {
        
        this.fetchDriverData();
        this.toastrService.success(response.message,  'Success');
      },
    error: (error: any) => {
        console.log(error);
        this.toastrService.error(error.error.message)
      }
  })
  }


  // add bank acc

  accountHolderName: string='testAccount'
  routingNumber: string='110000000'
  accountNumber: string='000123456789'
 driver_id!:string;

  addBankAccount() {

    const bankAccountData = {
      accountHolderName: this.accountHolderName,
      routingNumber: this.routingNumber,
      accountNumber: this.accountNumber
    };

    this.DriverListService.addBankAccount(this.currentDriverId, bankAccountData).subscribe(
      (response) => {
        console.log(response);
        this.toastrService.success(response.message)
        // Handle success, e.g., show success message
      },
      (error) => {
        console.error(error);
        console.log(error)
      }
    );
  }


}
