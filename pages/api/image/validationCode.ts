import {NextApiRequest, NextApiResponse} from "next";
import {validateCodeGen} from "../../../utils/randomStringGen";
import {hashPassword} from "@/server/middlewares";
import env from "../../../.project.json";
import Sharp from 'sharp';
import validateCodeDao from "@/server/db/dao/validateCode.dao";
import {validateCode} from "@prisma/client";

// I need some color to generate the image
/**
 * background color should be some deep colors
 * line color should be some light colors
 * code color should be some bright colors
 * font should be some common fonts
 **/
const backgroundColors = ['#1A3636', '#2C7873', '#4A628A', '#EE6C4D'];
const lineColors: string[] = ['#F95959', '#F9A03F', '#F9F871', '#A3DE83', '#5ECC62'];
const codeColors: string[] = ['#F95959', '#F9A03F', '#F9F871', '#A3DE83', '#5ECC62'];
const fonts: string[] = ['Arial', 'Helvetica', 'sans-serif', 'monospace', 'cursive'];

const ONE_MINUTE = 1000 * 60;
const FIVE_MINUTES = ONE_MINUTE * 5;

const generateValidateCodeImage = (code: string) => {
  const width = 200;
  const height = 60;
  const backgroundColor = code === 'exceeded limit' ? '#FF0000' : backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
  const font = fonts[Math.floor(Math.random() * fonts.length)];
  const fontSize = 30;
  const color = lineColors[Math.floor(Math.random() * lineColors.length)];
  const codeColor = codeColors[Math.floor(Math.random() * codeColors.length)];

  const svgText = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="${backgroundColor}" />
      <text
        x="${width / 2}"
        y="${height / 2}"
        transform="rotate(${Math.random() * 10 - 5} ${width / 2} ${height / 2})"
       dominant-baseline="middle" text-anchor="middle" font-family="${font}" font-size="${fontSize}" fill="${codeColor}">${code}</text>
        <g stroke="${color}">
            <line x1="${Math.random() * width}" y1="${Math.random() * height}" x2="${Math.random() * width}" y2="${Math.random() * height}" />
            <line x1="${Math.random() * width}" y1="${Math.random() * height}" x2="${Math.random() * width}" y2="${Math.random() * height}" />
            <line x1="${Math.random() * width}" y1="${Math.random() * height}" x2="${Math.random() * width}" y2="${Math.random() * height}" />
            <line x1="${Math.random() * width}" y1="${Math.random() * height}" x2="${Math.random() * width}" y2="${Math.random() * height}" />
            <line x1="${Math.random() * width}" y1="${Math.random() * height}" x2="${Math.random() * width}" y2="${Math.random() * height}" />
        </g>
    </svg>
  `;

  return Sharp(Buffer.from(svgText)).png().toBuffer();

}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') res.status(405).json({message: `Method ${req.method} Allowed`, allowedMethods: ['GET'],});

    // 检查是否存在 sessionId
    let sessionId = req.cookies.sessionId;
    // 是否是新的会话
    let isNewSession = false;
    let data: validateCode | null = null;
    const requestLimit = 10;
    let isReachRequestLimit = false;
    let isCodeOutdated = false;

    await validateCodeDao.clearTimeoutValidateCode();

    if (!sessionId) {
      // 如果不存在 sessionId 则生成一个 sessionId, 并且清除所有超过十分钟的验证码
      // figerprint 是一个唯一标识符来自客户端的 ua 和 ip 和 时间戳
      const userFingerprint = req.headers['user-agent'] || '' + req.socket.remoteAddress || '' + Date.now() as string;
      sessionId = hashPassword(userFingerprint, env.SESSION_SECRET);
      isNewSession = true;
    } else {
      // 检查是否存在这个 sessionId 检查这个 sessionId 对应的 validate 请求次数是否超过限制
      // 限制为五分钟内十次， 超过限制则返回错误
      data = await validateCodeDao.getValidateCodeBySessionId(sessionId);

      if (data) {
        if (Date.now() - data.createdAt.getTime() < FIVE_MINUTES && data.requestTime >= requestLimit) {
          isReachRequestLimit = true;
        } else if (Date.now() - data.createdAt.getTime() > FIVE_MINUTES) {
          await validateCodeDao.deleteValidateCode(String(data.id));
          isCodeOutdated = true;
        }
      }
    }

    // 生成一个随机的6位数验证码
    const code = isReachRequestLimit ? 'exceeded limit' : validateCodeGen(6, false);
    // 生成验证码图片
    const buffer = await generateValidateCodeImage(code);

    if (!isReachRequestLimit) {
      // 如果sessionId 存在 且请求次数未超过限制 则更新这个 sessionId 对应的验证码并更新请求次数， 否则创建一个新的验证码
      if (sessionId && !isCodeOutdated && !isNewSession) {
        if (data) {
          data.validate = code;
          data.requestTime++;
          await validateCodeDao.updateValidateCode(data);
        } else {
          await validateCodeDao.createValidateCode({
            sessionId,
            validate: code,
            requestTime: 1,
          });
        }
      }
    }


    res.setHeader('Content-Type', 'image/png');
    // 设置 cookie 为 sessionId,这个 cookie 在关闭浏览器后失效
    res.setHeader('Set-Cookie', `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Strict;`);
    // 不允许缓存验证码
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    res.send(buffer);
  } catch (e) {
    res.status(500).json({message: 'Internal Server Error', error: e});
  }
}
