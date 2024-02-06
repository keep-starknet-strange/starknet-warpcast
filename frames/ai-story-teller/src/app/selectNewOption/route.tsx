import { generateNewOptions } from '@/components/generateNewOptions';
import { redis } from '@/utils/db';
import { redisType } from '@/utils/utils';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  console.log('called');

  if (!fid) {
    return new Response('Invalid Request', { status: 400 });
  }

  const options = ((await generateNewOptions()) as { options: string[] })
    .options;

  console.log(options);

  await redis.set(fid?.toString(), {
    options: options,
    answers: '',
    image: '',
  } as redisType);

  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'black',
          }}
        >
          <span
            style={{
              fontWeight: 'bold',
              fontSize: '3rem',
              marginTop: '1rem',
              color: 'white',
            }}
          >
            Select Option to Create your Story
          </span>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              width: '60%',
              margin: '1.5rem',
            }}
          >
            {options.map((option: string, idx: number) => (
              <span tw='text-white text-2xl w-[48%] items-center' key={idx}>
                {idx + 1}. {option}
              </span>
            ))}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(e);
    return new Response(e, { status: 500 });
  }
}
