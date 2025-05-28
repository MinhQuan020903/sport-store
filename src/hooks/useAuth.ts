import { getRequest, postRequest, putRequest } from '@/lib/fetch';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';

export const useAuth = () => {
  const router = useRouter();

  const onRegister = async (data, callback) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });

    const response = await res.json();

    if (response?.message === 'User already exists') {
      callback?.();
      toast.error(response.message);
    }
    if (response?.message === 'User created and OTP sent') {
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      callback?.();
      router.push(`/auth/register/otp?payload=${response.payload}`);
    }
  };

  const onVerifyOtp = async (email, otp, callback, update) => {
    const res = await postRequest({
      endPoint: '/api/auth/register/otp',
      formData: { email: email, otp: otp },
      isFormData: false,
    });
    callback?.();
    if (res === 'OTP verified') {
      toast.success('OTP verified');
      await update();
      router.push('/');
    } else {
      toast.error('OTP is not valid');
    }
  };

  const onSendAgain = async (data) => {
    console.log(data);

    await putRequest({
      endPoint: '/api/auth/register/otp',

      formData: { email: data },
      isFormData: false,
    });
    toast.success('OTP has been sent to your email');
  };
  const onFirstSend = async (data) => {
    toast.success('OTP has been sent to your email');
    await putRequest({
      endPoint: '/api/auth/register/otp',

      formData: { email: data },
      isFormData: false,
    });
  };

  const onGetUserDetail = async ({ userId }) => {
    const user = await getRequest({
      endPoint: `/api/user?userId=${userId}`,
    });
    console.log('🚀 ~ file: useAuth.ts:97 ~ onGetUserDetail ~ user:', user);
    return user;
  };

  const onLogin = async (data, callback) => {
    try {
      console.log('Login data:', data);
      const response = await postRequest({
        endPoint: '/api/Auth/login',
        formData: {
          email: data.email,
          password: data.password,
        },
        isFormData: false,
      });

      callback?.();

      if (response?.error) {
        toast.error(response.error);
        return { success: false };
      }

      if (response?.requiresPincode) {
        // Return flag indicating pincode verification needed
        return { requiresPincode: true, email: data.email };
      }

      // Check if we received user data in the expected format (with username, token, etc.)
      if (response && response?.username && response.token) {
        // Sign in with credentials and include the user data
        const signInResult = await signIn('credentials', {
          email: data.email,
          redirect: false,
          userData: JSON.stringify(response), // Pass the complete user data to be used in the session
        });

        if (signInResult?.error) {
          console.error('Sign in error:', signInResult.error);
          toast.error(signInResult.error);
          return { success: false };
        }

        toast.success('Login successful');
        router.push('/');
        return { success: true, user: response };
      }

      // Fallback to regular credentials sign in if no user data in response
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error(signInResult.error);
        return { success: false };
      }

      router.push('/');
      return { success: true };
    } catch (error) {
      callback?.();
      toast.error('Login failed');
      return { success: false };
    }
  };

  const onVerifyLoginPincode = async (email, pincode) => {
    try {
      const response = await postRequest({
        endPoint: '/api/auth/login/verify',
        formData: {
          email,
          pincode,
        },
        isFormData: false,
      });

      if (response?.error) {
        return { success: false, message: response.error };
      }

      // Sign in with credentials after pincode verification
      const signInResult = await signIn('credentials', {
        email,
        password: response.password, // The backend might send back a temporary password or token
        redirect: false,
      });

      if (signInResult?.error) {
        return { success: false, message: signInResult.error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: 'Verification failed' };
    }
  };

  const onResendLoginPincode = async (email) => {
    return await postRequest({
      endPoint: '/api/auth/login/resend-pincode',
      formData: { email },
      isFormData: false,
    });
  };

  return {
    onRegister,
    onSendAgain,
    onVerifyOtp,
    onFirstSend,
    onGetUserDetail,
    onLogin,
    onVerifyLoginPincode,
    onResendLoginPincode,
  };
};
