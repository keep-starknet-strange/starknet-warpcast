import OpenAI from 'openai';

interface Props {
  text: string;
}

export const generateImage = async ({ text }: Props) => {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const response = await openai.images.generate({
    model: 'dall-e-2',
    prompt: text,
    n: 1,
    size: '512x512',
    quality: 'standard',
  });

  const imageUrl = response.data[0].url;

  return imageUrl;
};
