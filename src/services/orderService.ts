import type {
  Order,
  OrderStatus,
  CreateOrderData,
  CreateReviewData,
  Review,
} from '../types';
import { orders as mockOrders } from '../data/orders';
import { generateId, generateOrderNumber } from '../utils/formatters';

const simulateDelay = (ms: number = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const orderService = {
  async createOrder(data: CreateOrderData): Promise<Order> {
    await simulateDelay(500);

    const now = new Date().toISOString();
    const subtotal = data.items.reduce((sum, item) => {
      const price = item.product.salePrice ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const newOrder: Order = {
      id: generateId('order'),
      orderNumber: generateOrderNumber(),
      items: data.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.product.salePrice ?? item.product.price,
      })),
      subtotal,
      shippingFee: subtotal >= 500000 ? 0 : 30000,
      discount: 0,
      total: subtotal + (subtotal >= 500000 ? 0 : 30000),
      status: 'PENDING',
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      shippingAddress: data.shippingAddress,
      note: data.note,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: 'PENDING',
          timestamp: now,
          note: 'Đơn hàng được tạo',
        },
      ],
    };

    return newOrder;
  },

  async getOrders(): Promise<Order[]> {
    await simulateDelay();
    return mockOrders;
  },

  async getOrderById(id: string): Promise<Order> {
    await simulateDelay(200);
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error(`Không tìm thấy đơn hàng: ${id}`);
    return order;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    await simulateDelay(300);
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error(`Không tìm thấy đơn hàng: ${id}`);

    const now = new Date().toISOString();
    return {
      ...order,
      status,
      updatedAt: now,
      timeline: [
        ...order.timeline,
        { status, timestamp: now, note: `Cập nhật trạng thái: ${status}` },
      ],
    };
  },

  async cancelOrder(id: string): Promise<Order> {
    await simulateDelay(300);
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error(`Không tìm thấy đơn hàng: ${id}`);

    const now = new Date().toISOString();
    return {
      ...order,
      status: 'CANCELLED',
      updatedAt: now,
      paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : order.paymentStatus,
      timeline: [
        ...order.timeline,
        {
          status: 'CANCELLED',
          timestamp: now,
          note: 'Đơn hàng đã bị hủy',
        },
      ],
    };
  },

  async addReview(orderId: string, review: CreateReviewData): Promise<Review> {
    await simulateDelay(400);

    return {
      id: generateId('review'),
      userId: 'current-user',
      userName: 'Khách hàng',
      productId: review.productId,
      rating: review.rating,
      comment: review.comment,
      images: review.images,
      createdAt: new Date().toISOString(),
      isVerified: true,
    };
  },
};
