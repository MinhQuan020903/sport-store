'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Pagination,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardFooter,
  Spinner,
  Chip,
} from '@nextui-org/react';
import { format } from 'date-fns';
import { ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import useOrder, { OrderDto, OrderParams } from '@/hooks/useOrder';
import { currencyFormat } from '@/lib/utils';
import OrderDetailModal from './OrderDetailModal';

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Order status options
  const orderStatuses = [
    { value: '', label: 'All Orders' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  // Handle status change - reset to page 1 when filter changes
  const handleStatusChange = (value: string) => {
    setOrderStatus(value === '' ? null : value);
    setCurrentPage(1);
  };

  // Prepare order parameters
  const orderParams: OrderParams = {
    pageNumber: currentPage,
    pageSize: pageSize,
    // Only include orderState if orderStatus has a value
    ...(orderStatus && { orderState: orderStatus }),
    orderBy: 'createdAt',
    sortBy: 'desc',
  };

  // Fetch orders with filters
  const { useOrders } = useOrder();
  const { data: ordersResponse, isLoading } = useOrders(orderParams);

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open order details modal
  const handleViewDetails = (order: OrderDto) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // Order status chip color map
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'primary';
      case 'shipped':
        return 'secondary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Check if there are no orders with current filter
  const hasNoOrders = !ordersResponse || !ordersResponse.length;
  const activeFilter = orderStatus ? ` with status "${orderStatus}"` : '';

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground mt-1">
          View and track your order history
        </p>
      </div>

      <Separator className="my-6" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <Select
          label="Filter by status"
          placeholder="All orders"
          value={orderStatus || ''}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="max-w-xs"
          size="sm"
        >
          {orderStatuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="Items per page"
          value={String(pageSize)}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="w-32"
          size="sm"
        >
          <SelectItem key="5" value="5">
            5
          </SelectItem>
          <SelectItem key="10" value="10">
            10
          </SelectItem>
          <SelectItem key="20" value="20">
            20
          </SelectItem>
        </Select>
      </div>

      {/* Orders List */}
      {hasNoOrders ? (
        <div className="flex flex-col gap-3 text-center py-16 bg-muted/30 rounded-lg">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {orderStatus ? `No orders found.` : "You don't have any orders yet"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {orderStatus
              ? 'Try selecting a different status filter or clear the filter to see all orders'
              : 'Start shopping to see your order history here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {ordersResponse.map((order) => (
            <Card key={order.id} className="w-full border shadow-sm">
              <CardBody className="p-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        Order #{order.id.substring(0, 8)}
                      </p>
                      <Chip
                        size="sm"
                        color={getStatusColor(order.orderState) as any}
                        className="h-5"
                      >
                        {order.orderState}
                      </Chip>
                    </div>
                    <p className="text-sm mt-1">
                      {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium mb-3">Items</h4>
                    <div className="space-y-3">
                      {order.products.slice(0, 2).map((product) => (
                        <div
                          key={product.productSizeId}
                          className="flex gap-3 items-center"
                        >
                          <div className="w-14 h-14 bg-muted rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={product.productPhotoUrl}
                              alt={product.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {product.productName}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <span>Size: {product.size}</span>
                              <span className="mx-2">•</span>
                              <span>
                                {product.quantity} ×{' '}
                                {currencyFormat(product.productPrice)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.products.length > 2 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          +{order.products.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-3">Order Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>
                          {currencyFormat(
                            order.totalPrice - order.shippingCost
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping:</span>
                        <span>{currencyFormat(order.shippingCost)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{currencyFormat(order.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
              <CardFooter className="px-5 py-3 bg-muted/10 flex sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => handleViewDetails(order)}
                  className="w-full"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}

          {/* Pagination */}
          {ordersResponse.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                total={ordersResponse.totalPages}
                initialPage={currentPage}
                page={currentPage}
                onChange={handlePageChange}
                showControls
                variant="flat"
                classNames={{
                  cursor: 'bg-black text-white',
                }}
              />
            </div>
          )}

          {/* Order Detail Modal */}
          {selectedOrder && (
            <OrderDetailModal
              order={selectedOrder}
              isOpen={isDetailOpen}
              onClose={() => setIsDetailOpen(false)}
            />
          )}
        </div>
      )}
    </section>
  );
}
