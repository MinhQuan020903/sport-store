'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import CheckoutModal from './CheckoutModal';

export const Checkout = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div>
      <Button
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        Check out
      </Button>

      {isModalOpen && (
        <div>
          {/* <CheckoutModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          /> */}
        </div>
      )}
    </div>
  );
};
