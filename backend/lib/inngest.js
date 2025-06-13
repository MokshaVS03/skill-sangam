import { Inngest } from "inngest";
import { createAgent, gemini } from "@inngest/agent-kit";
// lib/inngest.js - Dynamic import approach
import dotenv from 'dotenv';

// Always load dotenv first
dotenv.config();

// Debug environment variables
console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY?.length || 0);

// Validate API key exists
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

// Validate API key format (basic check)
if (!process.env.GEMINI_API_KEY.startsWith('AIza')) {
  console.warn("Warning: Gemini API key format might be incorrect");
}

export const supportAgent = createAgent({
  model: gemini({
    model: "gemini-1.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.2,
  }),
  name: "Medical AI Assistant",
  system: `You are an expert AI assistant that processes medical support tickets. Your job is to:

1. Summarize the patient's medical issue based on the provided symptoms.
2. Estimate the priority based on the severity of the symptoms.
3. Provide helpful notes and resource links for medical professionals or moderators.
4. List the relevant medical specialties or departments required to address the issue.
`
});

export const inngest = new Inngest({
  id: "hospital-ai-app",
  name: "HospitalAI"
});

// Test function to verify agent is working
export async function testAgent() {
  try {
    console.log("Testing agent configuration...");
    const result = await supportAgent.run({
      input: "Patient reports severe chest pain and shortness of breath"
    });
    console.log("Agent test successful:", result);
    return result;
  } catch (error) {
    console.error("Agent test failed:", error);
    throw error;
  }
}