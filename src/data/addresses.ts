export const PROVINCES = [
  { value: 'hcm', label: 'Hồ Chí Minh' },
  { value: 'hn', label: 'Hà Nội' },
  { value: 'dn', label: 'Đà Nẵng' },
  { value: 'ct', label: 'Cần Thơ' },
  { value: 'hp', label: 'Hải Phòng' },
  { value: 'bd', label: 'Bình Dương' },
  { value: 'dong-nai', label: 'Đồng Nai' },
  { value: 'long-an', label: 'Long An' },
];

export const DISTRICTS: Record<string, { value: string; label: string }[]> = {
  hcm: [
    { value: 'q1', label: 'Quận 1' },
    { value: 'q3', label: 'Quận 3' },
    { value: 'qbt', label: 'Quận Bình Thạnh' },
    { value: 'qpn', label: 'Quận Phú Nhuận' },
    { value: 'qgv', label: 'Quận Gò Vấp' },
    { value: 'qtb', label: 'Quận Tân Bình' },
    { value: 'q7', label: 'Quận 7' },
  ],
  hn: [
    { value: 'hk', label: 'Hoàn Kiếm' },
    { value: 'cg', label: 'Cầu Giấy' },
    { value: 'bd', label: 'Ba Đình' },
    { value: 'tx', label: 'Thanh Xuân' },
    { value: 'hd', label: 'Hai Bà Trưng' },
  ],
  dn: [
    { value: 'hc', label: 'Hải Châu' },
    { value: 'tk', label: 'Thanh Khê' },
    { value: 'sontra', label: 'Sơn Trà' },
  ],
  ct: [
    { value: 'nin', label: 'Ninh Kiều' },
    { value: 'bth', label: 'Bình Thủy' },
  ],
  hp: [
    { value: 'ls', label: 'Lê Chân' },
    { value: 'ng', label: 'Ngô Quyền' },
  ],
  bd: [
    { value: 'tdm', label: 'Thủ Dầu Một' },
    { value: 'di-an', label: 'Dĩ An' },
  ],
  'dong-nai': [
    { value: 'bh', label: 'Biên Hòa' },
  ],
  'long-an': [
    { value: 'tan-an', label: 'Tân An' },
  ],
};

export const WARDS: Record<string, { value: string; label: string }[]> = {
  q1: [
    { value: 'bn', label: 'Phường Bến Nghé' },
    { value: 'bng', label: 'Phường Bến Thành' },
  ],
  q3: [
    { value: 'p1', label: 'Phường 1' },
    { value: 'p5', label: 'Phường 5' },
  ],
  qbt: [
    { value: 'p25', label: 'Phường 25' },
    { value: 'p26', label: 'Phường 26' },
  ],
  qpn: [{ value: 'p1', label: 'Phường 1' }],
  qgv: [{ value: 'p1', label: 'Phường 1' }],
  qtb: [{ value: 'p1', label: 'Phường 1' }],
  q7: [{ value: 'pmh', label: 'Phường Phú Mỹ Hưng' }],
  hk: [{ value: 'hbc', label: 'Phường Hàng Bạc' }],
  cg: [{ value: 'dm', label: 'Phường Dịch Vọng' }],
  bd: [{ value: 'tg', label: 'Phường Trúc Bạch' }],
  tx: [{ value: 'hn', label: 'Phường Hạ Đình' }],
  hd: [{ value: 'bch', label: 'Phường Bách Khoa' }],
  hc: [{ value: 'tb', label: 'Phường Thạch Bàn' }],
  tk: [{ value: 'tk1', label: 'Phường Thanh Khê Tây' }],
  sontra: [{ value: 'anhtay', label: 'Phường An Hải Tây' }],
  nin: [{ value: 'anhoa', label: 'Phường An Hòa' }],
  bth: [{ value: 'bth', label: 'Phường Bình Thủy' }],
  ls: [{ value: 'p1', label: 'Phường 1' }],
  ng: [{ value: 'p1', label: 'Phường 1' }],
  tdm: [{ value: 'hc', label: 'Phường Hiệp Thành' }],
  'di-an': [{ value: 'da1', label: 'Phường Dĩ An' }],
  bh: [{ value: 'ht', label: 'Phường Hòa Thành' }],
  'tan-an': [{ value: 'p1', label: 'Phường 1' }],
};
