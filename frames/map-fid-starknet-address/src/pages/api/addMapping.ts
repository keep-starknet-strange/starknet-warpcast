import type { NextApiRequest, NextApiResponse } from "next";
import { addOrUpdateMapping } from "./db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { fid, starknetAddress } = req.body;

    try {
      await addOrUpdateMapping(fid, starknetAddress);
      res.status(200).json({ message: "Mapping added successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
