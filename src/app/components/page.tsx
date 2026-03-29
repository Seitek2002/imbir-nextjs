'use client';

import { Button, Dropdown, IconBtn, Input, Radio } from '@/shared';
import { ArrowIcon, PersonIcon } from '@/shared/assets';

const Components = () => {
  return (
    <div>
      <p>
        Если хочешь навешать Event (события) на компоненты, то надо в начале
        файла где есть кнопка написать &apos;use client&apos;
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
      <div className='flex flex-col gap-4'>
        <Radio name='group1' size='small' label='Small option' defaultChecked />
        <Radio name='group1' size='large' label='Large option' />
      </div>
      <Dropdown />
    </div>
  );
};

export default Components;
