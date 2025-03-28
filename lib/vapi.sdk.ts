// lib/vapi.sdk.ts
import Vapi from "@vapi-ai/web";

// Initialize with your PUBLIC API KEY (web token)
export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
