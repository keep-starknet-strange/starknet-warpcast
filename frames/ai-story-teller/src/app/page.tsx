import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const fcMetadata: Record<string, string> = {
    'fc:frame': 'vNext',
    'fc:frame:post_url': `${process.env.HOST_URL}/start?time${Date.now()}`,
    'fc:frame:image': `https://t4.ftcdn.net/jpg/04/61/47/03/360_F_461470323_6TMQSkCCs9XQoTtyer8VCsFypxwRiDGU.jpg`,
    'fc:frame:button:1': 'Create your story',
  };

  return {
    title: 'Starknet Frame',
    openGraph: {
      title: 'Starknet Frame',
      images: [
        'https://t4.ftcdn.net/jpg/04/61/47/03/360_F_461470323_6TMQSkCCs9XQoTtyer8VCsFypxwRiDGU.jpg',
      ],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(`${process.env.HOST_URL}`),
  };
}

const Room = () => {
  return <h1> Starknet Frame </h1>;
};

export default Room;
