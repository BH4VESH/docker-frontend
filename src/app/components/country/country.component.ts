import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CountryService } from '../../services/country.service';
import { FormControl, FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ToastrService } from 'ngx-toastr';
import { Country } from '../../models/country';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [FormsModule, CommonModule, MatAutocompleteModule, NgIf],
  templateUrl: './country.component.html',
  styleUrl: './country.component.css'
})
export class CountryComponent implements OnInit, Country {
  countryName: string = '';
  countryDetails: any = [];
  currency: string = ""
  country_code: any = ""
  country_calling_code: any = ""
  time_zone: any = ""
  flag: string = ""
  add_btn: boolean = false
  short_name: string = ""
  country_table_data: Country[] = []
  event: any;

  constructor(
    private countryService: CountryService,
    private ToastrService: ToastrService) { }

  ngOnInit(): void {
    this.country_fatch_data_db()
  }

  fetchCountryDetails() {
    if (this.countryName.trim() !== '') {
      this.countryService.searchCountries(this.countryName).subscribe(
        (data) => {
          this.countryDetails = data[0];
          console.log(data[0]);
          if (this.countryDetails) {
            this.countryName = this.countryDetails.name.common
            this.currency = Object.keys(this.countryDetails.currencies)[0]
            this.country_code = this.countryDetails.cca3
            this.country_calling_code = this.countryDetails.idd?.root + this.countryDetails?.idd?.suffixes[0]
            this.time_zone = this.countryDetails.timezones[0]
            this.flag = this.countryDetails.flags.png
            this.short_name = this.countryDetails.cca2

            this.ToastrService.success("Country search successfull")
          }
        },
        (error) => {
          this.ToastrService.error(error.statusText)
          console.error('Error searching countries:', error);
        }
      );
    } else {
      this.countryDetails = [];
    }
  }

  add_table() {
    let matchIndex = false;
    if (this.country_table_data.length == 0) {
      matchIndex = true;
    }
    for (let i = 0; i < this.country_table_data.length; i++) {
      if (this.country_code === this.country_table_data[i].country_code) {
        matchIndex = false;
        this.ToastrService.error("Duplicate countries are not allowed")
        break;
      } else {
        matchIndex = true;
      }
    }

    const senddata = {
      countryName: this.countryName,
      currency: this.currency,
      country_code: this.country_code,
      country_calling_code: this.country_calling_code,
      time_zone: this.time_zone,
      flag: this.flag,
      short_name: this.short_name
    }
    if (matchIndex === true) {
      this.countryService.addCountry(senddata).subscribe(
        (data) => {
          this.country_table_data.push(data)
          this.ToastrService.success("country added successfull")
        })
    }
    this.countryName = ""
    this.currency = ""
    this.country_code = ""
    this.country_calling_code = ""
    this.time_zone = ""
    this.flag = ""
    matchIndex = false
  }
  country_fatch_data_db() {
    this.countryService.fatchCountry().subscribe(
      (fatchData: Country[]) => {
        this.country_table_data = fatchData;
        // console.log(fatchData);
        this.search()
      },
      (error) => {
        console.error('Error fetching country data:', error);
      }
    );
  }
  // /////////////////////search///////////////////////
  searchQuery: string = '';
  filteredCountryData: Country[] = [];
  search() {
    if (this.searchQuery.trim() !== '') {
      this.filteredCountryData = this.country_table_data.filter((country: any) =>
        country.countryName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredCountryData = [...this.country_table_data];
    }
  }

}
