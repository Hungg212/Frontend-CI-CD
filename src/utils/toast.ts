/**
 * Lightweight global toast helper. The actual UI lives in
 * `@/components/common/ToastContainer`, which subscribes to a global
 * event channel. This module re-exports the same API as a convenient
 * import path.
 */
import { toast as containerToast } from '@/components/common/ToastContainer';

export const toast = containerToast;
export type { Toast, ToastType } from '@/components/common/ToastContainer';
export { default as ToastContainer } from '@/components/common/ToastContainer';

export default toast;
