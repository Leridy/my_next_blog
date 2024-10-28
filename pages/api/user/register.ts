import {NextApiRequest, NextApiResponse} from "next";
import * as Yup from 'yup';
import {encryptWithSalt} from "@/server/middleware";
import {ValidationError} from "yup";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') res.status(405).json({message: 'Method Not Allowed', allowedMethods: ['POST'],});

  const schema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required(),
    username: Yup.string().required(),
    password2: Yup.string().required().equals([Yup.ref('password')]),
  });

  try {
    await schema.validate(req.body);
    res.status(200).json({message: 'success'});
  } catch (e) {
    res.status(400).json((e as ValidationError).errors);
    return;
  }
}

export default encryptWithSalt(handler);
