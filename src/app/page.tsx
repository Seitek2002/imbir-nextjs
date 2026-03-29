import Link from 'next/link';

export default function Home() {
  return (
    <div>
      Если ты запустил проект Буран, то тебе надо зайти на страницу{' '}
      <Link href='/components' className='text-[blue] underline'>
        /components
      </Link>
    </div>
  );
}
