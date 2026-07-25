import Anthropic from '@anthropic-ai/sdk';
import Pet from '../models/Pet.ts';
import AppError from '../utils/AppError.ts';
import JsonifyText from '../utils/JsonifyText.ts';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a helpful veterinary assistant providing general guidance only.
Never make a definitive diagnosis. Always recommend professional veterinary care when in doubt.
Respond ONLY with valid JSON — no markdown, no extra text.`;

export const checkSymptoms = async (petId: string, ownerUid: string, symptoms: string) => {
  const pet = await Pet.findById(petId);
  if (!pet) throw new AppError('Pet not found', 404);
  if (pet.owner !== ownerUid) throw new AppError('Forbidden', 403);

  const age = pet.dob
    ? `${Math.floor((Date.now() - pet.dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old`
    : 'age unknown';

  const userMessage = `My ${pet.species} named ${pet.name} (${age}${pet.breed ? `, ${pet.breed}` : ''}) is showing these symptoms: "${symptoms}"

Please respond with JSON in this exact shape:
{
  "causes": [
    { "name": string, "likelihood": "high" | "medium" | "low", "homeCare": string }
  ],
  "urgency": "can_wait" | "within_48h" | "go_now",
  "disclaimer": string
}
Return 2-3 causes ordered from most to least probable.`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = message.content[0]?.type === 'text' ? message.content[0].text : '';
  const response = JsonifyText(text);
  try {
    return JSON.parse(response) as {
      causes: { name: string; likelihood: 'high' | 'medium' | 'low'; homeCare: string }[];
      urgency: 'can_wait' | 'within_48h' | 'go_now';
      disclaimer: string;
    };
  } catch {
    throw new AppError('Failed to parse AI response', 500);
  }
};
