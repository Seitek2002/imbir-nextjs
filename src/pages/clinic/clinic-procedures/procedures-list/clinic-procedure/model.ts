export type Procedure = {
  category: string;
  clinic: string;
  duration?: null | number;
  id: string;
  image?: string;
  name: string;
  // Бэк может не отдать цену — карточка тогда прячет строку с ценой
  price?: number;
  reviews?: number;
};
