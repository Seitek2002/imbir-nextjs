import { Button } from '@/shared';
import { ArrowIcon } from '@/shared/assets';

const Components = () => {
  return (
    <div>
      <Button variant='outline'>outline btn</Button>
      <Button iconLeft={<ArrowIcon className='rotate-180' />} iconRight={<ArrowIcon />}>Button</Button>
      <Button variant='text'>text btn</Button>
      <p>QWERTY</p>
    </div>
  );
};

export default Components;
