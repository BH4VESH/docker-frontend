import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CityService } from '../../services/city.service';
import { CommonModule } from '@angular/common';
import { Country } from '../../models/country';
import { CountryService } from '../../services/country.service';
import { Zone } from '../../models/zone'
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { BnNgIdleService } from 'bn-ng-idle';
declare const google: any;


@Component({
  selector: 'app-city',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule],
  templateUrl: './city.component.html',
  styleUrl: './city.component.css'
})
export class CityComponent implements OnInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLElement>;
  map!: google.maps.Map;
  drawingManager!: google.maps.drawing.DrawingManager;
  polygon!: google.maps.Polygon | null;
  currentPolygon: google.maps.Polygon | null = null;
  enteredLocation: string = '';
  searchAutocomplete: google.maps.places.Autocomplete | null = null;
  from!: string | undefined;

  countries: Country[] = [];
  selected_country!: Country[]|any;
  selected_city!: string|undefined|null;
  zones: Zone[] = [];
  selectedCountryReset!:null
  // polygone_coordinet!: google.maps.LatLng[]
  polygone_coordinet!:{ type: string; coordinates: number[][][]; };
  
  geocoder: google.maps.Geocoder;
  isDissUpdatebtn:boolean=true
  isDissSavebtn:boolean=false
  // country_table_data: Country[];

  constructor(
    private countryService: CountryService,
    private CityService: CityService,
    private toastr: ToastrService) {
    // this.autocompleteService = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder();
  }

  ngOnInit(): void {
    this.countryService.fatchCountry().subscribe(
      (fatchData: Country[]) => {
        this.countries = fatchData;
        // console.log(this.countries);
      },
      (error) => {
        console.error('Error fetching country data:', error);
      }
    );
    this.initMap();
    this.getAllZone()
    // this.initAutocomplete();
    
  }

  onCountrySelection(event:any) {
    const searchCity: HTMLInputElement = document.getElementById('searchCity') as HTMLInputElement;
    searchCity.value = '';
    this.selected_country = event.value
    console.log(event.value)
    if (this.searchAutocomplete) {
      this.searchAutocomplete.setComponentRestrictions({ "country": this.selected_country.code });
    }
    console.log('Selected country:', event.value);
    console.log('Selected country code:', this.selected_country.code);
    // this.setCountry(this.selected_country.code);
    this.initAutocomplete();
  }

  // //////////////////////////////////////////////map load /////////////
  initMap(): void {
    const mapOptions: google.maps.MapOptions = {
      center: { lat: 22.2598107, lng: 70.7287299 },
      zoom: 10
    };
    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);

    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON]
      },
      polygonOptions: {
        fillColor: 'green',
        strokeColor: 'green',
        editable: true
      }
    });

    this.drawingManager.setMap(this.map);

    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event: any) => {
      if (this.currentPolygon) {
        this.currentPolygon.setMap(null);
      }
      if (event.type === google.maps.drawing.OverlayType.POLYGON) {
        this.currentPolygon = event.overlay;
        const coordinates: google.maps.LatLng[] = this.currentPolygon!.getPath().getArray();
        // this.polygone_coordinet = coordinates
        const closedLoopCoordinates = [...coordinates.map(latLng => [latLng.lng(), latLng.lat()]), [coordinates[0].lng(), coordinates[0].lat()]];
        this.polygone_coordinet = {
          type: 'Polygon',
          coordinates: [closedLoopCoordinates]
        };
      }
    });
  }
  // ////////////////////////////////auto complete city /////////////////
  initAutocomplete(): void {
    const searchCity: HTMLInputElement = document.getElementById('searchCity') as HTMLInputElement;
    this.isDissSavebtn=false
    this.isDissUpdatebtn=true
    this.initMap()

    const options: google.maps.places.AutocompleteOptions = {
      types: ['(cities)'],
      componentRestrictions: { country: this.selected_country.code }
    };

    this.searchAutocomplete = new google.maps.places.Autocomplete(searchCity, options);

    this.searchAutocomplete?.addListener('place_changed', () => {
      const city = this.searchAutocomplete!.getPlace();
      if (!city.geometry || !city.geometry.location) {
        this.toastr.error('Please select a valid city.');
        return;
      }
      const lat = city.geometry.location.lat();
      const lng = city.geometry.location.lng();

      const mapCenter = { lat, lng };
      this.map.setCenter(mapCenter);
      this.map.setZoom(10);

      this.selected_city = city.name;
    });
  }

  resetAutocomplete(): void {
    // if (this.searchAutocomplete) {
    //   google.maps.event.clearInstanceListeners(this.searchAutocomplete);
    // }
    this.searchAutocomplete?.setComponentRestrictions({"country":""})/////////////
    this.searchAutocomplete = null;
    this.selected_country = null;
    this.selected_city = null;
    const searchCity: HTMLInputElement = document.getElementById('searchCity') as HTMLInputElement;
    searchCity.value = '';
    this.selectedCountryReset = null;
  }
  /////////////////////////////////////////////////////////////////////////
  // saveZone() {
  //   if (!this.selected_city) {
  //     this.toastr.error('Please select sity first.');
  //     // this.resetAutocomplete()
  //     return;
  //   }
  //   if (this.polygone_coordinet == null) {
  //     this.toastr.error('Please draw a polygon first.');
  //     // this.resetAutocomplete()
  //     return;
  //   }

  //   // store in the database
  //   let matchIndex = true;
  //   for (let i = 0; i < this.zones.length; i++) {

  //     if (this.selected_city === this.zones[i].name) {
  //       matchIndex = false;
  //       this.toastr.error("Duplicate city are not allowed")
  //       // this.resetAutocomplete()
  //       break;
  //     } else {
  //       matchIndex = true;
  //     }
  //   }
  //   if (matchIndex === true) {
  //     this.CityService.createZone({ name: this.selected_city, coordinates: this.polygone_coordinet, country_id: this.selected_country._id })
  //       .subscribe(
  //         response => {
  //           this.zones.push(response)
  //           // this.getAllZone()
  //           console.log("thise is save btn zones:", this.zones)
  //           console.log('Zone created successfully:', response);
  //           this.toastr.success("city added successfull")
  //           this.initMap()
  //           this.resetAutocomplete()
  //         },
  //         error => {
  //           console.error('Error creating zone:', error);
  //           this.toastr.error('Failed to create zone. Please try again later.');
  //         }
  //       );
  //     console.log("this is zones data : ", this.zones)
  //   }
  // }
  //////////////////////////////////////////////////////////////////////

  saveZone() {
    if (!this.selected_city) {
      this.toastr.error('Please select a city first.');
      return;
    }
    if (!this.polygone_coordinet) {
      this.toastr.error('Please draw a polygon first.');
      return;
    }

    let matchIndex = true;
    for (let i = 0; i < this.zones.length; i++) {
      if (this.selected_city === this.zones[i].name) {
        matchIndex = false;
        this.toastr.error('Duplicate city are not allowed');
        break;
      } else {
        matchIndex = true;
      }
    }

    if (matchIndex === true) {
      this.CityService.createZone({
        name: this.selected_city,
        coordinates: this.polygone_coordinet,
        country_id: this.selected_country._id
      }).subscribe(
        response => {
          this.zones.push(response);
          console.log('Zone created successfully:', response);
          this.toastr.success('City added successfully');
          this.initMap();
          this.resetAutocomplete();
        },
        error => {
          console.error('Error creating zone:', error);
          this.toastr.error('Failed to create zone. Please try again later.');
        }
      );
    }
  }


  //////////////////////////////////////////////////////////////////////
  getAllZone() {
    this.CityService.getAllZone().subscribe((getAllZone) => {
      this.zones = getAllZone
      // console.log(this.zones[1].name)
      // console.log(this.selected_city)
      console.log("it is getAll zone", getAllZone)
      console.log("thise is get data(db) :", this.zones)
    })
  }
  //////////////////////////////////////////////////////////////////////
  selectedZone: Zone | null = null;

  selectZone(zone: Zone) {
  // selectZone(zone: any) {
    this.isDissSavebtn=true
    this.isDissUpdatebtn=false
    this.selectedZone = zone;
    console.log("it is selected zone(btn)", this.selectedZone)
    console.log(zone.coordinates.coordinates)
    // this.drawPolygon(zone.coordinates);
    this.drawPolygon(zone.coordinates.coordinates);
    // console.log("aaa",zone.coordinates.coordinates)
    this.currentPolygon?.setMap(null)
    this.currentPolygon = null
    console.log(this.currentPolygon)
  }

  clearPolygon() {
    if (this.polygon && typeof this.polygon.setMap === 'function') {
      this.polygon.setMap(null); 
      this.polygon = null; 

    }
  }
  /////////////////////////////////////////////////////////////////////////
  // drawPolygon(coordinates: google.maps.LatLng[]): void {
  // drawPolygon(coordinates: number[][][]): void {
  //   this.clearPolygon()
  //   // Create a new polygon for the selected zone
  //   this.polygon = new google.maps.Polygon({
  //     paths: coordinates,
  //     strokeColor: 'green',
  //     strokeOpacity: 0.8,
  //     strokeWeight: 2,
  //     fillColor: 'green',
  //     fillOpacity: 0.35,
  //     editable: true,
  //     draggable: true,
  //     map: this.map
  //   });
  //   // Add event listener for polygon edit
  //   if (this.polygon !== null) {
  //     google.maps.event.addListener(this.polygon.getPath(), 'set_at', () => {
  //       // When a vertex is moved (dragged) in the polygon
  //       console.log('Polygon edited - new coordinates:');
  //       const coordinates: google.maps.LatLng[] = this.polygon!.getPath().getArray();
  //       // this.polygone_coordinet = coordinates
  //       this.polygone_coordinet = {
  //         type: 'Polygon',
  //         coordinates: [coordinates.map(latLng => [latLng.lng(), latLng.lat()])]
  //       };
  //     });
  //   }
  //   console.log("new coordinats : ", this.polygone_coordinet)

  //   // Fit the map bounds to the polygon's bounds
  //   const bounds = new google.maps.LatLngBounds();
  //   coordinates.forEach((coordinate) => {
  //     bounds.extend(coordinate);
  //   });
  //   this.map.fitBounds(bounds);
  // }

  // ////////////////////////////////
  drawPolygon(coordinates:number[][][]): void {
    this.clearPolygon();
  
    const paths = coordinates.map(ring => ring.map(coord => ({ lat: coord[1], lng: coord[0] })));
    // Create a new polygon for the selected zone
    this.polygon = new google.maps.Polygon({
      // paths: coordinates,
      paths:paths,
      
      strokeColor: 'green',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: 'green',
      fillOpacity: 0.35,
      editable: true,
      draggable: true,
      map: this.map
    });
  
    // Add event listener for polygon edit
    if (this.polygon !== null) {

      google.maps.event.addListener(this.polygon.getPath(), 'set_at', () => {
        // When a vertex is moved (dragged) in the polygon
        console.log('Polygon edited - new coordinates:');
        const updatedCoordinates: google.maps.LatLng[] = this.polygon!.getPath().getArray();
        this.polygone_coordinet = {
          type: 'Polygon',
          coordinates: [updatedCoordinates.map(latLng => [latLng.lng(), latLng.lat()])]
        };
      });

      google.maps.event.addListener(this.polygon.getPath(), 'insert_at', () => {
        // When a vertex is moved (dragged) in the polygon
        console.log('Polygon edited - new coordinates:');
        const updatedCoordinates: google.maps.LatLng[] = this.polygon!.getPath().getArray();
        this.polygone_coordinet = {
          type: 'Polygon',
          coordinates: [updatedCoordinates.map(latLng => [latLng.lng(), latLng.lat()])]
        };
      });

      google.maps.event.addListener(this.polygon.getPath(), 'remove_at', () => {
        // When a vertex is moved (dragged) in the polygon
        console.log('Polygon edited - new coordinates:');
        const updatedCoordinates: google.maps.LatLng[] = this.polygon!.getPath().getArray();
        this.polygone_coordinet = {
          type: 'Polygon',
          coordinates: [updatedCoordinates.map(latLng => [latLng.lng(), latLng.lat()])]
        };
      });

      // focus on map
      const bounds = new google.maps.LatLngBounds();
      paths.forEach(path => path.forEach(coord => bounds.extend(coord)));
      this.map.fitBounds(bounds);

    }
  }
  // ////////////////////////////////

  updateZone(): void {
    if (this.selectedZone && this.selectedZone._id) {
      const zoneId = this.selectedZone._id;
      const updatedZoneData = {
        name: this.selectedZone.name,
        coordinates: this.polygone_coordinet
      };
      this.CityService.updateZone(this.selectedZone._id, updatedZoneData).subscribe(
        (response: any) => {
          const updatedCoordinates = response.coordinates;
          const index = this.zones.findIndex((z: Zone) => z._id === zoneId);
          if (index !== -1) {
            this.zones[index].coordinates = updatedCoordinates;
          }
          this.toastr.success('Zone updated successfully');
          this.initMap()
          this.isDissUpdatebtn=true
        },
        (error) => {
          console.error('Error updating zone:', error);
          this.toastr.error('Failed to update zone. Please try again later.');
        }
      );
    } else {
      this.toastr.error('Please select a zone first.');
    }
  }

}









