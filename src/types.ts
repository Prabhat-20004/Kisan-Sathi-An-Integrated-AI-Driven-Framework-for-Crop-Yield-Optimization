
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  MARKETPLACE = 'MARKETPLACE',
  ADVISORY = 'ADVISORY',
  PROFILE = 'PROFILE'
}

export interface SoilHealth {
  n: number;
  p: number;
  k: number;
  ph: number;
  oc: number;
  moisture: number;
}

export interface SoilHealthRecord {
  id: string;
  date: string;
  results: SoilHealth;
  recommendation: string;
}

export interface CropListing {
  id: string;
  farmerName: string;
  cropName: string;
  variety: string;
  quantity: number;
  basePrice: number;
  quality: string;
  image?: string;
  status: 'OPEN' | 'SOLD';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: Date;
}

export interface MandiPrice {
  commodity: string;
  market: string;
  min: number;
  max: number;
  modal: number;
}
