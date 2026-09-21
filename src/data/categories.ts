import type { Category } from '../types';

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Cà phê hạt',
    slug: 'ca-phe-hat',
    description: 'Cà phê hạt nguyên chất được rang xay thủ công, giữ trọn hương vị tươi ngon',
    image: 'https://picsum.photos/seed/coffee-beans/600/400',
    productCount: 8,
  },
  {
    id: 'cat-2',
    name: 'Cà phê xay',
    slug: 'ca-phe-xay',
    description: 'Cà phê đã được xay sẵn với nhiều mức độ mịn phù hợp cho từng phương pháp pha',
    image: 'https://picsum.photos/seed/ground-coffee/600/400',
    productCount: 6,
  },
  {
    id: 'cat-3',
    name: 'Cà phê gói',
    slug: 'ca-phe-goi',
    description: 'Cà phê hòa tan tiện lợi, phù hợp cho văn phòng và mang theo',
    image: 'https://picsum.photos/seed/instant-coffee/600/400',
    productCount: 4,
  },
  {
    id: 'cat-4',
    name: 'Cà phê rang mộc',
    slug: 'ca-phe-rang-moc',
    description: 'Cà phê rang mộc truyền thống, không tẩm ướp, giữ nguyên vị cà phê thuần khiết',
    image: 'https://picsum.photos/seed/roasted-coffee/600/400',
    productCount: 5,
  },
  {
    id: 'cat-5',
    name: 'Phụ kiện',
    slug: 'phu-kien',
    description: 'Phụ kiện pha cà phê chất lượng cao: phin, ấm, ly, máy xay',
    image: 'https://picsum.photos/seed/coffee-accessories/600/400',
    productCount: 3,
  },
  {
    id: 'cat-6',
    name: 'Quà tặng',
    slug: 'qua-tang',
    description: 'Hộp quà cà phê sang trọng, ý nghĩa cho người thân và đối tác',
    image: 'https://picsum.photos/seed/coffee-gift/600/400',
    productCount: 2,
  },
];

export const getCategoryBySlug = (slug: string): Category | undefined =>
  categories.find((c) => c.slug === slug);

export const getCategoryById = (id: string): Category | undefined =>
  categories.find((c) => c.id === id);
