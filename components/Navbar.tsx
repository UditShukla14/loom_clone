'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

const Navbar = () => {
    const {data:session} = authClient.useSession();
    const user = session?.user;
    const router=useRouter();
  return (
    <header className='navbar'>
        <nav>
            <Link href="/">
            <Image src="/assets/icons/logo.svg" alt="logo" width={32} height={32} />
            <h1>loomCast_Cloner</h1>
            </Link>

            {user && (  
                <figure>
                    <button onClick={()=> router.push(`/profile/${user.id}`)}>
                        <Image src={user.image || '/assets/images/dummy.jpg'} alt="user" width={36} height={36} className='rounded-full aspect-square' />
                    </button>
                    <button className='cursor-pointer' onClick={()=>{
                        authClient.signOut();
                        router.push('/sign-in')
                    }} >
                        <Image src="/assets/icons/logout.svg" alt="logout" width={24} height={24} className='rotate-180' />
                    </button>
                </figure>
            )}
        </nav>
    </header>
  )
}

export default Navbar 