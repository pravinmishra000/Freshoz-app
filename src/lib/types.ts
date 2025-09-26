export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  imageHint: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

export interface EarningPeriod {
  day: string;
  earnings: number;
}

export interface Transaction {
  id: string;
  status: 'Completed' | 'Pending' | 'Failed';
  amount: number;
  date: string;
}
