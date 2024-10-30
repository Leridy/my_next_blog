import {NextApiRequest, NextApiResponse} from "next";
import { Role, validationAuthToken} from "@/server/middlewares";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') res.status(405).json({
    message: `Method ${req.method} Not Allowed`,
    allowedMethods: ['POST'],
  });

  try {
    // remove token in cookie
    res.setHeader('Set-Cookie', `token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;`);
    res.status(200).json({message: 'logout success'});
  } catch (e) {
    res.status(400).json(e);
    return;
  }
}

export default validationAuthToken(handler, {validateMethod: ['POST'], role: Role.USER });
