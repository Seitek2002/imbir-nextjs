export type Procedure = {
  category: string;
  clinic: string;
  duration?: null | number;
  id: string;
  image?: string;
  // false — процедура деактивирована: пациенты её не видят.
  isActive?: boolean;
  name: string;
  // Бэк может не отдать цену — карточка тогда прячет строку с ценой
  price?: number;
  reviews?: number;
};
