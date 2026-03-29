'use client';

import { Button, IconBtn, Input } from '@/shared';
import { ArrowIcon, PersonIcon } from '@/shared/assets';

const Components = () => {
  return (
    <div>
      <p>
        Если хочешь навешать onClick на кнопки, то надо в начале файла где есть
        кнопка написать &apos;use client&apos;
      </p>
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
        <Input IconLeft={PersonIcon} type='password' />
      </div>
      <div>
        <Input
          label='Имя'
          IconRight={PersonIcon}
          error='Буран добавь деталей'
          disabled
        />
      </div>
      <p>QWERTY</p>
    </div>
  );
};

export default Components;
