"use client";
import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignTypedData,
} from "@starknet-react/core";
import { useStarknetkitConnectModal } from "starknetkit";
import {
  shortString,
  typedData,
  Contract,
  RpcProvider,
  num,
  Signature,
} from "starknet";
import { timeValid, getAbi } from "@/utils/utils";
import Profile from "@/components/profile";
import { abi, contractAddress } from "../utils/constants";
import { nanoid } from "nanoid";
import { generateStory } from "./generateStory";
import { toast } from "react-toastify";

type FarcasterData = {
  fid: number;
  timestamp: number;
};

function ConnectWallet({ fid, timestamp }: FarcasterData) {
  const [validSignature, setValidSignature] = useState(false);
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);

  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    dappName: "Starknet Farcaster",
  });

  const message: typedData.TypedData = {
    domain: {
      name: "Starknet Farcaster",
      version: "1",
      chainId: shortString.encodeShortString("SN_MAIN"),
    },
    types: {
      StarkNetDomain: [
        { name: "name", type: "felt" },
        { name: "version", type: "felt" },
        { name: "chainId", type: "felt" },
      ],
      Verification: [
        { name: "fid", type: "felt" },
        { name: "timestamp", type: "felt" },
      ],
    },
    message: {
      fid,
      timestamp,
    },
    primaryType: "Verification",
  };
  const { data, signTypedData, isPending } = useSignTypedData(message);

  const connectWallet = async () => {
    const { connector } = await starknetkitConnectModal();
    await connect({ connector });
  };

  const disconnectWallet = async () => {
    await disconnect();
  };

  const { account, status } = useAccount();
  const contract = new Contract(abi, contractAddress);
  const provider = new RpcProvider({
    nodeUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_6",
  });

  const getRandomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min)) + min;

  const mintFunction = async () => {
    console.log("Minting");

    setIsMinting(true);

    const fetchingABI = await getAbi(provider, contractAddress);
    const contract = new Contract(abi, contractAddress, account);

    const name = await contract.name();
    console.log("Name:", name);

    const demoURL = "http://tinyurl.com/yc4ajenr";

    const tokenURI = num.hexToDecimalString(
      shortString.encodeShortString(demoURL)
    );

    const storyLine = (await generateStory({
      farcasterId: fid.toString(),
    })) as string;

    console.log("Storyline:", storyLine);

    const feltStoryLine = string_to_feltArray(storyLine);
    // convert feltStoryline to array

    const feltStoryLineArray = feltStoryLine.split(",").map(Number);

    const tx = await contract.safeMint(
      address, // recipient
      getRandomInt(999, 99999), // token id
      feltStoryLineArray, // data in felt
      tokenURI // token URI in felt
    );

    if (tx) {
      toast("Minted successfully, here is the transaction", {
        onClick: () => {
          window.location.href = `https://starkscan.co/tx/${tx.transaction_hash}`;
        },
      });
      setIsMinting(false);
    }
  };

  const string_to_feltArray = (str: string) => {
    str = str
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0) + ",", "")
      .slice(0, -1);

    return str;
  };

  const addMapping = async (fid: number, starknetAddress: string) => {
    try {
      const response = await fetch("/api/addMapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid, starknetAddress }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    } catch (error) {
      console.error("Failed to add mapping:", error);
    }
  };

  const verifySignature = async (
    contractAddress: string,
    signature: Signature
  ) => {
    const provider = new RpcProvider({
      nodeUrl: "https://starknet-testnet.public.blastapi.io/rpc/v0_6",
    });

    try {
      const abi = await getAbi(provider, contractAddress);

      const contract = new Contract(abi, contractAddress, provider);
      const msgHash = typedData.getMessageHash(message, contractAddress);

      await contract.isValidSignature(msgHash, signature);
      setValidSignature(true);
      // Store the result in a database
      addMapping(fid, contractAddress)
        .then(() => {
          console.log("Mapping added");
          window.alert(
            `Successfully verified ownership of address: ${address}`
          );
        })
        .catch((err) => console.error("Error adding mapping:", err));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (data && address) {
      verifySignature(address!, data);
    }
  }, [data]);

  useEffect(() => {}, []);

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "300px",
        margin: "auto",
        textAlign: "center",
      }}
    >
      {/* {address && <p style={{ marginBottom: "15px" }}>Address: {address}</p>} */}

      {!isConnected ? (
        <button onClick={connectWallet} className="bg-gray-800 p-2 rounded-lg">
          Connect to Starknet
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            onClick={disconnectWallet}
            style={{
              padding: "10px 15px",
              cursor: "pointer",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Disconnect wallet
          </button>
          <button
            className="bg-gray-800 p-2 rounded-lg"
            onClick={() => {
              mintFunction();
            }}
          >
            {isMinting ? "Forging your story..." : "Mint your Story"}
          </button>
        </div>
      )}
    </div>
  );
}

export default ConnectWallet;
