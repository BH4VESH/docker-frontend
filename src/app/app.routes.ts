import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { authguardGuard } from './guards/authguard.guard';

import { VehicleComponent } from './components/vehicle/vehicle.component';
import { CountryComponent } from './components/country/country.component';
import { CityComponent } from './components/city/city.component';
import { VehiclePricingComponent } from './components/vehicle-pricing/vehicle-pricing.component';
import { SettingsComponent } from './components/settings/settings.component';
import { UserComponent } from './components/user/user.component';
import { DriverListComponent } from './components/driver-list/driver-list.component';
import { AdminComponent } from './components/admin/admin.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { CreateRideComponent } from './components/create-ride/create-ride.component';
import { ConfirmedRidesComponent } from './components/confirmed-rides/confirmed-rides.component';
import { RunningRequestComponent } from './components/running-request/running-request.component';
import { RideHistoryComponent } from './components/ride-history/ride-history.component';


export const routes: Routes = [
    { path: '', redirectTo:'/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [authguardGuard],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: DashboardComponent },
          { path: 'Vehicle_type', component: VehicleComponent },
          { path: 'country', component: CountryComponent },
          { path: 'city', component: CityComponent },
          { path: 'vehicle_pricing', component: VehiclePricingComponent },
          { path: 'settings', component: SettingsComponent },
          { path: 'user', component: UserComponent },
          { path: 'driver-list', component: DriverListComponent },
          { path: 'create_ride', component:CreateRideComponent },
          {path: 'confirmed_rides', component:ConfirmedRidesComponent},
          {path: 'running_request', component:RunningRequestComponent},
          {path: 'ride_history', component:RideHistoryComponent}
        ]
      },
      {path:'**',component:PagenotfoundComponent,title:'page not found'}
    
];
