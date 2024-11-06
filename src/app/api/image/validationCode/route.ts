import Sharp from 'sharp';
import type {validateCode} from "@prisma/client";
import {NextResponse} from "next/server";
import validateCodeDao from "@/server/db/dao/validateCode.dao";
import {hashPassword} from "@/server/ApiUtils/encryption";
import {validateCodeGen} from "@/utils/randomStringGen";

import type {NextRequest} from "next/server";


// I need some color to generate the image
/**
 * background color should be some deep colors
 * line color should be some light colors
 * code color should be some bright colors
 * font should be some common fonts
 **/
const backgroundColors = ['#1A3636', '#2C7873', '#4A628A', '#EE6C4D', '#1A3636', '#40534C', '#677D6A', '#D6BD98'];
const lineColors: string[] = ['#F95959', '#F9A03F', '#F9F871', '#A3DE83', '#5ECC62', '#FCFFCC', '#FFD7C4', '#FFF4B5'];
const codeColors: string[] = ['#F95959', '#F9A03F', '#F9F871', '#A3DE83', '#5ECC62', '#FCFFCC', '#FFD7C4', '#FFF4B5'];
const fonts: string[] = ['Arial', 'Helvetica', 'sans-serif', 'monospace', 'cursive'];
const transforms = (height: number, width: number): string => {
  const rotate = Math.random() * 10;
  const translateX = Math.random() * width / 5;
  const translateY = Math.random() * height / 5;

  // any more transform can be added here
  const scale = Math.random() * 0.1 + 0.9;
  return `rotate(${rotate} ${translateX} ${translateY}) scale(${scale})`;
}

const ONE_MINUTE = 1000 * 60;
const FIVE_MINUTES = ONE_MINUTE * 5;

const generateValidateCodeImage = (code: string) => {
  const levels = [3, 8, 12];
  const width = 200;
  const height = 60;
  const backgroundColor = code === 'exceeded limit' ? '#FF0000' : backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
  const font = fonts[Math.floor(Math.random() * fonts.length)];
  const fontSize = 30;
  const codeColor = codeColors[Math.floor(Math.random() * codeColors.length)];
  const transform = transforms(height, width);
  const level = levels[Math.floor(Math.random() * levels.length)];


  const randomLine = (width: number, height: number) => {
    let svgText = '';
    for (let i = 0; i < 2 * level; i++) {
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      const x2 = Math.random() * width;
      const y2 = Math.random() * height;
      const fill = lineColors[Math.floor(Math.random() * lineColors.length)]
      svgText += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${fill}" />`;
    }

    return svgText;
  }
  const randomDot = (width: number, height: number) => {
    let svgText = '';
    for (let i = 0; i < 10 * level; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 3;
      const fill = lineColors[Math.floor(Math.random() * lineColors.length)];
      svgText += `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" />`;
    }


    return svgText;
  }

  const svgText = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="${backgroundColor}" />
      <text
        x="${width / 2}"
        y="${height / 2}"
        transform="${transform}"
       dominant-baseline="middle" text-anchor="middle" font-family="${font}" font-size="${fontSize}" fill="${codeColor}">${code}</text>
        ${randomLine(width, height)}
        
        
        ${randomDot(width, height)}    
     
    </svg>
  `;

  return Sharp(Buffer.from(svgText)).png().toBuffer();
}

export async function GET(req: NextRequest) {
  let sessionId = req.cookies.get('sessionId')?.value;
  let data: validateCode | null = null;
  const requestLimit = 10;
  let isNewSession = false;
  let isReachRequestLimit = false;
  let isCodeOutdated = false;

  try {
    await validateCodeDao.clearTimeoutValidateCode();
    if (!sessionId) {
      // if request does not have sessionId, create a new one
      // get some user agent and ip address and timestamp to generate a fingerprint
      // you should know that type of req is NextRequest.
      const userFingerprint = req.headers.get('user-agent') || '' + req.headers.get('remoteAddress') || '' + Date.now() as string;
      const salt= process.env.SESSION_SECRET || '';
      sessionId = hashPassword(userFingerprint, salt);
      isNewSession = true;
    } else {
      // if sessionId exists, check if it reaches the request limit and expired
      data = await validateCodeDao.getValidateCodeBySessionId(sessionId);
      if (data) {
        if (Date.now() - data.createdAt.getTime() < FIVE_MINUTES && data.requestTime >= requestLimit) {
          isReachRequestLimit = true;
        } else if (Date.now() - data.createdAt.getTime() > FIVE_MINUTES) {
          // if the code is outdated, delete it
          await validateCodeDao.deleteValidateCode(String(data.id));
          isCodeOutdated = true;
        }
      }
    }

    const code = isReachRequestLimit ? 'exceeded limit' : validateCodeGen(6, false);
    const buffer = await generateValidateCodeImage(code);

    if (!isReachRequestLimit) { // once the request reaches the limit, do not create a new code
      // if the code is outdated, or it is a new session, create a new code.
      if (isCodeOutdated || isNewSession || !data) {
        await validateCodeDao.createValidateCode({
          sessionId,
          validate: code,
          requestTime: 1,
        });
      } else if (data) {
        // if the code is not outdated, update the code and request time.
        data.validate = code;
        data.requestTime++;
        await validateCodeDao.updateValidateCode(data);
      }
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Strict;`,
        'Cache-Control': 'no-store, max-age=0',
      }
    })

  } catch (e) {
    return NextResponse.json({message: 'Internal Server Error ', error: (e as Error).message}, {status: 500});
  }
}
