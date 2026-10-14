import { Link } from 'react-router-dom';
import { FileText, ShieldCheck, ChevronLeft } from 'lucide-react';

const content = {
  terms: {
    title: 'Điều khoản sử dụng',
    icon: FileText,
    sections: [
      {
        heading: '1. Phạm vi sử dụng',
        body: 'Coffee Home Blend cung cấp dịch vụ bán lẻ cà phê đặc sản trực tuyến. Khi sử dụng website, bạn đồng ý với các điều khoản dưới đây.',
      },
      {
        heading: '2. Tài khoản người dùng',
        body: 'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình. Mọi hoạt động thực hiện trên tài khoản của bạn được xem là do bạn chịu trách nhiệm.',
      },
      {
        heading: '3. Đơn hàng và thanh toán',
        body: 'Đơn hàng được xác nhận sau khi thanh toán thành công. Chúng tôi có quyền từ chối đơn hàng nếu thông tin không hợp lệ hoặc hàng hóa tạm thời hết hàng.',
      },
      {
        heading: '4. Đổi trả và bảo hành',
        body: 'Sản phẩm được đổi trả trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm còn nguyên vẹn bao bì và tem nhãn.',
      },
    ],
  },
  privacy: {
    title: 'Chính sách bảo mật',
    icon: ShieldCheck,
    sections: [
      {
        heading: '1. Thông tin chúng tôi thu thập',
        body: 'Chúng tôi thu thập họ tên, email, số điện thoại và địa chỉ giao hàng để xử lý đơn hàng và hỗ trợ khách hàng.',
      },
      {
        heading: '2. Mục đích sử dụng dữ liệu',
        body: 'Dữ liệu chỉ được dùng để xác nhận đơn hàng, giao hàng, hỗ trợ sau bán hàng và cải thiện trải nghiệm người dùng.',
      },
      {
        heading: '3. Chia sẻ dữ liệu',
        body: 'Chúng tôi không bán hay chia sẻ thông tin cá nhân cho bên thứ ba, trừ khi có yêu cầu hợp pháp từ cơ quan chức năng.',
      },
      {
        heading: '4. Quyền của người dùng',
        body: 'Bạn có quyền yêu cầu xem, sửa hoặc xóa dữ liệu cá nhân bất kỳ lúc nào bằng cách liên hệ email hỗ trợ.',
      },
    ],
  },
} as const;

type PageKey = keyof typeof content;

export default function StaticPage({ page }: { page: PageKey }) {
  const { title, icon: Icon, sections } = content[page];

  return (
    <div className="mx-auto max-w-3xl py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-amber-700 hover:underline dark:text-amber-500"
      >
        <ChevronLeft className="h-4 w-4" />
        Về trang chủ
      </Link>

      <div className="rounded-2xl border border-stone-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-900/30">
            <Icon className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
            {title}
          </h1>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-1.5 font-display text-base font-semibold text-stone-900 dark:text-stone-100">
                {section.heading}
              </h2>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-8 border-t border-stone-200 pt-4 text-xs text-stone-400 dark:border-zinc-700">
          Cập nhật lần cuối: 05/10/2026
        </p>
      </div>
    </div>
  );
}
