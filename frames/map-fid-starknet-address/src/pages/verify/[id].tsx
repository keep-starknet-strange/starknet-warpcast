import { StarknetProvider } from "../../components/starknet-provider";
import ConnectWallet from "../../components/connect-wallet";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { timeValid } from "../../utils";

export default function Home() {
  const router = useRouter();
  const [invalidVerification, setInvalidVerification] = useState(false);
  const [fid, setFid] = useState(0);
  const [timestamp, setTimestamp] = useState(0);

  useEffect(() => {
    const messageBytes = router.query.id;
    if (messageBytes) {
      // send a request to /api/validate
      fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageBytes }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (timeValid(res.timestamp)) {
            setFid(res.fid);
            setTimestamp(res.timestamp);
          } else {
            console.log("Timestamp is older than 30 minutes");
            setInvalidVerification(true);
          }
        })
        .catch((err) => {
          console.error(err);
          setInvalidVerification(true);
        });
    }
  }, [router.query.id]);

  return (
    <div>
      {invalidVerification ? (
        <div>
          <h1>Invalid Verification</h1>
          <p>The verification link is invalid.</p>
        </div>
      ) : (
        <div>
          <StarknetProvider>
            <ConnectWallet fid={fid} timestamp={timestamp} />
          </StarknetProvider>
        </div>
      )}
    </div>
  );
}
