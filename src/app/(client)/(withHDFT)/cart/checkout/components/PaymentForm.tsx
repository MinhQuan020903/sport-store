'use client';

import React, { useEffect } from 'react';

import { Select, SelectItem } from '@nextui-org/react';
import { StripeCheckout } from './childComponents/StripeCheckout';
import VnPayCheckout from './childComponents/VnPayCheckout';
import MoMoCheckout from './childComponents/MoMoCheckout';

const checkOutConst = [{ value: 'Momo' }, { value: 'VnPay' }];

export const PaymentForm = ({ orderId }) => {
  const [selectedType, setSelectedType] = React.useState(new Set([]));
  const [typeTouched, setTypeTouched] = React.useState(false);
  const [method, setMethod] = React.useState('');
  const isTypeValid = selectedType.size > 0;
  useEffect(() => {
    if (selectedType) {
      const noiThatValueArray = Array.from(selectedType);
      setMethod(noiThatValueArray?.[0]);
    }
  }, [selectedType]);

  return (
    <div className="w-full h-full px-1">
      <Select
        key={'method'}
        radius={'md'}
        label="Phương thức thanh toán"
        isInvalid={isTypeValid || !typeTouched ? false : true}
        errorMessage={
          isTypeValid || !typeTouched
            ? ''
            : 'Vui lòng chọn phương thức thanh toán'
        }
        autoFocus={false}
        placeholder="Chọn phương thức thanh toán"
        selectedKeys={selectedType}
        onSelectionChange={(keys) => {
          setSelectedType(keys);
        }}
        onClose={() => setTypeTouched(true)}
        className="w-[98%]"
      >
        {checkOutConst?.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.value.toString()}
          </SelectItem>
        ))}
      </Select>
      {method === 'Momo' && <MoMoCheckout orderId={orderId} />}
      {method === 'VnPay' && <VnPayCheckout orderId={orderId} />}
    </div>
  );
};
