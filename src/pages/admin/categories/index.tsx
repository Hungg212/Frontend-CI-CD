import { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui';
import { useAdminStore } from '@/stores/adminStore';
import { toast } from '@/utils/toast';
import type { AdminCategory } from '@/types/admin';
import CategoryFormModal from './CategoryFormModal';

export default function AdminCategories() {
  const categories = useAdminStore((s) => s.categories);
  const deleteCategory = useAdminStore((s) => s.deleteCategory);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (c: AdminCategory) => {
    setEditing(c);
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteCategory(deleteId);
    toast.success('Đã xóa danh mục');
    setDeleteId(null);
  };

  return (
    <AdminLayout title="Quản Lý Danh Mục" subtitle="Danh sách danh mục sản phẩm">
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-zinc-700">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Tổng cộng <span className="font-semibold text-stone-800 dark:text-stone-100">{categories.length}</span> danh mục
          </p>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Thêm Danh Mục
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-zinc-900/50">
              <tr className="text-left text-xs uppercase text-stone-500 dark:text-stone-400">
                <th className="px-4 py-3 font-semibold">Danh mục</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Mô tả</th>
                <th className="px-4 py-3 font-semibold">Số sản phẩm</th>
                <th className="px-4 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-700">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50 dark:hover:bg-zinc-700/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-stone-100"
                      />
                      <p className="font-medium text-stone-800 dark:text-stone-100">{c.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="px-2 py-1 bg-stone-100 dark:bg-zinc-800 rounded text-xs text-stone-700 dark:text-stone-300">
                      {c.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3 max-w-md">
                    <p className="text-stone-600 dark:text-stone-400 line-clamp-2">{c.description}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-stone-800 dark:text-stone-100">
                    {c.productCount}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg text-stone-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30"
                        aria-label="Sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(c.id)}
                        className="p-1.5 rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                        aria-label="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Tag className="w-12 h-12 mx-auto text-stone-300 mb-2" />
                    <p className="text-stone-500">Chưa có danh mục nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CategoryFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
      />

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Xác nhận xóa"
        size="sm"
      >
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
          Bạn có chắc chắn muốn xóa danh mục này? Hành động không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
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
