export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number | string;
  item_total: number | string;
  category?: 'food' | 'drink' | 'alcohol' | 'shared' | 'tax' | 'service' | 'discount';
  confidence?: number;
}

export interface Bill {
  items: BillItem[];
  subtotal: number | string;
  tax: number | string;
  service_charge: number | string;
  discount: number | string;
  printed_total: number | string;
  currency_symbol: string;
  confidence?: number;
}

export interface Person {
  id: string;
  name: string;
}

export interface ItemAssignment {
  item_id: string;
  person_ids: string[];
  person_shares?: Record<string, number>;
}

export interface SplitRequest {
  bill: Bill;
  people: Person[];
  assignments: ItemAssignment[];
}

export interface PersonBreakdown {
  person_id: string;
  name: string;
  items_total: number | string;
  tax: number | string;
  service_charge: number | string;
  discount: number | string;
  total: number | string;
}

export interface SplitResult {
  calculated_total: number | string;
  printed_total: number | string;
  mismatch_amount: number | string;
  currency_symbol: string;
  people_breakdowns: PersonBreakdown[];
}
