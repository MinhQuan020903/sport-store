'use client';
import React, { useState, useEffect } from 'react';
import OTPInput from 'react-otp-input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/Loader';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

export default function PincodeVerification({ email }: { email: string }) {
  const [pincode, setPincode] = useState('');
  const [counter, setCounter] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { onVerifyLoginPincode, onResendLoginPincode } = useAuth();
  const router = useRouter();
  const { update } = useSession();

  useEffect(() => {
    let timer;
    if (counter > 0 && !canResend) {
      timer = setTimeout(() => setCounter(counter - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [counter, canResend]);

  const handleResend = async () => {
    setCanResend(false);
    setCounter(30);
    try {
      await onResendLoginPincode(email);
      toast.success('Mã xác thực đã được gửi lại');
    } catch (error) {
      toast.error('Không thể gửi lại mã xác thực');
    }
  };

  const handleVerify = async () => {
    if (pincode.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onVerifyLoginPincode(email, pincode);
      if (result.success) {
        toast.success('Đăng nhập thành công');
        // Update session if needed
        await update();
        router.push('/');
      } else {
        toast.error(result.message || 'Mã xác thực không đúng');
      }
    } catch (error) {
      toast.error('Xác thực thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-y-10 mt-10 justify-center items-center">
      <OTPInput
        value={pincode}
        onChange={setPincode}
        numInputs={6}
        renderSeparator={<div className="w-1 lg:w-3" />}
        renderInput={(props) => <input {...props} />}
        inputStyle={{
          width: '2.5rem',
          height: '2.5rem',
          margin: '0 0.5rem',
          fontSize: '1.0rem',
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.6)',
        }}
      />
      <div className="w-full items-center justify-center flex flex-wrap gap-x-3">
        <div className="font-semibold">Chưa nhận được mã?</div>
        <button
          onClick={handleResend}
          disabled={!canResend}
          className={`font-bold underline ${!canResend ? 'text-gray-400' : ''}`}
        >
          Gửi lại ({counter}s)
        </button>
      </div>
      <Button onClick={handleVerify} className="w-[100px]">
        Xác thực
      </Button>
    </div>
  );
}
