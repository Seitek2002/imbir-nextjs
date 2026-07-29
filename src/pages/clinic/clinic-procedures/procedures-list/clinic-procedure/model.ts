export type Procedure = {
  id: string;
  name: string;
  category: string;
  clinic: string;
  // Бэк может не отдать цену — карточка тогда прячет строку с ценой
  price?: number;
  image?: string;
  reviews?: number;
};
