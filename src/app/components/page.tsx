import { Button } from '@/shared';

const Components = () => {
  return (
    <div>
      <Button prefix={'ICON'} suffix={'ICON'}>default btn</Button>
      <Button variant='outline'>outline btn</Button>
      <Button variant='text'>text btn</Button>
      <p>QWERTY</p>
    </div>
  );
};

export default Components;
