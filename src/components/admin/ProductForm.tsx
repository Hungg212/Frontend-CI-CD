import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  X,
  Upload,
  Trash2,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui';
import { Input } from '@/components/ui';
import { Select } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Button } from '@/components/ui';
import { useAdminStore } from '@/stores/adminStore';
import { slugify } from '@/utils/adminFormat';
import { toast } from '@/utils/toast';
import type { Product } from '@/types';

const productSchema = z.object({
  name: z.string().min(3, 'Tên phải có ít nhất 3 ký tự').max(120),
  slug: z.string().min(3, 'Slug là bắt buộc').max(160),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  categoryName: z.string().min(1),
  categorySlug: z.string().min(1),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  shortDescription: z.string().min(5, 'Mô tả ngắn phải có ít nhất 5 ký tự'),
  price: z.coerce.number().positive('Giá phải lớn hơn 0'),
  salePrice: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0, 'Tồn kho không được âm'),
  sku: z.string().min(2, 'SKU phải có ít nhất 2 ký tự'),
  origin: z.string().min(1, 'Vui lòng nhập vùng trồng'),
  roastLevel: z.enum(['Light', 'Medium', 'Medium-Dark', 'Dark']),
  flavorNotesInput: z.string(),
  brewingMethodsInput: z.string(),
  weight: z.string().min(1, 'Vui lòng nhập khối lượng'),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  isBestSeller: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initial?: Product;
  mode: 'create' | 'edit';
}

const roastOptions = [
  { value: 'Light', label: 'Nhạt' },
  { value: 'Medium', label: 'Vừa' },
  { value: 'Medium-Dark', label: 'Vừa đậm' },
  { value: 'Dark', label: 'Đậm' },
];

export function ProductForm({ initial, mode }: ProductFormProps) {
  const navigate = useNavigate();
  const categories = useAdminStore((s) => s.categories);
  const addProduct = useAdminStore((s) => s.addProduct);
  const updateProduct = useAdminStore((s) => s.updateProduct);
  const deleteProduct = useAdminStore((s) => s.deleteProduct);

  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          slug: initial.slug,
          categoryId: categories.find((c) => c.slug === initial.categorySlug)?.id ?? '',
          categoryName: initial.category,
          categorySlug: initial.categorySlug,
          description: initial.description,
          shortDescription: initial.shortDescription,
          price: initial.price,
          salePrice: initial.salePrice,
          stock: initial.stock,
          sku: initial.sku,
          origin: initial.origin,
          roastLevel: initial.roastLevel,
          flavorNotesInput: initial.flavorNotes.join(', '),
          brewingMethodsInput: initial.brewingMethod.join(', '),
          weight: initial.weight,
          isFeatured: initial.isFeatured,
          isNewArrival: initial.isNewArrival,
          isBestSeller: initial.isBestSeller,
        }
      : {
          name: '',
          slug: '',
          categoryId: '',
          categoryName: '',
          categorySlug: '',
          description: '',
          shortDescription: '',
          price: 0,
          salePrice: undefined,
          stock: 0,
          sku: '',
          origin: '',
          roastLevel: 'Medium',
          flavorNotesInput: '',
          brewingMethodsInput: '',
          weight: '500g',
          isFeatured: false,
          isNewArrival: false,
          isBestSeller: false,
        },
  });

  const watchedName = watch('name');

  const handleNameBlur = () => {
    if (!watch('slug') && watchedName) {
      setValue('slug', slugify(watchedName), { shouldValidate: true });
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (cat) {
      setValue('categoryName', cat.name);
      setValue('categorySlug', cat.slug);
    }
  };

  const handleAddImage = () => {
    const url = imageUrl.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setImageUrl('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      const flavorNotes = data.flavorNotesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const brewingMethods = data.brewingMethodsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (mode === 'create') {
        const newProduct: Product = {
          id: `p-${Date.now()}`,
          name: data.name,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription,
          price: data.price,
          salePrice: data.salePrice || undefined,
          category: data.categoryName,
          categorySlug: data.categorySlug,
          images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400'],
          rating: 0,
          reviewCount: 0,
          stock: data.stock,
          sku: data.sku,
          tags: [],
          origin: data.origin,
          roastLevel: data.roastLevel,
          flavorNotes: flavorNotes.length > 0 ? flavorNotes : ['Đậm đà'],
          brewingMethod: brewingMethods.length > 0 ? brewingMethods : ['Pha Phin'],
          weight: data.weight,
          isFeatured: data.isFeatured,
          isNewArrival: data.isNewArrival,
          isBestSeller: data.isBestSeller,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addProduct(newProduct);
        toast.success('Đã tạo sản phẩm mới');
      } else if (initial) {
        updateProduct(initial.id, {
          name: data.name,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription,
          price: data.price,
          salePrice: data.salePrice || undefined,
          category: data.categoryName,
          categorySlug: data.categorySlug,
          images: images.length > 0 ? images : initial.images,
          stock: data.stock,
          sku: data.sku,
          origin: data.origin,
          roastLevel: data.roastLevel,
          flavorNotes: flavorNotes.length > 0 ? flavorNotes : initial.flavorNotes,
          brewingMethod: brewingMethods.length > 0 ? brewingMethods : initial.brewingMethod,
          weight: data.weight,
          isFeatured: data.isFeatured,
          isNewArrival: data.isNewArrival,
          isBestSeller: data.isBestSeller,
        });
        toast.success('Đã cập nhật sản phẩm');
      }
      navigate('/admin/products');
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!initial) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      deleteProduct(initial.id);
      toast.success('Đã xóa sản phẩm');
      navigate('/admin/products');
    }
  };

  const categoryOptions = [
    { value: '', label: '-- Chọn danh mục --' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <AdminLayout
      title={mode === 'create' ? 'Thêm Sản Phẩm Mới' : `Chỉnh sửa: ${initial?.name ?? ''}`}
      subtitle={mode === 'create' ? 'Tạo sản phẩm mới cho cửa hàng' : 'Cập nhật thông tin sản phẩm'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/admin/products')}
          >
            Quay lại
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {mode === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic info */}
            <Card className="p-5">
              <h2 className="font-semibold text-stone-800 dark:text-stone-100 mb-4">
                Thông Tin Cơ Bản
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tên sản phẩm"
                  {...register('name')}
                  onBlur={handleNameBlur}
                  error={errors.name?.message}
                />
                <Input
                  label="Slug"
                  {...register('slug')}
                  onChange={(e) =>
                    setValue('slug', slugify(e.target.value), { shouldValidate: true })
                  }
                  error={errors.slug?.message}
                  helperText="Tự động tạo từ tên, có thể chỉnh sửa"
                />
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      label="Danh mục"
                      options={categoryOptions}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        handleCategoryChange(e.target.value);
                      }}
                      error={errors.categoryId?.message}
                    />
                  )}
                />
                <Input
                  label="Khối lượng"
                  {...register('weight')}
                  error={errors.weight?.message}
                  helperText="VD: 500g, 1kg"
                />
                <div className="md:col-span-2">
                  <Textarea
                    label="Mô tả ngắn"
                    {...register('shortDescription')}
                    error={errors.shortDescription?.message}
                    helperText="Hiển thị trong danh sách sản phẩm"
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    label="Mô tả chi tiết"
                    {...register('description')}
                    error={errors.description?.message}
                    rows={5}
                  />
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card className="p-5">
              <h2 className="font-semibold text-stone-800 dark:text-stone-100 mb-4">Hình Ảnh</h2>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Input
                  placeholder="Dán URL hình ảnh..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImage();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddImage} leftIcon={<Plus className="w-4 h-4" />}>
                  Thêm URL
                </Button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                    Tải lên từ máy
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="text-xs text-stone-500">PNG, JPG, tối đa 5MB</p>
              </div>

              {images.length === 0 ? (
                <div className="border-2 border-dashed border-stone-200 dark:border-zinc-700 rounded-lg p-8 text-center">
                  <ImageIcon className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm text-stone-500">Chưa có hình ảnh nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {images.map((src, idx) => (
                    <div
                      key={`${idx}-${src.slice(0, 20)}`}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-stone-200 dark:border-zinc-700 bg-stone-100"
                    >
                      <img
                        src={src}
                        alt={`Hình ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Xóa hình"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 text-xs bg-amber-700 text-white rounded">
                          Chính
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Price & stock */}
            <Card className="p-5">
              <h2 className="font-semibold text-stone-800 dark:text-stone-100 mb-4">Giá & Kho</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Giá bán (VND)"
                  {...register('price')}
                  error={errors.price?.message}
                />
                <Input
                  type="number"
                  label="Giá khuyến mãi (VND)"
                  {...register('salePrice')}
                  error={errors.salePrice?.message}
                  helperText="Để trống nếu không giảm giá"
                />
                <Input
                  type="number"
                  label="Tồn kho"
                  {...register('stock')}
                  error={errors.stock?.message}
                />
                <Input
                  label="SKU"
                  {...register('sku')}
                  error={errors.sku?.message}
                  helperText="Mã định danh sản phẩm"
                />
              </div>
            </Card>

            {/* Coffee info */}
            <Card className="p-5">
              <h2 className="font-semibold text-stone-800 dark:text-stone-100 mb-4">
                Thông Tin Cà Phê
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Vùng trồng (Origin)"
                  {...register('origin')}
                  error={errors.origin?.message}
                  placeholder="VD: Đà Lạt - Cầu Đất"
                />
                <Controller
                  control={control}
                  name="roastLevel"
                  render={({ field }) => (
                    <Select
                      label="Mức rang"
                      options={roastOptions}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Input
                  label="Hương vị (phân cách bằng dấu phẩy)"
                  {...register('flavorNotesInput')}
                  error={errors.flavorNotesInput?.message}
                  placeholder="Chua thanh, Hậu ngọt, Citrus"
                  helperText="VD: Chua thanh, Hậu ngọt, Socola"
                />
                <Input
                  label="Phương pháp pha (phân cách bằng dấu phẩy)"
                  {...register('brewingMethodsInput')}
                  error={errors.brewingMethodsInput?.message}
                  placeholder="Espresso, Pour Over, Pha Phin"
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Status toggles */}
            <Card className="p-5">
              <h2 className="font-semibold text-stone-800 dark:text-stone-100 mb-4">Trạng Thái</h2>
              <div className="space-y-3">
                <Controller
                  control={control}
                  name="isFeatured"
                  render={({ field }) => (
                    <ToggleField
                      label="Sản phẩm nổi bật"
                      description="Hiển thị trong danh sách nổi bật"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="isNewArrival"
                  render={({ field }) => (
                    <ToggleField
                      label="Sản phẩm mới"
                      description="Hiển thị trong danh sách hàng mới về"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="isBestSeller"
                  render={({ field }) => (
                    <ToggleField
                      label="Bán chạy"
                      description="Hiển thị trong danh sách bán chạy"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </Card>

            {mode === 'edit' && initial && (
              <Card className="p-5">
                <h2 className="font-semibold text-stone-800 dark:text-stone-100 mb-2">
                  Thông tin
                </h2>
                <dl className="text-sm space-y-1 text-stone-600 dark:text-stone-400">
                  <div className="flex justify-between">
                    <dt>Ngày tạo:</dt>
                    <dd className="font-medium">{initial.createdAt}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Cập nhật:</dt>
                    <dd className="font-medium">{initial.updatedAt}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Đánh giá:</dt>
                    <dd className="font-medium">{initial.rating} ⭐ ({initial.reviewCount})</dd>
                  </div>
                </dl>
                <Button
                  type="button"
                  variant="danger"
                  fullWidth
                  className="mt-4"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  onClick={handleDelete}
                >
                  Xóa sản phẩm
                </Button>
              </Card>
            )}
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  return (
    <label className="flex items-start justify-between gap-3 cursor-pointer p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-700/40">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{label}</p>
        {description && (
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          checked ? 'bg-amber-700' : 'bg-stone-300 dark:bg-zinc-600'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
}

export default ProductForm;
