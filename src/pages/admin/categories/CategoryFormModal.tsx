import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui';
import { Input } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Button } from '@/components/ui';
import { useAdminStore } from '@/stores/adminStore';
import { slugify } from '@/utils/adminFormat';
import { toast } from '@/utils/toast';
import type { AdminCategory } from '@/types/admin';

const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự').max(80),
  slug: z.string().min(2, 'Slug là bắt buộc').max(120),
  description: z.string().min(5, 'Mô tả phải có ít nhất 5 ký tự').max(280),
  image: z.string().url('Vui lòng nhập URL hợp lệ'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initial?: AdminCategory;
}

export function CategoryFormModal({ isOpen, onClose, initial }: CategoryFormModalProps) {
  const addCategory = useAdminStore((s) => s.addCategory);
  const updateCategory = useAdminStore((s) => s.updateCategory);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initial?.name ?? '',
      slug: initial?.slug ?? '',
      description: initial?.description ?? '',
      image: initial?.image ?? '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initial?.name ?? '',
        slug: initial?.slug ?? '',
        description: initial?.description ?? '',
        image: initial?.image ?? '',
      });
    }
  }, [isOpen, initial, reset]);

  const watchedName = watch('name');

  useEffect(() => {
    if (watchedName && !initial) {
      setValue('slug', slugify(watchedName));
    }
  }, [watchedName, initial, setValue]);

  const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
    await new Promise((r) => setTimeout(r, 200));
    if (initial) {
      updateCategory(initial.id, data);
      toast.success('Đã cập nhật danh mục');
    } else {
      addCategory(data);
      toast.success('Đã tạo danh mục mới');
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Tên danh mục"
          {...register('name')}
          error={errors.name?.message}
          placeholder="VD: Cà Phê Hạt"
        />
        <Input
          label="Slug"
          {...register('slug')}
          error={errors.slug?.message}
          helperText="Tự sinh từ tên, có thể chỉnh sửa"
          onChange={(e) => setValue('slug', slugify(e.target.value), { shouldValidate: true })}
        />
        <Textarea
          label="Mô tả"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Mô tả ngắn cho danh mục..."
        />
        <Input
          label="URL hình ảnh"
          {...register('image')}
          error={errors.image?.message}
          placeholder="https://..."
          helperText="Sử dụng URL hình ảnh đại diện"
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initial ? 'Cập nhật' : 'Tạo danh mục'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CategoryFormModal;
