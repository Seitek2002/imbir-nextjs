export type Procedure = {
  category: string;
  clinic: string;
  id: string;
  image?: string;
  name: string;
  // Бэк может не отдать цену — карточка тогда прячет строку с ценой
  price?: number;
  reviews?: number;
};
