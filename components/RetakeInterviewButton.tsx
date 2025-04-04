"use client";

import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import { deleteFeedbackById } from "@/lib/actions/general.action";

interface RetakeInterviewButtonProps {
  feedbackId: string;
  interviewId: string;
}

const RetakeInterviewButton = ({
  feedbackId,
  interviewId,
}: RetakeInterviewButtonProps) => {
  const router = useRouter();

  const handleRetakeInterview = async () => {
    try {
      await deleteFeedbackById(feedbackId);
      console.log("Feedback eliminado correctamente");
      router.push(`/interview/${interviewId}`);
    } catch (error) {
      console.error("Error al eliminar feedback:", error);
    }
  };

  return (
    <Alert
      buttonTrigger="Retake Interview"
      title="Are you sure?"
      text="This will delete the feedback and allow you to retake the interview. Are you sure?"
      buttonClass="btn-primary flex-1"
      buttonTextClass="text-sm font-semibold text-black text-center"
      onConfirm={handleRetakeInterview}
      confirmText="Yes, retake the interview"
      cancelText="Cancelar"
    />
  );
};

export default RetakeInterviewButton;
