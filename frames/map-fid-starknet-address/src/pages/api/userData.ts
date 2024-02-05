import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const extractProfileData = (apiResponse: any) => {
  let profileData = {
    pfp: "",
    username: "",
    bio: "",
    display: "",
  };

  apiResponse.messages.forEach((item: any) => {
    const userData = item.data.userDataBody;
    switch (userData.type) {
      case "USER_DATA_TYPE_PFP":
        profileData.pfp = userData.value;
        break;
      case "USER_DATA_TYPE_USERNAME":
        profileData.username = userData.value;
        break;
      case "USER_DATA_TYPE_BIO":
        profileData.bio = userData.value;
        break;
      case "USER_DATA_TYPE_DISPLAY":
        profileData.display = userData.value;
        break;
      default:
        break;
    }
  });

  return profileData;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract the FID from the query parameters
  const { fid } = req.query;

  try {
    const response = await axios.get(
      `https://nemes.farcaster.xyz:2281/v1/userDataByFid`,
      { params: { fid } }
    );

    const profileData = extractProfileData(response.data);
    res.status(200).json(profileData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
