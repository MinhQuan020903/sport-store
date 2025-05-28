import { Metadata } from 'next';
import PincodeVerification from './PincodeVerification';

export const metadata: Metadata = {
  title: 'Pincode Verification',
  description: 'Verify your account with a pincode',
};

const PincodePage = ({
  searchParams,
}: {
  searchParams: { email?: string };
}) => {
  const email = searchParams.email || '';

  return (
    <>
      <div className="p-12 relative h-screen w-full">
        <div className="lg:p-8 sm:p-12">
          <div className="mx-auto h-full flex w-full flex-col justify-center space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Xác thực đăng nhập
              </h1>
              <p className="text-sm text-muted-foreground">
                Vui lòng nhập mã xác thực đã được gửi đến email của bạn
              </p>
            </div>
            <PincodeVerification email={email} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PincodePage;
