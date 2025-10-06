
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Project } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, UserPlus, Loader2 } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce una dirección de correo válida." }),
});

type ManageMembersFormProps = {
  members: Project['members'];
  onAddMember: (email: string) => Promise<boolean>;
  onRemoveMember: (userId: string) => void;
};

const getInitials = (name: string | undefined, email: string) => {
    if (name) {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
}

export function ManageMembersForm({ members, onAddMember, onRemoveMember }: ManageMembersFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const success = await onAddMember(values.email);
    if (success) {
        form.reset();
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-end gap-2">
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem className="flex-grow">
                <FormLabel>Añadir por Correo</FormLabel>
                <FormControl>
                    <Input placeholder="nuevo.miembro@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            </Button>
        </form>
      </Form>
      <div>
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">Miembros Actuales</h3>
         <ScrollArea className="h-48">
            <div className="space-y-2 pr-4">
            {Object.entries(members).map(([uid, member]) => (
                <div key={uid} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{getInitials(member.name, member.email)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium">{member.name || member.email}</p>
                            <p className="text-xs text-muted-foreground capitalize">{member.role === 'owner' ? 'Propietario' : 'Miembro'}</p>
                        </div>
                    </div>
                    {member.role !== 'owner' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemoveMember(uid)}>
                            <Trash2 className="w-4 h-4 text-destructive/70" />
                        </Button>
                    )}
                </div>
            ))}
            </div>
        </ScrollArea>
      </div>
    </div>
  );
}
