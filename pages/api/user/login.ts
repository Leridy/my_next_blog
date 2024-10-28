import {NextApiRequest, NextApiResponse} from "next";
import * as Yup from 'yup';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') res.status(405).json({message: 'Method Not Allowed', allowedMethods: ['POST'],});

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required(),
  });

  try {
    await schema.validate(req.body);
  } catch (e) {
    res.status(400).json(e);
    return;
  }
}
