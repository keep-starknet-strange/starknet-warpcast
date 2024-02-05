'use client';

import ConnectWallet from '@/components/connect-wallet';
import { StarknetProvider } from '@/components/starknet-provider';
import { timeValid } from '@/utils/utils';
import { useEffect, useState } from 'react';

const Minter = ({ params }: { params: { fid: string } }) => {
  const [invalidVerification, setInvalidVerification] = useState(false);
  const [fid, setFid] = useState(0);
  const [timestamp, setTimestamp] = useState(0);

  useEffect(() => {
    console.log('params.id: ', params.fid);
    const messageBytes = params.fid;
    console.log(messageBytes);
    if (messageBytes) {
      fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageBytes }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (timeValid(res.timestamp)) {
            setFid(res.fid);
            setTimestamp(res.timestamp);
          } else {
            console.log('Timestamp is older than 30 minutes');
            setInvalidVerification(true);
          }
        })
        .catch((err) => {
          console.error(err);
          setInvalidVerification(true);
        });
    }
  }, [params.fid]);

  return (
    <div>
      <StarknetProvider>
        <ConnectWallet fid={Number(params.fid)} timestamp={timestamp} />
      </StarknetProvider>
    </div>
  );
};

export default Minter;
