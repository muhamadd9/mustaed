import WhatsAppIcon from './icons/WhatsAppIcon';

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/966563866234"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="تواصل عبر واتساب"
    >
      <WhatsAppIcon className="w-7 h-7" />
    </a>
  );
};

export default WhatsAppButton;
