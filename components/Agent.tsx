"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "assistant" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  type,
  interviewId,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = {
          role: message.role as "user" | "assistant",
          content: message.transcript,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: any) => {
      console.log("Error:", error);

      // Manejo específico de errores de permisos de cámara/micrófono
      if (error.action === "camera-error" || error.action === "mic-error") {
        setHasPermissionError(true);
        setCallStatus(CallStatus.INACTIVE);

        const deviceType =
          error.action === "camera-error" ? "cámara" : "micrófono";
        toast.error(`Error de permisos`, {
          description: `No se pudo acceder a tu ${deviceType}. Por favor, permite el acceso en la configuración de tu navegador.`,
          duration: 6000,
        });
      } else if (error.errorMsg || error.error) {
        const errorMessage =
          error.errorMsg?.message ||
          error.error?.message ||
          "Error desconocido";
        toast.error("Error en la llamada", {
          description: errorMessage,
          duration: 5000,
        });
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  const handleGenerateFeedback = async (messages: SavedMessage[]) => {
    console.log("Generating feedback...");

    //TODO : Create a server action that generates feedback
    const { success, feedbackId: id } = await createFeedback({
      interviewId: interviewId!,
      userId: userId!,
      transcript: messages,
    });
    if (success && id) {
      router.push(`/interview/${interviewId}/feedback`);
    } else {
      console.log("Error generating feedback");
      router.push("/");
    }
  };

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push(`/`);
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    setHasPermissionError(false);

    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    try {
      if (type === "generate") {
        await vapi.start(assistantId, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `-${question}`)
            .join("\n");
        }
        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (error: any) {
      console.error("Error starting call:", error);
      setCallStatus(CallStatus.INACTIVE);

      toast.error("No se pudo iniciar la llamada", {
        description:
          "Verifica que hayas dado permisos para usar la cámara y el micrófono.",
        duration: 5000,
      });
    }
  };

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.INACTIVE);
    await vapi.stop();
  };

  const handleCancel = async () => {
    setCallStatus(CallStatus.INACTIVE);
    await vapi.stop();
    router.push("/");
  };

  const lastestMessage = messages[messages.length - 1]?.content;

  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      {hasPermissionError && (
        <div className="w-full max-w-2xl mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-800 mb-1">
                Permisos de dispositivo requeridos
              </h4>
              <p className="text-sm text-red-700 mb-2">
                Para realizar la entrevista, necesitas permitir el acceso a tu
                cámara y micrófono.
              </p>
              <ol className="text-xs text-red-600 list-decimal list-inside space-y-1">
                <li>
                  Haz clic en el icono del candado/información en la barra de
                  direcciones
                </li>
                <li>Selecciona "Configuración del sitio" o "Permisos"</li>
                <li>Permite el acceso a la cámara y el micrófono</li>
                <li>Recarga la página e intenta nuevamente</li>
              </ol>
            </div>
          </div>
        </div>
      )}
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="vapi"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.jpg"
              alt="user"
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastestMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastestMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex-center flex-col gap-4">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call w-fit" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span>{isCallInactiveOrFinished ? "Call" : ". . ."}</span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
        <button
          className="btn-disconnect w-fit flex justify-center"
          onClick={handleCancel}
        >
          {" "}
          Cancel Interview{" "}
        </button>
      </div>
    </>
  );
};

export default Agent;
