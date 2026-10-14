import React from 'react';
import { MapPin, Home, Building2, MapPinned } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export interface Province {
  code: string;
  name: string;
  districts: District[];
}
export interface District {
  code: string;
  name: string;
  wards: Ward[];
}
export interface Ward {
  code: string;
  name: string;
}

export const PROVINCES_DATA: Province[] = [
  {
    code: 'HCM',
    name: 'TP. Hồ Chí Minh',
    districts: [
      {
        code: 'Q1',
        name: 'Quận 1',
        wards: [
          { code: 'P1', name: 'Phường Bến Nghé' },
          { code: 'P2', name: 'Phường Bến Thành' },
          { code: 'P3', name: 'Phường Đa Kao' },
        ],
      },
      {
        code: 'Q3',
        name: 'Quận 3',
        wards: [
          { code: 'P4', name: 'Phường 1' },
          { code: 'P5', name: 'Phường 2' },
        ],
      },
      {
        code: 'BT',
        name: 'Quận Bình Thạnh',
        wards: [
          { code: 'P6', name: 'Phường 1' },
          { code: 'P7', name: 'Phường 2' },
        ],
      },
    ],
  },
  {
    code: 'HN',
    name: 'Hà Nội',
    districts: [
      {
        code: 'HK',
        name: 'Quận Hoàn Kiếm',
        wards: [
          { code: 'P8', name: 'Phường Hàng Bài' },
          { code: 'P9', name: 'Phường Tràng Tiền' },
        ],
      },
      {
        code: 'CG',
        name: 'Quận Cầu Giấy',
        wards: [
          { code: 'P10', name: 'Phường Quan Hoa' },
          { code: 'P11', name: 'Phường Yên Hòa' },
        ],
      },
    ],
  },
  {
    code: 'DN',
    name: 'Đà Nẵng',
    districts: [
      {
        code: 'HC',
        name: 'Quận Hải Châu',
        wards: [
          { code: 'P12', name: 'Phường Thanh Bình' },
          { code: 'P13', name: 'Phường Bình Hiên' },
        ],
      },
    ],
  },
];

export interface AddressFormData {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  saveAddress?: boolean;
}

export interface AddressFormProps {
  values: AddressFormData;
  errors?: Partial<Record<keyof AddressFormData, string>>;
  onChange: (field: keyof AddressFormData, value: string | boolean) => void;
  showSaveOption?: boolean;
  className?: string;
}

const labelIcons = {
  fullName: <Home className="h-4 w-4" />,
  province: <MapPin className="h-4 w-4" />,
  district: <MapPinned className="h-4 w-4" />,
  ward: <Building2 className="h-4 w-4" />,
};

export function AddressForm({
  values,
  errors = {},
  onChange,
  showSaveOption = false,
  className = '',
}: AddressFormProps) {
  const selectedProvince = PROVINCES_DATA.find((p) => p.code === values.province);
  const districts = selectedProvince?.districts || [];
  const selectedDistrict = districts.find((d) => d.code === values.district);
  const wards = selectedDistrict?.wards || [];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Họ và tên"
          value={values.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          error={errors.fullName}
          leftIcon={labelIcons.fullName}
          placeholder="Nguyễn Văn A"
          required
          autoComplete="name"
        />
        <Input
          label="Số điện thoại"
          type="text"
          inputMode="tel"
          value={values.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="0901234567"
          required
          autoComplete="tel"
        />
      </div>

      <Input
        label="Email"
        type="email"
        value={values.email}
        onChange={(e) => onChange('email', e.target.value)}
        error={errors.email}
        placeholder="email@example.com"
        required
        autoComplete="email"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Select
          label="Tỉnh / Thành phố"
          value={values.province}
          onChange={(e) => {
            onChange('province', e.target.value);
            onChange('district', '');
            onChange('ward', '');
          }}
          options={PROVINCES_DATA.map((p) => ({ value: p.code, label: p.name }))}
          placeholder="Chọn tỉnh / thành phố"
          error={errors.province}
          required
        />
        <Select
          label="Quận / Huyện"
          value={values.district}
          onChange={(e) => {
            onChange('district', e.target.value);
            onChange('ward', '');
          }}
          options={districts.map((d) => ({ value: d.code, label: d.name }))}
          placeholder="Chọn quận / huyện"
          error={errors.district}
          disabled={!values.province}
          required
        />
        <Select
          label="Phường / Xã"
          value={values.ward}
          onChange={(e) => onChange('ward', e.target.value)}
          options={wards.map((w) => ({ value: w.code, label: w.name }))}
          placeholder="Chọn phường / xã"
          error={errors.ward}
          disabled={!values.district}
          required
        />
      </div>

      <Input
        label="Địa chỉ chi tiết"
        value={values.detail}
        onChange={(e) => onChange('detail', e.target.value)}
        error={errors.detail}
        placeholder="Số nhà, tên đường, tòa nhà..."
        required
      />

      {showSaveOption && (
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={!!values.saveAddress}
            onChange={(e) => onChange('saveAddress', e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm text-stone-700 dark:text-stone-200">
            Lưu địa chỉ này cho lần sau
          </span>
        </label>
      )}
    </div>
  );
}

export default AddressForm;
