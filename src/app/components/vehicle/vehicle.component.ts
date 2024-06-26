import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { VehicleService } from '../../services/vehicle.service';
import { VehicleType } from '../../models/vihicle-type'
import { firstCharIsLetter } from '../../validator/first_cherecter';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.css'
})
export class VehicleComponent implements OnInit {
  name: string = '';
  icon: File | null = null;
  vehicles: any[] = [];
  btn_name: string = "Add Vehicle"
  selectedVehicle: any = null;
  showCancelButton: boolean = false;
  priviosIconName: string = ''
  myForm: FormGroup
  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private toster: ToastrService) {
    this.myForm = this.fb.group({
      name: ['', [Validators.required, firstCharIsLetter()]],
      icon: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getVehicles();
  }
  getVehicles(): void {
    this.vehicleService.getAllVehicles().subscribe(
      (data: VehicleType[]) => {
        this.vehicles = data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  onSubmit(): void {
    this.name = this.myForm.get('name')?.value
    for(let x=0;x<this.vehicles.length;x++){
      var traverseName=this.vehicles[x].name;
      if (this.name===traverseName) {
        console.log(this.name)
        this.toster.error("Same Name not allow")
        return;
      }
    }
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(this.icon!.type)) {
      this.toster.error('Invalid file type. Only PNG,JPEG and jpg files are allowed')
      return;
    }
    const maxSizeInBytes = 1 * 1024 * 1024;
    if (this.icon!.size > maxSizeInBytes) {
      this.toster.error('File size grater then 1 MB not allow')
      return;
    }

    this.vehicleService.addVehicle(this.name, this.icon!).subscribe(
      (vehecle: VehicleType) => {
        if (vehecle.success) {
          this.vehicles.push(vehecle.data);
          this.toster.success(vehecle.message)
          this.removeFormData()
        } 
      },
      (error) => {
        this.toster.error(error)
      }
    );
  }
  // //////////////////////select icon file/////////////////////////////////
  onFileSelected(event: any): void {
    this.icon = event.target.files[0];
  }
  getIconUrl(iconName: string): string {
    return `${environment.apiUrl}/uploads/icons/${iconName}`;
  }
  editVehicle(vehicle: any): void {
    this.btn_name = "Update";
    this.myForm.patchValue({
      name: vehicle.name
    })
    this.selectedVehicle = vehicle;
    this.icon = vehicle.icon;
    this.priviosIconName = vehicle.icon.substring(14)
    this.showCancelButton = true;
  }
  // /////////////////////////////update data////////////////////////////////////
  onUpdate() {
    this.name = this.myForm.get('name')?.value
    let matchIndex = -1;
    const selectedId = this.selectedVehicle?._id;
    const selectedName = this.selectedVehicle?.name;

    for (let i = 0; i < this.vehicles.length; i++) {
      const vehicle = this.vehicles[i];
      if (vehicle._id === selectedId && vehicle.name === selectedName) {
        matchIndex = i;
        break;
      }
    }
    if ((this.name === this.vehicles[matchIndex].name) && (this.icon === this.vehicles[matchIndex].icon)) {
      this.toster.error("Name and Icon remains the same");
      return;
    }
    for(let x=0;x<this.vehicles.length;x++){
      var traverseName=this.vehicles[x].name;
      if (this.name===traverseName && (this.icon === this.vehicles[matchIndex].icon)) {
        console.log(this.name)
        this.toster.error("Same Name not allow")
        return;
      }
    }

    const maxSizeInBytes = 1 * 1024 * 1024;
    if (this.icon!.size > maxSizeInBytes) {
      this.toster.error('File size grater then 1 MB not allow')
      return;
    }
    this.vehicleService.editVehicle(this.selectedVehicle._id, this.name, this.icon).subscribe(
      (data: VehicleType) => {
        this.getVehicles();
        this.removeFormData()
        this.toster.success(data.message);
        console.log(data)
      },
      (error) => {
        this.toster.error(error);
      }
    );
  }

  removeFormData() {
    this.myForm.reset()
    this.showCancelButton = false
    this.btn_name = "Add Vehicle";
    this.priviosIconName = ""
  }

}
