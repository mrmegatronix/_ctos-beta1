import { GoogleGenAI, Type } from "@google/genai";
import { TeamMember, CalendarEvent } from "../types";

const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables (VITE_GEMINI_API_KEY).");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const parseNaturalLanguageCommand = async (
  command: string,
  currentEvents: CalendarEvent[],
  teamMembers: TeamMember[]
): Promise<{
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'QUERY' | 'UNKNOWN';
  eventData?: Partial<CalendarEvent>;
  targetEventId?: string;
  responseMessage: string;
}> => {
  const client = getGeminiClient();
  if (!client) {
    return {
      action: 'UNKNOWN',
      responseMessage: "API Key is missing. Please configure your API key."
    };
  }

  const todayStr = new Date().toISOString();
  
  // Create a minimal context of team members for the prompt
  const teamContext = teamMembers.map(m => `${m.name} (ID: ${m.id})`).join(", ");
  
  // Create a minimal context of existing events (truncate description to save tokens)
  const eventContext = JSON.stringify(currentEvents.map(e => ({
    id: e.id,
    title: e.title,
    start: e.start.toISOString(),
    end: e.end.toISOString(),
    attendees: e.attendeeIds
  })).slice(0, 50)); // Limit to last 50 events to avoid huge payload

  const systemInstruction = `
    You are an intelligent calendar assistant for a team.
    Current Time: ${todayStr}
    Team Members: ${teamContext}
    Existing Events (Subset): ${eventContext}

    Your goal is to interpret the user's natural language command and decide on a calendar action.
    
    If the user wants to schedule a meeting, find a time that seems appropriate based on the request (e.g. "next tuesday at 2pm").
    If specific people are mentioned, map them to their IDs.
    
    Return a JSON response.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: command,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: {
              type: Type.STRING,
              enum: ['CREATE', 'UPDATE', 'DELETE', 'QUERY', 'UNKNOWN'],
              description: "The type of action to perform."
            },
            eventData: {
              type: Type.OBJECT,
              description: "Data for creating or updating an event. Dates must be ISO 8601 strings.",
              properties: {
                title: { type: Type.STRING },
                start: { type: Type.STRING },
                end: { type: Type.STRING },
                description: { type: Type.STRING },
                attendeeIds: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                location: { type: Type.STRING },
                isMeeting: { type: Type.BOOLEAN }
              }
            },
            targetEventId: {
              type: Type.STRING,
              description: "The ID of the event to update or delete, if applicable."
            },
            responseMessage: {
              type: Type.STRING,
              description: "A friendly message to the user confirming the action or answering their query."
            }
          },
          required: ["action", "responseMessage"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      action: 'UNKNOWN',
      responseMessage: "I'm having trouble processing that request right now."
    };
  }
};
