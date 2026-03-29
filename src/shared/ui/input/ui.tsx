import { FC, InputHTMLAttributes, ReactNode } from 'react';

type Sizes = 'small' | 'large';

type Props = {
  className?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  size?: Sizes;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input: FC<Props> = () => {
  return (
    <label htmlFor='name'>
      <span className='text-[#0D0D12] text-sm font-medium'>Имя</span>
      <div className='relative max-w-max'>
        <input
          id='name'
          type='text'
          placeholder='Placeholder'
          className='text-base leading-0 border border-[#E3E4E5] text-[#191A1B] rounded-lg py-2.25 px-3 outline-none focus:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]'
        />
        <svg
          className='absolute top-2.25 right-3 z-1'
          width='20'
          height='20'
          viewBox='0 0 20 20'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <ellipse
            cx='10.0013'
            cy='14.5837'
            rx='5.83333'
            ry='2.91667'
            stroke='#191A1B'
            stroke-width='1.5'
            stroke-linejoin='round'
          />
          <circle
            cx='10.0013'
            cy='5.83333'
            r='3.33333'
            stroke='#191A1B'
            stroke-width='1.5'
            stroke-linejoin='round'
          />
        </svg>
      </div>
      <span className='flex items-center gap-1 text-sm text-[#838A8D]'>
        <svg
          width='16'
          height='16'
          viewBox='0 0 16 16'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M8 5.33333V8M8 10.6667H8.00667M2 8C2 8.78793 2.15519 9.56815 2.45672 10.2961C2.75825 11.0241 3.20021 11.6855 3.75736 12.2426C4.31451 12.7998 4.97595 13.2417 5.7039 13.5433C6.43185 13.8448 7.21207 14 8 14C8.78793 14 9.56815 13.8448 10.2961 13.5433C11.0241 13.2417 11.6855 12.7998 12.2426 12.2426C12.7998 11.6855 13.2417 11.0241 13.5433 10.2961C13.8448 9.56815 14 8.78793 14 8C14 6.4087 13.3679 4.88258 12.2426 3.75736C11.1174 2.63214 9.5913 2 8 2C6.4087 2 4.88258 2.63214 3.75736 3.75736C2.63214 4.88258 2 6.4087 2 8Z'
            stroke='#DF1C41'
            stroke-width='1.5'
            stroke-linecap='round'
            stroke-linejoin='round'
          />
        </svg>
        This is a hint text to help user
      </span>
    </label>
  );
};
