
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Task, Priority } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'MISSING_API_KEY_PREVENT_CRASH' });

export const getTaskSuggestions = async (profile: UserProfile): Promise<string[]> => {
  try {
    const profession = profile.profession === 'Other' ? profile.customProfession : profile.profession;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As an AI time-management assistant, suggest 5 common tasks for a ${profession} that typically occur outside of working hours. Return only a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching task suggestions:", error);
    return [];
  }
};

export const getMotivationalFeedback = async (score: number, tasks: Task[]): Promise<string> => {
  try {
    const completed = tasks.filter(t => t.status === 'Completed').map(t => t.name).join(", ");
    const missed = tasks.filter(t => t.status === 'Not Completed').map(t => t.name).join(", ");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, supportive, non-judgmental feedback for a user who achieved a time-management score of ${score}%. 
      Completed tasks: ${completed || 'None'}. 
      Missed tasks: ${missed || 'None'}.
      Keep it brief (max 3 sentences) and focus on habit building.`,
    });
    return response.text || "Keep up the great effort! Every small step counts towards better habits.";
  } catch (error) {
    return "Great job focusing on your goals today!";
  }
};

export const generateVoiceReminderText = async (task: Task): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a short, friendly reminder for the task "${task.name}". It should be concise for a text-to-speech engine.`,
    });
    return response.text || `Time to start your task: ${task.name}`;
  } catch (error) {
    return `Reminder: ${task.name}`;
  }
};
