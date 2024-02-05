import { StarknetProvider } from "@/components/starknet-provider";
import Profile from "@/components/profile";

export default function Home() {
  return (
    <StarknetProvider>
      <Profile />
    </StarknetProvider>
  );
}
