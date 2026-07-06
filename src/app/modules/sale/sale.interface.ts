import { Sale, SaleItem } from "@prisma/client";

export interface ISaleUser {
  id: string;
  name: string;
  email: string;
}

export interface ISaleWithUser extends Sale {
  user: ISaleUser;
}

export interface IPopulatedSaleItem extends SaleItem {
  productName: string;
  productSku: string;
  productImage: string;
}

export interface IPopulatedSale extends Omit<Sale, "items"> {
  items: IPopulatedSaleItem[];
  user: ISaleUser;
}

export interface IAuthUser {
  userId: string;
  role: string;
  email: string;
}
