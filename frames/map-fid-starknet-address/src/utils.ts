import { RpcProvider, Abi, Contract } from "starknet";

export const BASE_URL = process.env.BASE_URL || "";

export const timeValid = (timestamp: number): boolean => {
  // Farcaster epoch starts on Jan 1, 2021
  const farcasterEpochStart = new Date("2021-01-01T00:00:00Z").getTime() / 1000;
  const currentTimestamp = Math.floor(Date.now() / 1000) - farcasterEpochStart; // Current time in seconds since Farcaster epoch
  const thirtyMinutes = 30 * 60; // 30 minutes in seconds

  return currentTimestamp - timestamp <= thirtyMinutes;
};

export const getAbi = async (
  provider: RpcProvider,
  contractAddress: string
): Promise<Abi> => {
  const classHash = await provider.getClassHashAt(contractAddress);
  const contractClass = await provider.getClass(classHash);
  let abi = contractClass.abi;

  for (const f of abi) {
    // Check if any of the abi functions is named "get_implementation"
    if (f.name === "get_implementation") {
      const contract = new Contract(abi, contractAddress, provider);
      const implementationClassHash = await contract.get_implementation();
      const implementationClass = await provider.getClass(
        implementationClassHash.implementation
      );
      abi = implementationClass.abi;
    }
  }

  return abi;
};
