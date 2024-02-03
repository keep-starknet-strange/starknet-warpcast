import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useStarknetkitConnectModal } from "starknetkit";
import Link from "next/link";

export default function Home() {
  const [profileData, setProfileData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    dappName: "Starknet Farcaster",
  });

  const connectWallet = async () => {
    const { connector } = await starknetkitConnectModal();
    await connect({ connector });
  };

  const disconnectWallet = async () => {
    await disconnect();
  };

  const getMapping = async (starknetAddress: string, retries: number) => {
    try {
      const response = await fetch(
        `/api/getMapping?starknetAddress=${starknetAddress}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    } catch (error) {
      // wait 1 second before retrying
      setTimeout(() => {
        if (retries < 3) {
          getMapping(starknetAddress, retries + 1);
        } else {
          setErrorMessage("Failed to get mapping");
        }
      }, 1000);
      console.error("Failed to get mapping:", error);
    }
  };

  useEffect(() => {
    if (address) {
      let retries = 0;
      getMapping(address, retries).then((res) => {
        if (res) {
          fetch(`/api/userData?fid=${res.fid}`)
            .then((response) => response.json())
            .then((data) => {
              setProfileData(data);
            })
            .catch((error) => {
              console.error("Error fetching user data:", error);
            });
        }
      });
    }
  }, [address]);

  return (
    <div
      style={{
        padding: "20px",
        margin: "auto",
        textAlign: "center",
      }}
    >
      {isConnected ? (
        <div>
          {profileData ? (
            <ProfileCard profileData={profileData} />
          ) : (
            <p>
              {errorMessage ? errorMessage : "Fetching Farcaster profile..."}
            </p>
          )}
        </div>
      ) : (
        <div>
          <p
            style={{
              marginBottom: "15px",
              fontSize: "1.2rem",
            }}
          >
            Connect to Starknet to view your Farcaster profile
          </p>
          <button
            onClick={connectWallet}
            style={{
              padding: "10px 15px",
              cursor: "pointer",
              backgroundColor: "black",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Connect wallet
          </button>
        </div>
      )}
    </div>
  );
}

const ProfileCard = ({ profileData }: any) => {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        textAlign: "center",
        maxWidth: "300px",
        margin: "auto",
      }}
    >
      {!profileData.pfp &&
        !profileData.username &&
        !profileData.bio &&
        !profileData.display && (
          <div>
            <p>No Farcaster profile connected to this address yet.</p>
            <p>
              Connect Farcaster to Starknet{" "}
              <Link href="https://warpcast.com/tjelailah/0xae04135d">here</Link>{" "}
              to view your Farcaster profile
            </p>
          </div>
        )}

      {profileData.pfp && (
        <img
          src={profileData.pfp}
          alt="Profile"
          width={100}
          height={100}
          style={{ borderRadius: "50%" }}
        />
      )}
      <h3>{profileData.username}</h3>
      <p>{profileData.bio}</p>
      <p>{profileData.display}</p>
    </div>
  );
};
