export interface Card {
  id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  default: boolean;
}

export interface CardData {
  id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
}

export interface CustomerCardsResponse {
  cards: Card[];
  defaultCardId: string | null;
  success: boolean;
  error?: string;
}

export interface AddCardResponse {
  cardData: CardData;
  success: boolean;
  error?: string;
}