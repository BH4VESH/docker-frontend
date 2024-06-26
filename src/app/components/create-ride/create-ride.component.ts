import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Country } from '../../models/country';
import { CountryService } from '../../services/country.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateRideService } from '../../services/create-ride.service';
import { Coordinate, User, getVehiclePrice } from '../../models/createRide';
import { SettingService } from '../../services/setting.service';
import { CityService } from '../../services/city.service';
import { CardService } from '../../services/card.service';
import { Router } from '@angular/router';

declare const google: any;

@Component({
  selector: 'app-create-ride',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-ride.component.html',
  styleUrl: './create-ride.component.css'
})
export class CreateRideComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLElement>;
  // userPhoneInput: FormGroup;
  countries: Country[] = [];
  users: User[] = [];
  Username: string = '';
  Email: string = '';
  Phone: string = '';
  showUserSection: boolean = false;
  next: boolean = true;
  fromTo: boolean = false
  stopInputs: string[] = [];
  selectedStopCount!: number
  countryCallingCode!: string
  selected_country_code!: string
  // for the map
  autocompleteService: google.maps.places.AutocompleteService;
  map!: google.maps.Map;
  fromMarker: google.maps.Marker | null = null;;
  toMarker: google.maps.Marker | null = null;;
  stopsMarkers: google.maps.Marker[] = [];
  directionsRenderer: google.maps.DirectionsRenderer | null = null
  directionsService!: google.maps.DirectionsService;

  distance!: Number
  duration!: any
  coordinates: any[] = []
  ifInsideZone!: boolean ;
  zoneCityId: string | undefined  //fatch in isPointInsidePolygon()
  allPriceData: getVehiclePrice[] = []
  ifCardAdded: boolean = false
  // calculateDisabled:boolean=true

  constructor(
    private fb: FormBuilder,
    private countryService: CountryService,
    private toastrService: ToastrService,
    private CreateRideService: CreateRideService,
    private SettingService: SettingService,
    private router: Router
  ) {
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.directionsService = new google.maps.DirectionsService();
  }

  userPhoneInput = this.fb.group({
    countryCode: ['', Validators.required],
    phone: ['', Validators.required],
  });

  fromToInput = this.fb.group({
    from: ['', Validators.required],
    to: ['', Validators.required],
  });

  ngOnInit(): void {
    this.fetchCountries();
    this.fetchStop();
    this.initMap();
  }

  ngAfterViewInit(): void {
    // pre selected vehicle servece 
    // const selectedOption = (document.getElementById('inputGroupid') as HTMLSelectElement).value;
    // this.onChangeService({ target: { value: selectedOption } })
    // this.convertPolygoneObject()
  }

  fetchCountries(): void {
    this.countryService.fatchCountry().subscribe(countries => {
      this.countries = countries;
      console.log("country code", countries[0].short_name)
    });
  }
  callingCode(event: Event) {
    const target = event.target as HTMLSelectElement;
    const [id, shortName] = target.value.split('-');
    this.countryCallingCode = id;
    this.selected_country_code = shortName
    console.log("countryCallingCode", this.countryCallingCode)

  }
  searchUsers(): void {
    const { phone } = this.userPhoneInput.value;
    console.log(this.countryCallingCode, phone)
    if (this.countryCallingCode && phone) {
      this.CreateRideService.searchUsers(this.countryCallingCode, phone)
        .subscribe(
          (response: any) => {
            if (response.success) {
              this.users = response.users;
              this.toastrService.success(response.message)
              this.setUserValue()
              this.showUserSection = true
              console.log("it is search user :",this.users)
              // console.log("it is serch responce :",response)
              console.log("it is serch card :", response.cards)
              // check if card added for the payment
              this.ifCardAddedFn(response.cards)
            } else {
              this.toastrService.error(response.message)
              this.showUserSection = false
              this.Username = '';
              this.Email = '';
              this.Phone = '';
            }
          },
          error => {
            this.toastrService.error("An error occurred while fetching users.")
          }
        );
    } else {
      this.toastrService.error("Please provide both countryId and phone number.")
    }
  }
  setUserValue() {
    this.Username = this.users[0].username;
    this.Email = this.users[0].email;
    this.Phone = this.users[0].phone;
  }
  nextBtn() {
    // this.convertPolygoneObject();
    this.initAutocomplete(this.placeMarker.bind(this));
    this.next = false;
    this.fromTo = true
  }
  // fetch stops in the setting service
  fetchStop() {
    this.SettingService.getSetting().subscribe(
      (Response) => {
        this.selectedStopCount = Response[0].selectedStopCount
        console.log("total stops", this.selectedStopCount)
      }
    )
  }
  addStopInput() {
    if (this.stopInputs.length < this.selectedStopCount) {
      this.stopInputs.push('');
      setTimeout(() => {
        this.initAutocomplete(this.placeMarker.bind(this))
      });
    }
  }
  removeStopInput(index: number): void {
    if (index >= 0 && index < this.stopInputs.length) {
      this.stopInputs.splice(index, 1);

      if (this.stopsMarkers[index]) {
        this.stopsMarkers[index].setMap(null);
        this.stopsMarkers.splice(index, 1);
      }
      if (this.fromToInput.get('from')?.value && this.fromToInput.get('to')?.value) {
        this.drawPath();
        this.calculate()
      }
    }
  }

  trackByFn(index: number, item: any): number {
    return index;
  }

  // for the map
  initMap(): void {
    // navigator.geolocation.getCurrentPosition((location) => {
    //   let coordinates = location.coords;
      // const myplace = { lat: coordinates.latitude, lng: coordinates.longitude };
    //   this.map = new google.maps.Map(
    //     this.mapContainer.nativeElement,
    //     {
    //       zoom: 10,
    //       center: myplace,
    //     }
    //   );
    // });
    const mapOptions: google.maps.MapOptions = {
      center: { lat: 22.2598107, lng: 70.7287299 },
      zoom: 10
    };
    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
  }

  // autoComplete for every field
  initAutocomplete(placeMarker: (place: google.maps.places.PlaceResult, type: 'from' | 'to' | 'stop') => void) {
    const fromInput: HTMLInputElement = document.getElementById('from-input') as HTMLInputElement;
    const toInput: HTMLInputElement = document.getElementById('to-input') as HTMLInputElement;
    const options: google.maps.places.AutocompleteOptions = {
      componentRestrictions: { country: this.selected_country_code }
    };

    const fromAutocomplete = new google.maps.places.Autocomplete(fromInput, options);
    const toAutocomplete = new google.maps.places.Autocomplete(toInput, options);

    fromAutocomplete.addListener('place_changed', () => {
      const place = fromAutocomplete.getPlace();
      var searchPoint = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      // this.ifInsideZone = true
      
      // checkpoint inside polygon
      this.CreateRideService.checkPoint(this.users[0].countryId,searchPoint).subscribe((res)=>{
        console.log(res)
        alert(res.message)
        // console.log("countryId :",this.users[0].countryId)
        this.ifInsideZone = res.inside;
        // this.isPointInsidePolygon(place, placeMarker, 'from');
        if ( res.inside) {
            placeMarker(place, 'from');
            // this.zoneCityId = this.users[0].city._id
            this.zoneCityId = res.result[0]._id
            console.log("zzzzzzzzzzzzzzzzzzzzzzzz",this.zoneCityId)
            this.getVehiclePrice()
        } else {
          this.fromToInput.patchValue({
            from: ""
          })
          if (this.fromMarker) {
            this.fromMarker.setMap(null);
            this.directionsRenderer?.setMap(null);
            this.directionsRenderer = null;
          }
        }

       
      })

    });

    toAutocomplete.addListener('place_changed', () => {
      const place = toAutocomplete.getPlace();
      console.log("to palce:", place)
      placeMarker(place, 'to');
    });

    this.stopInputs.forEach((_, index) => {
      const stopInput: HTMLInputElement = document.getElementById(`stop-input-${index}`) as HTMLInputElement;
      const autocomplete = new google.maps.places.Autocomplete(stopInput, options);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        placeMarker(place, 'stop');
        this.drawPath();
      });
    });
  }

  //check from marker position
  // convertPolygoneObject() {
  //   this.coordinates = []
  //   this.users.forEach(user => {
  //     const polygon = user.city.coordinates.map(coord => new google.maps.LatLng(coord.lat, coord.lng));
  //     const googlePolygon = new google.maps.Polygon({ paths: polygon });
  //     this.coordinates.push(googlePolygon)
  //   }
  //   );
  //   console.log("coordinates", this.coordinates)
  // }

  // isPointInsidePolygon(place: google.maps.places.PlaceResult, placeMarker: (place: google.maps.places.PlaceResult, type: 'from' | 'to' | 'stop') => void, type: 'from' | 'to' | 'stop') {
  //   // let inside = false;
  //   // for (var i = 0; i < this.coordinates.length; i++) {

  //     if (this.ifInsideZone) {
  //       // this.ifInsideZone = true;

  //       // ------------fatch zoneCityId in the users array---------------------
  //       this.zoneCityId = this.users[0].city._id
  //       this.getVehiclePrice()//get price from the database
  //       // console.log("city data in user[]",i)
  //       console.log("city id is:", this.users[0].city._id)
  //       // break;
  //     }
      
  //   // }
  //   if (this.ifInsideZone) {
  //     this.toastrService.success('Point is inside polygon');
  //     setTimeout(() => {
  //       placeMarker(place, type);
  //     }, 0);
  //   } else {
  //     alert('Point is not inside any polygon');
  //     this.ifInsideZone = false
  //     this.fromToInput.patchValue({
  //       from: ""
  //     })
  //     if (this.fromMarker) {
  //       this.fromMarker.setMap(null);
  //       this.directionsRenderer?.setMap(null);
  //       this.directionsRenderer = null;
  //     }
  //   }
  // }

  // palce marker 
  placeMarker(place: google.maps.places.PlaceResult, type: 'from' | 'to' | 'stop'): void {
    if (!place || !place.geometry || !place.geometry.location) {
      this.toastrService.error('Please select a valid location.');
      return;
    }

    let iconUrl;
    if (type === 'from') {
      iconUrl = 'https://maps.google.com/mapfiles/kml/paddle/blu-circle.png';
      // this.from = place.name || '';
      if (this.fromMarker) {
        this.fromMarker.setMap(null);
      }
    } else if (type === 'to') {
      iconUrl = 'https://maps.google.com/mapfiles/kml/paddle/grn-circle.png';
      // this.to = place.name || '';
      if (this.toMarker) {
        this.toMarker.setMap(null);
      }
    } else {
      iconUrl = 'https://maps.google.com/mapfiles/kml/paddle/wht-circle.png';
    }

    const marker = new google.maps.Marker({
      position: place.geometry.location,
      map: this.map,
      title: place.name || '',
      icon: {
        url: iconUrl,
        scaledSize: new google.maps.Size(50, 50)
      }
    });

    if (type === 'from') {
      this.fromMarker = marker;
    } else if (type === 'to') {
      this.toMarker = marker;
    } else {
      this.stopsMarkers.push(marker)
      console.log("thise is stopMarkers:", this.stopsMarkers)
    }

    // if (this.fromToInput.get('from')?.value && this.fromToInput.get('to')?.value) {
    //   this.drawPath();
    // }
    this.map.setCenter(place.geometry.location);
    // console.log(place.geometry.location.lat())
    // console.log(place.geometry.location.lng())
  }

  calculate() {
    var fromValue = (document.getElementById('from-input') as HTMLInputElement).value
    var toValue = (document.getElementById('to-input') as HTMLInputElement).value
console.log(this.ifInsideZone)
    if (this.ifInsideZone) {
      if (!fromValue && !toValue) {
        this.toastrService.error('Please select "from" and "to" location.');
        this.priceData=[]
        this.distance=0
        this.duration=0
      } else if (!fromValue) {
        if (this.fromMarker) {
          this.fromMarker.setMap(null);
          this.fromMarker = null;
          this.directionsRenderer?.setMap(null);
          this.directionsRenderer = null;
        }
        this.toastrService.error('Please select "From" location.');
        this.priceData=[]
        this.distance=0
        this.duration=0
      }
      else if (!toValue) {
        if (this.toMarker) {
          this.toMarker.setMap(null);
          this.toMarker = null;
          this.directionsRenderer?.setMap(null);
          this.directionsRenderer = null;
        }
        this.toastrService.error('Please select "To" location.');
        this.priceData=[]
        this.distance=0
        this.duration=0
      }
       else if ((fromValue === toValue || this.fromMarker==this.toMarker) && this.stopsMarkers.length==0) {
        console.log(fromValue, toValue,this.stopsMarkers.length)
        this.toastrService.error('Invalid: Same input location for "From" and "To",plz add stop.' );
        this.priceData=[]
        this.distance=0
        this.duration=0
        // this.fromMarker=null
        // this.toMarker=null
      } 
      else {
        // check price not awilable in selected city
        if (this.allPriceData.length == 0) {
          this.toastrService.warning(" Not awailable any price,plz enter price from vehicle pricing section")
          this.priceData = []
          this.distance=0
          this.duration=0
          // this.fromMarker=null
        } else {
          // this.calculateDistance();
          // this.calculateRoute();
          this.drawPath()
        }
      }
    } else {
      this.toastrService.error("from location must be inside the polygone")
      this.distance = 0
      this.duration = 0
      this.zoneCityId = ""
      this.priceData=[]
      // this.fromToInput.reset()
      // this.resetMarkersAndData()
    }
  }


//  drow path & calculate
  drawPath(): void {
    const waypoints = this.stopsMarkers.map(marker => ({
      location: marker.getPosition()!,
      stopover: true
    }));

    console.log(this.fromMarker?.getPosition())
    console.log(this.toMarker?.getPosition())

    const request = {
      origin: this.fromMarker?.getPosition()!,
      destination: this.toMarker?.getPosition()!,
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING
    };

    this.directionsService.route(request, (response, status: google.maps.DirectionsStatus) => {
      if (status === google.maps.DirectionsStatus.OK) {
        if (this.directionsRenderer) {
          this.directionsRenderer.setMap(null);
        }
        this.directionsRenderer = new google.maps.DirectionsRenderer({
          map: this.map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#FF0000',
            strokeOpacity: 2.0,
            strokeWeight: 4
          }
        });

        if (status === 'OK' && response) {
          this.directionsRenderer!.setDirections(response);
          const route = response.routes[0];
          let totalDistance = 0;
          let totalDuration = 0;
    
          for (let i = 0; i < route.legs.length; i++) {
            totalDistance += route.legs[i].distance!.value; // distance in meters
            totalDuration += route.legs[i].duration!.value; // duration in seconds
          }
    
          const distanceInKm = totalDistance / 1000;
          this.distance = distanceInKm//km
          const totalHours = Math.floor(totalDuration / 3600);
          const remainingSeconds = totalDuration % 3600;
          const totalMinutes = Math.floor(remainingSeconds / 60);
          this.duration = `${totalHours}, hours, ${totalMinutes}, minutes`
    
          this.priceCalculation(distanceInKm, totalDuration)//estimete fare
    
          console.log('Total Distance:',  Math.round(totalDistance / 1000), 'km');
          console.log('Total Duration:', Math.round(totalDuration / 60), 'minutes');
        } else {
          console.error('Directions request failed due to ' + status);
        }
        
      } else {
        console.error('Error calculating distance:', status);
      }
    });
  }
  
  // get vihicle price from selected city in the data
  getVehiclePrice(): void {
    if (!this.zoneCityId) {
      console.error('Zone city ID is undefined');
      return;
    }
    this.CreateRideService.getVehiclePrice(this.zoneCityId).subscribe((response: any) => {
      if (response.success) {
        this.allPriceData = response.vehicleData
        console.log("vehicle price data: ",this.allPriceData)
        // this.priceCalculation()
      }
    });
  }

  priceData: any[] = []

  priceCalculation(distanceInKm: number, totalDuration: number) {
    var BasePrice: number = 0
    var DistancePrice: number = 0
    var TimePrice: number = 0
    var ServiceFees: number = 0
    this.priceData = []
    var vehicleId: string = ""
    var durationMin = Number(Math.round((totalDuration % 3600) / 60))//minut

    for (let x = 0; x < this.allPriceData.length; x++) {

      vehicleId = this.allPriceData[x].vehicle._id

      BasePrice = this.allPriceData[x].vehicle_price.Base_price;

      DistancePrice = ((distanceInKm) - (this.allPriceData[x].vehicle_price.Distance_for_base_price)) * (this.allPriceData[x].vehicle_price.Price_per_Unit_Distance);

      TimePrice = (durationMin) * (this.allPriceData[x].vehicle_price.Price_per_Unit_time);

      ServiceFees = (BasePrice) + (DistancePrice) + (TimePrice)
      if (ServiceFees < this.allPriceData[x].vehicle_price.min_fare) {
        ServiceFees = this.allPriceData[x].vehicle_price.min_fare;
      }

      this.priceData.push({
        vehicleId: vehicleId,
        vehicleName: this.allPriceData[x].vehicle.name,
        ServiceFees: ServiceFees
      })
      // console.log("it is all price :",this.allPriceData)
      console.log("it is pricing data :", this.priceData)
    }
  }

  selectedServiceId: string = ''
  selectedestimeteFare!: number
  // select service
  onChangeService(event: any) {
    // const vehicleId = event.target.value
    const selectedPrice=event.target.value;
    const [vehicleId,estimeteFare]=selectedPrice.split('-');
    this.selectedServiceId = vehicleId
    this.selectedestimeteFare=estimeteFare
    console.log("selectedServiceId :", this.selectedServiceId)
    console.log("estimateFare :", this.selectedestimeteFare)
    

    // when need service id then it call//////////////////

    //  // Trigger the onChangeService 
    //  const selectedOption = (document.getElementById('inputGroupid') as HTMLSelectElement).value;
    //  this.onChangeService({ target: { value: selectedOption } });
  }

  // check if card adeed or not
  ifCardAddedFn(cards: any) {
    if (cards.length !== 0) {
      console.log(cards.length)
      this.ifCardAdded = true
    } else {
      this.ifCardAdded = false
    }
  }

  //selected payment option
  selectedPaymentOption: string = '';
  onPaymentOptionChange() {
    console.log('Selected Payment Option:', this.selectedPaymentOption);
  }
  //selected Booking option
  selectedBookingOption: string = '';
  selectedDate: string = '';
  selectedTime: string = '';
  showDateError: boolean = false;
  showTimeError: boolean = false;

  onBookingOptionChange() {
    console.log('Selected Booking Option:', this.selectedBookingOption);
    if (this.selectedBookingOption === 'BookNow') {
      this.selectedDate = ''
      this.selectedTime = ''
    }
    // console.log('Selected date:', this.selectedDate);
    // console.log('Selected time:', this.selectedTime);
  }
  // for the date picker
  minDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  validateDate() {
    if (this.selectedBookingOption === 'Schedule' && this.selectedDate) {
      // debugger
      const enteredDate = new Date(this.selectedDate);
      const currentDate = new Date();
      // console.log("entre date",enteredDate.toISOString().split('T')[0])
      // console.log("current date",currentDate.toISOString().split('T')[0])
      if (enteredDate.toISOString().split('T')[0] < currentDate.toISOString().split('T')[0]) {
        this.showDateError = true;
      } else {
        this.showDateError = false;
        this.validareTime()
      }
    }
  }

  validareTime() {
    console.log(this.selectedDate)
    console.log(this.selectedTime)
    if (this.selectedBookingOption === 'Schedule' && this.selectedDate) {
      const enteredTime = new Date(`${this.selectedDate}T${this.selectedTime}`);
      const currentTime = new Date();
      // console.log("enter time is: ",enteredTime)
      // console.log("surrent time is: ",currentTime)
      if (enteredTime < currentTime) {
        this.showTimeError = true;
      } else {
        this.showTimeError = false;
      }
    }
    else {
      this.toastrService.error("please select date first")
      this.selectedTime = ""
    }
  }
  
  // confirm ride
  showSelectionError=false 
  showPaymentError=false 
  showBookingError=false 
  showCalulateError=false

  validateInputs() {
    this.showCalulateError = (this.distance === undefined)||(this.distance==0);
    this.showSelectionError = this.selectedServiceId === '';
    this.showPaymentError = this.selectedPaymentOption === '';
    this.showBookingError = this.selectedBookingOption === '';
  }

  ConfirmRide() {
    this.validateInputs();

    // date validation
      if (this.selectedBookingOption==='Schedule' && (this.selectedDate=='') && (this.selectedTime=='')) {
        this.toastrService.error("select schedule date and time")
        return
      }
      if (this.selectedBookingOption==='Schedule' && this.selectedTime=='') {
        this.toastrService.error("select schedule time")
        return
      }
      
    if (!this.showCalulateError && !this.showSelectionError && !this.showPaymentError && !this.showBookingError && !this.showDateError && !this.showTimeError) {


      var fromValue = (document.getElementById('from-input') as HTMLInputElement).value
      var toValue = (document.getElementById('to-input') as HTMLInputElement).value
      const stopValue: string[] = [];

      this.stopInputs.forEach((_, index) => {
        const stopInput: HTMLInputElement = document.getElementById(`stop-input-${index}`) as HTMLInputElement;
        stopValue.push(stopInput.value)
      });

      // duration and distence comvet=>km/m
      const durationParts = this.duration.split(', ');
      const hours = parseInt(durationParts[0], 10);
      const minutes = parseInt(durationParts[2], 10);
      const durationInMinutes = hours * 60 + minutes;

      // shedule date and time
      let scheduledDate;
      let scheduledTime;
      if (this.selectedDate && this.selectedTime) {
        scheduledDate = new Date(this.selectedDate);
        const [hoursStr, minutesStr] = this.selectedTime.split(':');
        const h = parseInt(hoursStr, 10);
        const m = parseInt(minutesStr, 10);
        scheduledTime = h * 3600 + m * 60;
      } else {
        scheduledDate = new Date();
      }
      const allRideData = {
        userId: this.users[0]._id,
        countryId: this.countryCallingCode,
        cityId: this.zoneCityId,
        vehicleId: this.selectedServiceId,
        totalDistanceKm: this.distance,//km
        totalDurationMin: durationInMinutes,//minuts
        fromLocation: fromValue,
        toLocation: toValue,
        stopValue,
        estimeteFare: this.selectedestimeteFare,
        paymentOption: this.selectedPaymentOption,
        bookingOption: this.selectedBookingOption,
        scheduledDate: scheduledDate,
        scheduledTimeSeconds: scheduledTime,
      }
      console.log(this.showPaymentError)
      this.CreateRideService.saveRide(allRideData).subscribe((responce) => {
        if (responce.success) {
          console.log("saved data : ", responce.ride)
          this.toastrService.success(responce.message)
          this.resetMarkersAndData()
          this.fromToInput.reset()
          this.stopInputs = []
          this.distance = 0
          this.duration = 0
          this.priceData = []
          this.selectedServiceId= ''
          this.selectedPaymentOption = ''
          this.selectedBookingOption = ''
          this.selectedDate=''
          this.selectedTime=''
          this.router.navigate(['/admin/confirmed_rides']);
        }
      })
    } else {
      this.toastrService.error("Please fill all error fields")
    }
  }

  resetMarkersAndData() {
    if (this.fromMarker) {
      this.fromMarker.setMap(null);
      this.fromMarker = null;
    }
    if (this.toMarker) {
      this.toMarker.setMap(null);
      this.toMarker = null;
    }
    for (const stopMarker of this.stopsMarkers) {
      stopMarker.setMap(null);
    }
    this.stopsMarkers = [];
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
      this.directionsRenderer = null;
    }
  }


}
