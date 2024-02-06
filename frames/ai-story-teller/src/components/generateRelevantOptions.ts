import OpenAI from 'openai';

interface Props {
  text: string;
}

export const generateRelevantOptions = async ({ text }: Props) => {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `
    I am creating a "Build your story" where I ask user to select one option from 4 and continue this process to have a full story. This options should be small of 4-5 words. 
    Show me the options for the next step in the story based on the previous story i.e. "${text}".

    return as an array in this format:
    ["option1", "option2", "option3", "option4"]
    `,
      },
    ],
  });
  if (response?.choices[0]?.message?.content) {
    const dataArray: string[] = JSON.parse(
      response?.choices[0]?.message?.content.toString()
    );
    return {
      options: dataArray,
    };
  } else {
    throw new Error('Error in generating options');
  }
};
