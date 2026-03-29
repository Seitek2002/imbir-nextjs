import { Button } from '@/shared';
import {
  FilterSample,
  GeoBtnArrowIcon,
  GeoIcon,
  Logo,
  SearchSample,
} from '@/shared/assets';

export const Header = () => {
  return (
    <header className='px-4'>
      <div className='flex items-center justify-between'>
        <Logo />
        <Button
          IconLeft={GeoIcon}
          IconRight={GeoBtnArrowIcon}
          variant='outline'
          size='sm'
        >
          Бишкек
        </Button>
      </div>
      <div className='flex items-center justify-between mt-4'>
        <SearchSample className='active:scale-90 transition-transform' />
        <FilterSample className='active:scale-90 transition-transform' />
      </div>
    </header>
  );
};
