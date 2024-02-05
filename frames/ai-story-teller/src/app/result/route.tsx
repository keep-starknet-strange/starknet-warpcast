import { generateImage } from '@/components/generateImage';
import { redis } from '@/utils/db';
import { redisType } from '@/utils/utils';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const answer = searchParams.get('answer');
  const fid = searchParams.get('fid');

  console.log(answer);

  if (!answer || !fid) {
    return new Response('Invalid Request', { status: 400 });
  }

  const imageUrl = (await generateImage({ text: answer })) as string;

  console.log(imageUrl);

  const existingData = (await redis.get(fid?.toString())) as redisType;

  await redis.set(fid, {
    ...existingData,
    image: imageUrl,
  });

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
          <img width={'100%'} height={'100%'} src={imageUrl} />
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
