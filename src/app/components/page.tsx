import { Button } from '@/shared';
import { ArrowIcon } from '@/shared/assets';

const Components = () => {
  return (
    <div>
      <Button iconLeft={<ArrowIcon />} iconRight={'ICON'}>default btn</Button>
      <Button variant='outline'>outline btn</Button>
      <Button variant='text'>text btn</Button>
      <p>QWERTY</p>
    </div>
  );
};

export default Components;
