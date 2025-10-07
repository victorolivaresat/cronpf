'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ref, set } from 'firebase/database';

const authFormSchema = z.object({
  email: z.string().email({ message: 'Direccion de correo invalida.' }),
  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  name: z.string().optional(),
});

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export function AuthForm({ mode }: AuthFormProps) {
  return (
    <Suspense fallback={<div>Cargando formulario...</div>}>
      <AuthFormContent mode={mode} />
    </Suspense>
  );
}

function AuthFormContent({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Schema dinamico segun el modo
  const dynamicSchema =
    mode === 'signup'
      ? authFormSchema.extend({
          name: z
            .string()
            .min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
        })
      : authFormSchema;

  const form = useForm<z.infer<typeof authFormSchema>>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof authFormSchema>) {
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        if (!values.name || values.name.trim().length < 2) {
          toast({
            title: 'Error',
            description:
              'El nombre es requerido y debe tener al menos 2 caracteres.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;

        // Update Firebase Auth profile
        await updateProfile(user, { displayName: values.name });

        // Create user profile in Realtime Database
        await set(ref(db, 'users/' + user.uid), {
          name: values.name,
          email: user.email,
        });

        toast({ title: '¡Cuenta creada con exito!' });
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({ title: '¡Has iniciado sesion con exito!' });
      }
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch (error: any) {
      console.error('Error en autenticacion:', error);
      toast({
        title: 'Fallo la autenticacion',
        description: error.message || 'Ocurrio un error inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {mode === 'signup' && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electronico</FormLabel>
              <FormControl>
                <Input placeholder="nombre@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'login' ? 'Iniciar Sesion' : 'Registrarse'}
        </Button>
      </form>
    </Form>
  );
}
