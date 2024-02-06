import { redis } from '@/utils/db';
import { redisType } from '@/utils/utils';
import OpenAI from 'openai';

interface Props {
  farcasterId: string;
}

export const generateStory = async ({ farcasterId }: Props) => {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  console.log('farcasterId', farcasterId);

  const story = (await redis.get(farcasterId)) as redisType;

  console.log('story', story);

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `
        You are an amazing Story writer who writes nail biting story, i am giving you some portions of a story, 
        and you have to make an entire short story using points. The word limit of the story should be 350 words.

        Here are the points:

        ${story.answers}
        `,
      },
    ],
    n: 1,
  });

  const text = response?.choices[0].message.content;

  console.log('text', text);

  return text;
};
