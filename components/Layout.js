import React from 'react';
import Link from 'next/link';
import LoginMenu from './LoginMenu';
import WPMenu from './WPMenu';

const Layout = ({ children }) => {
  return (
    <>
      <header className='site-header py-5 border-b mb-10'>
        <nav className='container menu-container max-w-screen-xl mx-auto flex flex-wrap justify-between items-center sm:px-5 px-5'>
          <h1 className='text-3xl font-bold text-slate-700'>
            <Link href="/">Headless Blog</Link>
          </h1>
          <ul style={styles.navList}>
            <li><Link className='text-slate-600 text-base hover:text-slate-950' href="/">Home</Link></li>
            {/* <li><Link className='text-slate-600 text-base hover:text-slate-950' href="/about">About</Link></li> */}
            <li><Link className='text-slate-600 text-base hover:text-slate-950' href="/category">Category</Link></li>
            <li><Link className='text-slate-600 text-base hover:text-slate-950' href="/tag">Tag</Link></li>
            <LoginMenu/>
          </ul>
          {/* <WPMenu menuSlug={`${process.env.NEXT_PUBLIC_PRIMARY_MENU_ID}`} /> */}
        </nav>
      </header>

      <main className='site-content'>
        <div className='container max-w-screen-xl mx-auto flex flex-direction-col justify-center sm:px-5 px-5'>
          {children}
        </div>
      </main>

      <footer className='site-footer border-t py-5 mt-10'>
        <div className="container mx-auto">
          <p className="text-center">&copy; {new Date().getFullYear()} My WordPress Blog</p>
        </div>
      </footer>
    </>
  );
};

const styles = {
  header: {
    background: '#333',
    color: '#fff',
    padding: '10px 20px',
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    gap: '15px',
    padding: 0,
    margin: 0,
  },
  main: {
    minHeight: '80vh',
    padding: '20px',
  },
  footer: {
    background: '#333',
    color: '#fff',
    textAlign: 'center',
    padding: '10px',
  },
};

export default Layout;