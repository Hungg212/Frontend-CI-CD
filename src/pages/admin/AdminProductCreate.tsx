import AdminProductEdit from './AdminProductEdit';

/**
 * Route /admin/products/create
 * The form component detects the absence of an `:id` route param and runs in create mode.
 */
export default function AdminProductCreate() {
  return <AdminProductEdit />;
}
