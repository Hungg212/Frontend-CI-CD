import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Input } from '@/components/ui';
import { Select } from '@/components/ui';
import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';
import { useAdminStore } from '@/stores/adminStore';
import { formatVND } from '@/utils/adminFormat';
import { cn } from '@/utils/cn';
import type { Product } from '@/types';

const ITEMS_PER_PAGE = 8;

export default function AdminProducts() {
  const navigate = useNavigate();
  const products = useAdminStore((s) => s.products);
  const categories = useAdminStore((s) => s.categories);
  const deleteProduct = useAdminStore((s) => s.deleteProduct);
  const deleteProducts = useAdminStore((s) => s.deleteProducts);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ ids: string[]; isBulk: boolean } | null>(null);

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả danh mục' },
      ...categories.map((c) => ({ value: c.slug, label: c.name })),
    ],
    [categories]
  );

  const stockOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'in-stock', label: 'Còn hàng' },
    { value: 'low-stock', label: 'Sắp hết' },
    { value: 'out-stock', label: 'Hết hàng' },
  ];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (categoryFilter && p.categorySlug !== categoryFilter) return false;
      if (stockFilter === 'in-stock' && p.stock <= 10) return false;
      if (stockFilter === 'low-stock' && (p.stock === 0 || p.stock > 10)) return false;
      if (stockFilter === 'out-stock' && p.stock > 0) return false;
      return true;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const allSelected = pageItems.length > 0 && pageItems.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageItems.some((p) => p.id === id)));
    } else {
      const ids = pageItems.map((p) => p.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDelete = (ids: string[], isBulk = false) => setDeleteModal({ ids, isBulk });

  const confirmDelete = () => {
    if (!deleteModal) return;
    if (deleteModal.isBulk) {
      deleteProducts(deleteModal.ids);
    } else {
      deleteModal.ids.forEach((id) => deleteProduct(id));
    }
    setSelectedIds((prev) => prev.filter((id) => !deleteModal.ids.includes(id)));
    setDeleteModal(null);
  };

  const getStockBadge = (product: Product) => {
    if (product.stock === 0)
      return (
        <Badge variant="danger" size="sm">
          Hết hàng
        </Badge>
      );
    if (product.stock <= 10)
      return (
        <Badge variant="warning" size="sm">
          Sắp hết
        </Badge>
      );
    return (
      <Badge variant="success" size="sm">
        Còn hàng
      </Badge>
    );
  };

  return (
    <AdminLayout title="Quản Lý Sản Phẩm" subtitle="Danh sách sản phẩm trong cửa hàng">
      <Card className="overflow-hidden p-0">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-stone-200 p-4 lg:flex-row dark:border-zinc-700">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              type="search"
              placeholder="Tìm theo tên, SKU, mô tả..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            />
            <Select
              options={stockOptions}
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button
                variant="danger"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() => handleDelete(selectedIds, true)}
              >
                Xóa ({selectedIds.length})
              </Button>
            )}
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/admin/products/create')}
            >
              Thêm Sản Phẩm Mới
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-zinc-900/50">
              <tr className="text-left text-xs uppercase text-stone-500 dark:text-stone-400">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 accent-amber-700"
                    aria-label="Chọn tất cả"
                  />
                </th>
                <th className="px-4 py-3 font-semibold">Sản phẩm</th>
                <th className="px-4 py-3 font-semibold">Danh mục</th>
                <th className="px-4 py-3 font-semibold">Giá</th>
                <th className="px-4 py-3 font-semibold">Tồn kho</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-700">
              {pageItems.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <tr
                    key={p.id}
                    className={cn(
                      'hover:bg-stone-50 dark:hover:bg-zinc-700/30',
                      isSelected && 'bg-amber-50/50 dark:bg-amber-900/10'
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(p.id)}
                        className="h-4 w-4 accent-amber-700"
                        aria-label={`Chọn ${p.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-12 w-12 flex-shrink-0 rounded-lg bg-stone-100 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="max-w-xs truncate font-medium text-stone-800 dark:text-stone-100">
                            {p.name}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">SKU: {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-700 dark:text-stone-300">{p.category}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-stone-800 dark:text-stone-100">
                        {formatVND(p.salePrice ?? p.price)}
                      </p>
                      {p.salePrice && (
                        <p className="text-xs text-stone-400 line-through">{formatVND(p.price)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-700 dark:text-stone-300">
                      <span
                        className={cn(
                          'font-medium',
                          p.stock === 0 && 'text-red-600',
                          p.stock > 0 && p.stock <= 10 && 'text-amber-600'
                        )}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {getStockBadge(p)}
                        {p.isFeatured && (
                          <Badge variant="info" size="sm">
                            Nổi bật
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/products/${p.slug}`)}
                          className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-amber-700 dark:hover:bg-zinc-700"
                          aria-label="Xem"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                          className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-blue-600 dark:hover:bg-zinc-700"
                          aria-label="Sửa"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete([p.id])}
                          className="rounded-lg p-1.5 text-stone-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                          aria-label="Xóa"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Package className="mx-auto mb-2 h-12 w-12 text-stone-300 dark:text-zinc-600" />
                    <p className="text-stone-500 dark:text-stone-400">Không có sản phẩm nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-stone-200 px-4 py-3 sm:flex-row dark:border-zinc-700">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Hiển thị {(page - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(page * ITEMS_PER_PAGE, filtered.length)} / {filtered.length} sản phẩm
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Trước
            </Button>
            <span className="text-sm text-stone-700 dark:text-stone-300">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Sau
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-stone-900 px-5 py-3 text-white shadow-xl">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Đã chọn {selectedIds.length} sản phẩm</span>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-sm text-stone-300 underline hover:text-white"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Xác nhận xóa"
        description={
          deleteModal?.isBulk
            ? `Bạn có chắc chắn muốn xóa ${deleteModal.ids.length} sản phẩm đã chọn?`
            : 'Bạn có chắc chắn muốn xóa sản phẩm này?'
        }
        size="sm"
      >
        <p className="mb-4 text-sm text-stone-600 dark:text-stone-400">
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Xóa
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
