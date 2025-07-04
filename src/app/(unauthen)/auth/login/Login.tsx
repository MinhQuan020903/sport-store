'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Icons } from '@/assets/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import Loader from '@/components/Loader';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AiFillEyeInvisible, AiFillEye } from 'react-icons/ai';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';

const formSchema = z.object({
  email: z.string().min(1, {
    message: 'Email is required',
  }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
});

const Login = ({ className }: { className?: string; providers: unknown }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [show, setShow] = React.useState({
    showPass: false,
  });
  const { onLogin } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      const result = await onLogin(data, () => {
        setIsLoading(false);
      });

      if (result?.requiresPincode) {
        // Redirect to pincode verification page
        router.push(`/auth/pincode?email=${encodeURIComponent(data.email)}`);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error('Login failed');
    }
  }

  if (isLoading)
    return (
      <div className="w-full flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div
        className={cn('grid gap-6 w-[80%] md:w-[70%] lg:w-[60%] ', className)}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="gap-8 flex flex-col">
                <div className="flex flex-col gap-3 ">
                  <Label>Tài khoản</Label>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Nhập tên đăng nhập" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-3 ">
                  <Label>Mật khẩu</Label>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            renderRight={
                              <div
                                onClick={() => {
                                  setShow({
                                    ...show,
                                    showPass: !show.showPass,
                                  });
                                }}
                                className="opacity-50 cursor-pointer hover:opacity-100"
                              >
                                {show.showPass ? (
                                  <AiFillEyeInvisible size={20} />
                                ) : (
                                  <AiFillEye size={20} />
                                )}
                              </div>
                            }
                            value={field.value}
                            onChange={field.onChange}
                            id="password"
                            placeholder="Nhập mật khẩu"
                            type={show.showPass ? 'text' : 'password'}
                            autoCapitalize="none"
                            autoComplete="password"
                            autoCorrect="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit">Đăng nhập</Button>
            </div>
          </form>
        </Form>

        {/* <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Hoặc có thể tiếp tục với
            </span>
          </div>
        </div>
        <div className="w-full flex gap-6">
          <Button
            className="w-1/2 "
            onClick={() => {
              signIn('github');
            }}
            variant="outline"
            disabled={isLoading}
          >
            <div>
              <Icons.gitHub className="mr-2 h-4 w-4" />
            </div>{' '}
            Github
          </Button>
          <Button
            className="w-1/2"
            onClick={() => {
              signIn('discord');
            }}
            variant="outline"
            disabled={isLoading}
          >
            <div>
              <Icons.discord className="mr-2 h-4 w-4" />
            </div>{' '}
            Discord
          </Button>
          <Button
            className="w-1/2"
            onClick={() => {
              signIn('google');
            }}
            variant="outline"
            disabled={isLoading}
          >
            <div>
              <Icons.google className="mr-2 h-4 w-4" />
            </div>{' '}
            Google
          </Button>
        </div> */}
      </div>

      <p className="mt-10 px-8 text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Link className="font-bold underline text-black" href="/auth/register">
          Đăng ký
        </Link>
      </p>
    </div>
  );
};

export default Login;
