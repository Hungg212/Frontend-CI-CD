import { Navigate, useParams } from 'react-router-dom';
import ProductForm from '@/components/admin/ProductForm';
import { useAdminStore } from '@/stores/adminStore';

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const product = useAdminStore((s) => s.products.find((p) => p.id === id));

  if (!product) {
    return <Navigate to="/admin/products" replace />;
  }

  return <ProductForm mode="edit" initial={product} />;
}
