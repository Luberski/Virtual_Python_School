import Image from 'next/image';

const Footer = () => (
  <footer className="flex items-center justify-center p-4">
    <Image
      src={'/ZUT_logo_kolor.svg'}
      alt="login"
      width="24"
      height="24"
      title="Zachodniopomorski Uniwersytet Technologiczny w Szczecinie"
    />
    <span className="pl-1">&copy; 2022 Virtual Python School</span>
  </footer>
);

export default Footer;
