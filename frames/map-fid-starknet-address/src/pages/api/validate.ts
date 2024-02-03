import type { NextApiRequest, NextApiResponse } from "next";
import { Message } from "@farcaster/hub-nodejs";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // validate the message
    const messageBytes = req.body["messageBytes"];
    if (!messageBytes) {
      return res.status(400).send("Missing messageBytes");
    }

    let validatedMessage: Message | undefined = undefined;
    try {
      const buffer = Buffer.from(messageBytes, "hex");
      const response = await axios.post(
        "https://nemes.farcaster.xyz:2281/v1/validateMessage",
        buffer,
        {
          headers: { "Content-Type": "application/octet-stream" },
        }
      );

      if (response && response.data && response.data.valid) {
        validatedMessage = response.data.message;
      }

      // Also validate the frame url matches the expected url
      let urlBuffer = validatedMessage?.data?.frameActionBody?.url || [];
      const urlString = atob(urlBuffer.toString());
      if (
        validatedMessage &&
        !urlString.startsWith(process.env["BASE_URL"] || "")
      ) {
        res.status(400).json({ error: `invalid frame url: ${urlString}` });
      }

      const fid = validatedMessage?.data?.fid;
      if (!fid && fid !== 0) {
        res.status(400).json({ error: "Invalid fid" });
      }
      res
        .status(200)
        .json({ fid: fid, timestamp: validatedMessage?.data?.timestamp });
    } catch (e) {
      res.status(400).json({ error: `Failed to validate message: ${e}` });
    }
  } else {
    // Handle any non-POST requests
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
