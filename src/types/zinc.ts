export interface Query {
  timestamp: number;
  status: string;
  retailer: string;
  results: Result[];
  refinements: Refinement[];
  rh: null;
  showing: Showing;
}

export interface Refinement {
  groupName: string;
  options: Option[];
}

export interface Option {
  name: string;
  id: string;
  indent: number;
  checkbox: boolean;
}

export interface Result {
  product_id: string;
  title: string;
  image: string;
  brand: Brand;
  price: number | null;
  num_offers_estimate: null;
  num_reviews: number | null;
  stars: number | null;
  num_sales: number | null;
  product_details: any[];
  fresh: boolean;
  prime: boolean;
  pantry: boolean;
  addon: boolean;
}

export enum Brand {
  Converse = "Converse",
  ConverseAllStar = "CONVERSE ALL STAR",
  Yageyan = "yageyan",
}

export interface Showing {
  start: number;
  end: number;
  of: number;
  pages: number;
}
