import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SettingService } from '../../services/setting.service';
import { Setting } from '../../models/setting';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  secondsOptions: number[] = [10, 20, 30, 45, 60, 90, 120];
  stopOptions: number[] = [1, 2, 3, 4, 5];
  settingForm: FormGroup;

  constructor(private _AuthService:AuthService,
    private SettingService:SettingService,
    private ToastrService:ToastrService,
    private fb: FormBuilder,
  ){
    this.settingForm = this.fb.group({
      email_user: ['',[Validators.required,Validators.email]],
      email_password: [''],
      twilio_accountSid: [''],
      twilio_authToken: [''],
      twilio_PhoneNumber: [''],
      stripe_sk: [''],
      stripe_pk: ['']
    });
  }
  adminId:any
  selectedSeconds!: number;
  selectedStopCount!: number;
  
  ngOnInit(): void {
    this.getSetting()
  }
  saveSetting(): void {
    this.SettingService.saveSetting(this.selectedSeconds, this.selectedStopCount,this.settingForm.value)
      .subscribe(
        (response:Setting) => {
          this.ToastrService.success('Setting saved successfully')
          // this.settingForm.reset()
          // console.log('Setting saved successfully', response);
        },
        (error) => {
          this.ToastrService.error('Error saving setting',error)
          // console.error('Error saving setting', error);
        }
      );
  }
  getSetting(){
    this.SettingService.getSetting().subscribe((response:Setting[])=>{
      if (response) {
        this.selectedSeconds=response[0].selectedSeconds;
        this.selectedStopCount=response[0].selectedStopCount;
        this.settingForm.patchValue({
          email_user: response[0].email_user,
          email_password: response[0].email_password,
          twilio_accountSid: response[0].twilio_accountSid,
          twilio_authToken: response[0].twilio_authToken,
          twilio_PhoneNumber: response[0].twilio_PhoneNumber,
          stripe_sk: response[0].stripe_sk,
          stripe_pk: response[0].stripe_pk
        });
      }
    })
  }
}
