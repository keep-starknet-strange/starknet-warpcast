import { NextApiRequest, NextApiResponse } from "next";
import { BASE_URL } from "@/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const signedMessage = req.body as {
      untrustedData: {
        fid: number;
        url: string;
        messageHash: string;
        timestamp: number;
        network: number;
        buttonIndex: number;
        castId: { fid: number; hash: string };
      };
      trustedData?: {
        messageBytes: string;
      };
    };

    const messageBytes = signedMessage?.trustedData?.messageBytes;
    res.redirect(302, `${BASE_URL}verify/${messageBytes}`);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
