"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { format } from "date-fns";
import { OrderDto } from "@/hooks/useOrder";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { currencyFormat } from "@/lib/utils";
import { ClipboardCheck, Package, Truck, Calendar } from "lucide-react";
import { useState } from "react";
import OrderContinueCheckoutModal from "./OrderContinueCheckoutModal";

interface OrderDetailModalProps {
  order: OrderDto;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
}: OrderDetailModalProps) {
  const [openCheckoutModal, setOpenCheckoutModal] = useState(false);

  // Order status chip color map
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "processing":
        return "primary";
      case "shipped":
        return "secondary";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  // Order status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <ClipboardCheck className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <ClipboardCheck className="h-4 w-4" />;
      default:
        return <ClipboardCheck className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="3xl"
        scrollBehavior="inside"
        classNames={{
          base: "py-3 px-4 border border-border bg-background shadow-lg",
          backdrop: "bg-background/80 backdrop-blur-sm",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Order Details</h3>
                <p className="text-sm text-muted-foreground">
                  #{order.id.substring(0, 8)}
                </p>
              </div>
              <Chip
                color={getStatusColor(order.orderState) as any}
                startContent={getStatusIcon(order.orderState)}
                size="sm"
              >
                {order.orderState}
              </Chip>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="space-y-6 px-1 py-4">
              {/* Order Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Order Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-medium">
                        {order.id.substring(0, 12)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Date Placed:
                      </span>
                      <span>{format(new Date(order.createdAt), "PP")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Shipping Method:
                      </span>
                      <span>{order.shippingType}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{order.ownerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{order.ownerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-medium text-right">
                        {order.address.detailAddress}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Items
                </h4>
                <Table
                  aria-label="Order items table"
                  shadow="none"
                  classNames={{
                    base: "border rounded-lg overflow-hidden",
                    th: "bg-muted/30 text-xs font-medium text-default-600",
                    td: "py-3",
                  }}
                >
                  <TableHeader>
                    <TableColumn>PRODUCT</TableColumn>
                    <TableColumn>SIZE</TableColumn>
                    <TableColumn>QUANTITY</TableColumn>
                    <TableColumn>PRICE</TableColumn>
                    <TableColumn>TOTAL</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {order.products.map((product) => (
                      <TableRow key={product.productSizeId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-md overflow-hidden flex-shrink-0">
                              <img
                                src={product.productPhotoUrl}
                                alt={product.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-sm font-medium line-clamp-1">
                              {product.productName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{product.size}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>
                          {currencyFormat(product.productPrice)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {currencyFormat(
                            product.productPrice * product.quantity
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="md:w-72 ml-auto">
                <h4 className="text-sm font-medium mb-3">Order Summary</h4>
                <div className="space-y-2 bg-muted/20 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      {currencyFormat(order.totalPrice - order.shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{currencyFormat(order.shippingCost)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{currencyFormat(order.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setOpenCheckoutModal(true)}>
              Continue checkout
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {openCheckoutModal && (
        <OrderContinueCheckoutModal
          isOpen={openCheckoutModal}
          onClose={() => setOpenCheckoutModal(false)}
          orderId={order.id}
        />
      )}
    </>
  );
}
