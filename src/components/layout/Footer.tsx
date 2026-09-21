import React from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Send, MapPin, Phone, Mail, Facebook, Instagram, Youtube, ArrowUp } from 'lucide-react';

const quickLinks = [
  { href: '/about', label: 'Về chúng tôi' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'Câu hỏi thường gặp' },
];

const categories = [
  { href: '/products?category=coffee-beans', label: 'Hạt cà phê' },
  { href: '/products?category=ground-coffee', label: 'Cà phê xay' },
  { href: '/products?category=instant-coffee', label: 'Cà phê hòa tan' },
  { href: '/products?category=accessories', label: 'Phụ kiện' },
];

const contactInfo = [
  { icon: MapPin, text: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM' },
  { icon: Phone, text: '0901 234 567' },
  { icon: Mail, text: 'contact@coffeehomeblend.com' },
];

const socialLinks = [
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://youtube.com', icon: Youtube, label: 'Youtube' },
];

const paymentMethods = [
  { name: 'Visa', icon: '💳' },
  { name: 'Mastercard', icon: '💳' },
  { name: 'MoMo', icon: '📱' },
  { name: 'ZaloPay', icon: '📱' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-900 text-stone-300 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <svg viewBox="0 0 40 40" className="h-10 w-10 text-amber-500" fill="currentColor">
                <path d="M8 8h24v4c0 8.837-7.163 16-16 16S0 20.837 0 12V8h8zm0 4v4h24V12H8zm2 8v16c0 6.627 5.373 12 12 12s12-5.373 12-12V20H10z" />
                <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="font-display text-xl font-bold text-white">Coffee Home Blend</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-stone-400">
              Mang đến cho bạn những hạt cà phê chất lượng nhất từ những vùng trồng nổi tiếng Việt
              Nam. Hương vị đậm đà, tinh túy từng ly.
            </p>
            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-stone-400 transition-colors hover:bg-amber-700 hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white">Liên kết nhanh</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm transition-colors hover:text-amber-500">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white">Danh mục</h3>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.href}>
                  <Link
                    to={category.href}
                    className="text-sm transition-colors hover:text-amber-500"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white">Liên hệ</h3>
            <ul className="space-y-4">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                  <span className="text-sm">{item.text}</span>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-white">Đăng ký nhận tin</h4>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 border-stone-700 bg-stone-800 text-white placeholder:text-stone-500"
                />
                <Button type="submit" size="sm" disabled={subscribed}>
                  {subscribed ? '✓' : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-800 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-stone-500">Thanh toán:</span>
              <div className="flex gap-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="flex h-8 w-12 items-center justify-center rounded bg-stone-800 text-lg"
                    title={method.name}
                  >
                    {method.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <p className="text-sm text-stone-500">
              © {new Date().getFullYear()} Coffee Home Blend. Tất cả quyền được bảo lưu.
            </p>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-sm text-stone-500 transition-colors hover:text-amber-500"
            >
              Quay lên đầu trang
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
