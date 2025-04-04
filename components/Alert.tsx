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
import { Button } from "@/components/ui/button";

interface AlertProps {
  buttonTrigger: string;
  title?: string;
  text: string;
  buttonClass?: string;
  buttonTextClass?: string;
  // Add confirm and cancel functions
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Alert = ({
  buttonTrigger,
  title = "Are you absolutely sure?",
  text,
  buttonClass,
  buttonTextClass,
  onConfirm,
  onCancel,
  confirmText = "Continue",
  cancelText = "Cancel",
}: AlertProps) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className={buttonClass}>
          <p className={buttonTextClass}>{buttonTrigger}</p>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{text}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="btn-secondary" onClick={handleCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction className="btn-primary" onClick={handleConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Alert;
