import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CountryService } from '../../services/country.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { User2Service } from '../../services/user2.service';
import { MatSort, MatSortModule, SortDirection } from '@angular/material/sort';
import { User, UserSearchResponse, FatchUser, SortResponce } from '../../models/user'
import { Country } from '../../models/country';

//for card
import { CardService } from '../../services/card.service';
import { notSymbol, onlyChar } from '../../validator/username_validation';
import { AuthService } from '../../services/auth.service';
import { AddCardResponse, Card, CardData, CustomerCardsResponse } from '../../models/card';
import { environment } from '../../../environments/environment.development';
declare var Stripe: any;
// import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-user2',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatPaginatorModule, MatSortModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit, AfterViewInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(MatSort) sort!: MatSort;

  userProfileForm: FormGroup;
  profilePic: File | null = null;
  countries: Country[] = [];
  countryId!: string;
  countryCode!: string;
  allUsers: any[] = [];
  btn_name: string = "submit"
  currentUserId!: string;

  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 4;
  search_query: string = '';

  constructor(
    private _AuthService: AuthService,
    private fb: FormBuilder,
    private user2Service: User2Service,
    private countryService: CountryService,
    private toastrService: ToastrService,
    private CardService: CardService
  ) {
    this.userProfileForm = this.fb.group({
      profilePic: ['', Validators.required],
      username: ['', [Validators.required, notSymbol(), onlyChar()]],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['', Validators.required],
      phone: ['', Validators.required],
      selectedCode: ['']
    });
  }

  ngOnInit(): void {
    this.fetchCountries();
    this.fetchUserData();
  }
  ngAfterViewInit(): void {
    this.createStripeElement();
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
  onCountryChenge(event: Event) {
    const selectedValue = this.userProfileForm.get('countryCode')?.value;
    const selectedId = selectedValue.id;
    const selectedCode = selectedValue.code;
    this.countryId = selectedId
    this.countryCode = selectedCode
  }

  submitUserProfile() {
    const { username, email, phone } = this.userProfileForm.value;

    this.user2Service.addUser(this.countryId, username, email, phone, this.profilePic as File).subscribe(
      (response: User) => {
        if (response.success) {
          this.toastrService.success('User added successfully.');
          if (this.allUsers.length < this.itemsPerPage) {
            this.allUsers.push(response.user)
          }
          this.totalItems++;
          console.log(response.user)
          this.resetForm();
        } else {
          this.toastrService.error(response.message);
        }
      },
      (error) => {
        this.toastrService.error(error);
      }
    );
  }

  resetForm() {
    this.userProfileForm.reset();
    this.profilePic = null;
    this.fileInput.nativeElement.value = '';
  }

  fetchUserData(): void {
    this.user2Service.getUser(this.currentPage, this.itemsPerPage).subscribe(
      (response: FatchUser) => {
        if (response.success) {
          this.allUsers = response.users;
          this.totalItems = response.totalItems;
          console.log(this.allUsers)
        } else {
          this.toastrService.error('Error fetching user data:', response.message);
        }
      },
      error => {
        this.toastrService.error('Error fetching user data');
      }
    );
  }

  onPageChange(event: any): void {
    console.log(event)

    this.currentPage = event.pageIndex + 1;
    if (this.sort.direction && this.sort.active) {
      this.getShortData(this.sort.active, this.sort.direction);
    } else if (this.search_query) {
      this.search();
    } else {

      this.fetchUserData();
    }
  }

  getUserPic(iconName: string): string {
    return `http://localhost:3000/uploads/userProfilePic/${iconName}`;
  }

  editUser(user: any) {
    console.log(user)
    this.btn_name = "Update";
    this.userProfileForm.patchValue({
      username: user.username,
      email: user.email,
      countryCode: user.countryCode,
      selectedCode: "selected :" + user.countryCode,
      phone: user.phone
    });
    this.countryId = user.countryId
    this.currentUserId = user._id;
  }

  updateUser() {
    const userId = this.currentUserId;
    const { username, email, phone } = this.userProfileForm.value;
    const profilePic = this.profilePic as File;
    console.log(this.countryId)

    this.user2Service.editUser(userId, username, email, this.countryId, phone, profilePic).subscribe(
      (response: User) => {
        if (response.success) {
          this.toastrService.success(response.message);
          let matchIndex = -1;//find and replace
          for (let i = 0; i < this.allUsers.length; i++) {
            const vehicle = this.allUsers[i];
            if (vehicle._id === this.currentUserId) {
              matchIndex = i;
              break;
            }
          }
          this.allUsers[matchIndex] = response.user
          this.resetForm();
        } else {
          this.toastrService.error(response.message);
        }
      },
      (error) => {
        console.error('Error editing user:', error.message);
        if (error.error && error.error.message) {
          this.toastrService.error(error.error.message);
        } else {
          this.toastrService.error('An error occurred while editing user.');
        }
      }
    );
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.user2Service.deleteUser(userId).subscribe(
        (response) => {
          if (response.success) {
            const index = this.allUsers.findIndex(user => user._id === userId);
            this.totalItems--;
            if (index !== -1) {
              this.allUsers.splice(index, 1);
            }
            if (this.allUsers.length === 0) {
              this.currentPage--
              this.fetchUserData()
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
    this.user2Service.getSortUsers(this.currentPage, this.itemsPerPage, sortColumn, sortOrder).subscribe(
      (response: SortResponce) => {
        if (response.success) {
          this.allUsers = response.users;
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
    this.user2Service.searchUsers(this.search_query, this.currentPage, this.itemsPerPage).subscribe(
      (response: UserSearchResponse) => {
        if (response.success) {
          this.allUsers = response.users;
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
  ///////////////////// for card///////////////////////////////////////
  @ViewChild('cardElement') cardElement!: ElementRef;

  // stripe: Stripe | null = null;
  stripe: any;
  card: any;

  cardNumber!: string;
  expiry!: string;
  cvc!: string;

  CostomerId!: string
  token!: string
  token_id!: string
  cardData!: CardData
  cards: any[] = [];
  defaultCardId: string | null = null;
  paymentMethodId!: string;

  createStripeElement() {
    this.stripe = Stripe(environment.stripePublicKey);
    const elements = this.stripe.elements();
    this.card = elements.create('card');
    this.card.mount(this.cardElement.nativeElement);
  }

  async onSubmit() {
    if (!this.stripe || !this.card) {
      console.error('Stripe has not been initialized or card is missing.');
      return;
    }

    try {
      const result = await this.stripe.createToken(this.card);
      if (result.error) {
        this.toastrService.error(result.error.message)
        // console.error(result.error.message);
      } else {
        if (result.token && result.token.card) {
          // const { paymentMethod, error } = await this.stripe.createPaymentMethod({
          //   type: 'card',
          //   card: this.card,
          // });
          this.token = result.token
          this.token_id = result.token.id
          // this.paymentMethodId = paymentMethod.id;
          this.addCard()
          // console.log("it is token:", this.token)
        } else {
          this.toastrService.error('Token or card details are missing.')
          // console.error('Token or card details are missing.');
        }
      }
    } catch (error) {
      console.error('Failed to create token:', error);
    }

  }


  addCard() {

    this.CardService.addCard(this.CostomerId, this.token_id,this.paymentMethodId)
      .subscribe((response: AddCardResponse) => {
        // console.log(this.CostomerId)
        if (response.success) {
          // this.cardData=response
          this.cards.push(response.cardData
          )
          this.toastrService.success("Card added successfully")
          console.log('Card added successfully:', response.cardData
          );
          this.clearCardInput()
          console.log('Carddata:', this.cards);
        } else {
          this.toastrService.error(response.error)
          console.error(response.error);
        }
      }, error => {
        this.toastrService.error(error)
      });
  }

  selectedCostomer(CostomerId: string) {
    this.clearCardInput()
    console.log("CostomerId :", CostomerId)
    this.CostomerId = CostomerId;
    this.getCustomerCards(this.CostomerId)

  }
  getCustomerCards(customerId: string): void {
    this.cards=[]
    this.CardService.getCustomerCards(customerId)
      .subscribe(
        (response: CustomerCardsResponse) => {
          this.cards = response.cards;
          this.defaultCardId = response.defaultCardId;
          this.updateDefaultCardSelection();
          console.log('Cards:', this.cards);
          console.log('Default Card ID:', this.defaultCardId);
        },
        (error: any) => {
          console.error('Failed to retrieve cards:', error);
        }
      );
  }
  updateDefaultCardSelection(): void {
    if (this.defaultCardId) {
      const defaultCard = this.cards.find(card => card.id === this.defaultCardId);
      if (defaultCard) {
        defaultCard.isChecked = true;
      }
    }
  }

  toggleCardSelection(event: Event, card: Card) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {

      this.defaultCardId = card.id;
      this.setDefaultCard(card.id)
      console.log('Card selected:', card);

      this.cards.forEach(c => {
        if (c.id !== card.id) {
          c.isChecked = false;
        }
      });
    } else {
      this.defaultCardId = null;
    }
  }
  setDefaultCard(cardId: string): void {

    this.CardService.setDefaultCard(this.CostomerId, cardId)
      .subscribe(response => {
        if (response.success) {
          this.toastrService.success(response.message)
          console.log('Default card set successfully:', response.message);
        } else {
          console.error(response.error);
        }
      }, error => {
        console.error(error);
      });
  }

  deleteCard(cardId: string): void {
    console.log(this.CostomerId)
    console.log(cardId)
    if (confirm("are you sure to delete card")) {
      this.CardService.deleteCard(this.CostomerId, cardId)
        .subscribe(
          (response: any) => {
            if (response.success) {
              const index = this.cards.findIndex(card => card.id === cardId);
              this.totalItems--;
              if (index !== -1) {
                this.cards.splice(index, 1);
              }
              this.toastrService.success(response.message)
              console.log('Card deleted successfully:', response);
            }
          },
          (error: any) => {
            console.error('Failed to delete card:', error);
          }
        );
    }
  }

  clearCardInput() {
    this.card.unmount();
    this.card.mount(this.cardElement.nativeElement);
    this.token = '';
    this.token_id = '';
    // this.cardNumber = '';
    // this.expiry = '';
    // this.cvc = '';
    // this.paymentMethodId = '';
  }

}
