
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState, cloneElement } from "react";

type ActionConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password?: string) => void;
  title: string;
  description: string;
  triggerButton: React.ReactElement;
  variant?: "default" | "destructive";
};

export function ActionConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  triggerButton,
  variant = "default",
}: ActionConfirmationDialogProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm(password);
    setIsLoading(false);
    setPassword("");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        {triggerButton}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
            <Label htmlFor="password-confirm">Contraseña</Label>
            <Input 
                id="password-confirm"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setPassword('')}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!password || isLoading}
            className={cn(buttonVariants({ variant }))}
          >
            {isLoading ? "Confirmando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    