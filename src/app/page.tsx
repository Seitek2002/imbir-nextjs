import Link from 'next/link';
import { Header } from '@/widgets';

export default function Home() {
  return (
    <div>
      <Header />
      Если ты запустил проект Буран, то тебе надо зайти на страницу{' '}
      <Link href='/components' className='text-[blue] underline'>
        /components
      </Link>
    </div>
  );
}
