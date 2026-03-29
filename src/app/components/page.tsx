import { Button } from '@/shared';
import { ArrowIcon } from '@/shared/assets';

const Components = () => {
  return (
    <div>
      <Button variant='outline' size='lg'>outline btn</Button>
      <Button iconLeft={<ArrowIcon className='rotate-180 size-5' />} iconRight={<ArrowIcon className="size-5" />}>Button</Button>
      <Button variant='text'>text btn</Button>
      <p>QWERTY</p>
    </div>
  );
};

export default Components;
