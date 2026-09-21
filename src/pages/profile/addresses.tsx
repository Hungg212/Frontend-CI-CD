import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Edit3,
  Trash2,
  ChevronRight,
  Home as HomeIcon,
  Briefcase,
  MapPin,
  CheckCircle2,
  Phone,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { PROVINCES, DISTRICTS, WARDS } from '@/data/addresses';
import type { Address } from '@/types';

const addressSchema = z.object({
  label: z.enum(['home', 'office', 'other']),
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ'),
  province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
  ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
  detail: z.string().min(5, 'Địa chỉ chi tiết phải có ít nhất 5 ký tự'),
});
type AddressFormData = z.infer<typeof addressSchema>;

const labelIcon: Record<Address['label'], React.ReactNode> = {
  home: <HomeIcon className="h-4 w-4" />,
  office: <Briefcase className="h-4 w-4" />,
  other: <MapPin className="h-4 w-4" />,
};

const labelText: Record<Address['label'], string> = {
  home: 'Nhà riêng',
  office: 'Văn phòng',
  other: 'Khác',
};

const AddressFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initial?: Address | null;
  onSubmit: (data: AddressFormData) => Promise<void>;
}> = ({ isOpen, onClose, initial, onSubmit }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initial
      ? {
          label: initial.label,
          name: initial.name,
          phone: initial.phone,
          province: '',
          district: '',
          ward: '',
          detail: initial.detail,
        }
      : { label: 'home' },
  });

  const province = watch('province');
  const district = watch('district');
  const districtOptions = province ? DISTRICTS[province] || [] : [];
  const wardOptions = district ? WARDS[district] || [] : [];

  React.useEffect(() => {
    if (isOpen) {
      reset(
        initial
          ? {
              label: initial.label,
              name: initial.name,
              phone: initial.phone,
              province: '',
              district: '',
              ward: '',
              detail: initial.detail,
            }
          : { label: 'home', name: '', phone: '', province: '', district: '', ward: '', detail: '' }
      );
    }
  }, [isOpen, initial, reset]);

  const handleFormSubmit = async (data: AddressFormData) => {
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Họ và tên *" {...register('name')} error={errors.name?.message} />
          <Input
            label="Số điện thoại *"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-200">
            Loại địa chỉ
          </label>
          <div className="flex flex-wrap gap-2">
            {(['home', 'office', 'other'] as const).map((l) => (
              <label
                key={l}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 hover:bg-stone-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
              >
                <input
                  type="radio"
                  value={l}
                  {...register('label')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span className="inline-flex items-center gap-1 text-sm">
                  {labelIcon[l]} {labelText[l]}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            label="Tỉnh/Thành phố *"
            {...register('province')}
            error={errors.province?.message}
            options={PROVINCES}
            placeholder="Chọn"
            onChange={(e) => {
              setValue('province', e.target.value);
              setValue('district', '');
              setValue('ward', '');
            }}
          />
          <Select
            label="Quận/Huyện *"
            {...register('district')}
            error={errors.district?.message}
            options={districtOptions}
            placeholder="Chọn"
            disabled={!province}
            onChange={(e) => {
              setValue('district', e.target.value);
              setValue('ward', '');
            }}
          />
          <Select
            label="Phường/Xã *"
            {...register('ward')}
            error={errors.ward?.message}
            options={wardOptions}
            placeholder="Chọn"
            disabled={!district}
          />
        </div>
        <Input
          label="Địa chỉ chi tiết *"
          {...register('detail')}
          error={errors.detail?.message}
          placeholder="Số nhà, tên đường..."
        />
        <div className="flex justify-end gap-2 border-t border-stone-200 pt-3 dark:border-zinc-700">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            leftIcon={isSubmitting ? <Loader2 className="h-4 w-4" /> : undefined}
          >
            {initial ? 'Cập nhật' : 'Thêm'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const AddressesPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addAddress = useAuthStore((s) => s.addAddress);
  const updateAddress = useAuthStore((s) => s.updateAddress);
  const removeAddress = useAuthStore((s) => s.removeAddress);
  const setDefaultAddress = useAuthStore((s) => s.setDefaultAddress);
  const pushNotification = useUIStore((s) => s.pushNotification);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  const handleOpenAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditing(addr);
    setModalOpen(true);
  };

  const handleSubmit = async (data: AddressFormData) => {
    await new Promise((r) => setTimeout(r, 400));
    const provinceLabel = PROVINCES.find((p) => p.value === data.province)?.label ?? data.province;
    const districtLabel =
      DISTRICTS[data.province]?.find((d) => d.value === data.district)?.label ?? data.district;
    const wardLabel = WARDS[data.district]?.find((w) => w.value === data.ward)?.label ?? data.ward;

    if (editing) {
      updateAddress(editing.id, {
        ...data,
        province: provinceLabel,
        district: districtLabel,
        ward: wardLabel,
      });
      pushNotification({
        type: 'success',
        title: 'Đã cập nhật',
        message: 'Địa chỉ đã được cập nhật.',
      });
    } else {
      addAddress({
        id: `addr-${Date.now()}`,
        ...data,
        province: provinceLabel,
        district: districtLabel,
        ward: wardLabel,
        isDefault: user.addresses.length === 0,
      });
      pushNotification({ type: 'success', title: 'Đã thêm', message: 'Địa chỉ mới đã được thêm.' });
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      removeAddress(deleteId);
      pushNotification({ type: 'info', title: 'Đã xóa', message: 'Địa chỉ đã được xóa.' });
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-2 flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
          <Link to="/" className="hover:text-amber-700 dark:hover:text-amber-500">
            Trang chủ
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/profile" className="hover:text-amber-700 dark:hover:text-amber-500">
            Tài khoản
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-stone-700 dark:text-stone-200">Sổ địa chỉ</span>
        </nav>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Sổ Địa Chỉ</h1>
            <p className="mt-1 text-stone-600 dark:text-stone-400">
              Quản lý địa chỉ giao hàng của bạn
            </p>
          </div>
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={handleOpenAdd}>
            Thêm địa chỉ
          </Button>
        </div>

        {user.addresses.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="flex flex-col items-center py-8">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <MapPin className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
                Chưa có địa chỉ nào
              </h2>
              <p className="mb-4 text-stone-600 dark:text-stone-400">
                Thêm địa chỉ giao hàng để thanh toán nhanh hơn
              </p>
              <Button
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={handleOpenAdd}
              >
                Thêm địa chỉ đầu tiên
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {user.addresses.map((addr) => (
              <Card key={addr.id} padding="md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500">
                      {labelIcon[addr.label]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-stone-800 dark:text-stone-100">
                          {addr.name}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:bg-zinc-700 dark:text-stone-300">
                          {labelText[addr.label]}
                        </span>
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400">
                        <Phone className="h-3.5 w-3.5" /> {addr.phone}
                      </p>
                      <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">
                        {addr.detail}, {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefaultAddress(addr.id)}
                        className="px-2 py-1 text-xs text-stone-500 hover:text-amber-700 dark:hover:text-amber-500"
                      >
                        Đặt mặc định
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(addr)}
                      className="p-2 text-stone-500 hover:text-amber-700 dark:hover:text-amber-500"
                      aria-label="Chỉnh sửa"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(addr.id)}
                      className="p-2 text-stone-500 hover:text-red-500"
                      aria-label="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddressFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Xóa địa chỉ" size="sm">
        <p className="mb-4 text-stone-700 dark:text-stone-300">
          Bạn có chắc chắn muốn xóa địa chỉ này không?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteId(null)} disabled={deleting}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleting}
            disabled={deleting}
            leftIcon={deleting ? <Loader2 className="h-4 w-4" /> : undefined}
          >
            Xóa
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AddressesPage;
