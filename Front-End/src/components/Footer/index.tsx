import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Footer = () => {
  const router = useRouter();

  return (
    <footer className="flex flex-col items-center justify-center p-4">
      <div className="flex items-center">
        <Image
          src={'/ZUT_logo_kolor.svg'}
          alt="login"
          width="24"
          height="24"
          title="Zachodniopomorski Uniwersytet Technologiczny w Szczecinie"
        />
        <span className="pl-1">&copy; 2022 Virtual Python School</span>
      </div>
      <Link href="/accessibility-declaration">
        {router.locale === 'pl' ? (
          <a className="pt-1 pl-1 text-sm">Deklaracja dostępności</a>
        ) : (
          <a className="pt-1 pl-1 text-sm">Accessibility declaration</a>
        )}
      </Link>
    </footer>
  );
};

export default Footer;
