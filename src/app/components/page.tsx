import { Button, IconBtn, Input } from '@/shared';
import { ArrowIcon } from '@/shared/assets';

const Components = () => {
  return (
    <div>
      <Button variant='outline' size='lg'>
        outline btn
      </Button>
      <Button IconLeft={ArrowIcon} IconRight={ArrowIcon}>
        Button
      </Button>
      <Button variant='text'>text btn</Button>
      <IconBtn size='lg'>
        <ArrowIcon className='rotate-180 size-5' />
      </IconBtn>
      <div>
        <Input />
      </div>
      <p>QWERTY</p>
    </div>
  );
};

export default Components;
