import type {validateCode} from "@prisma/client";
import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";
import validateCodeDao from "@/server/db/dao/validateCode.dao";
import {hashPassword} from "@/server/ApiUtils/encryption";
import {validateCodeGen} from "@/utils/randomStringGen";
import {APIErrorHandler} from "@/utils/MyNRError";
import {ImageResponse} from "@vercel/og";


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
const exceededTextArray = ['exceeded limit', 'too busy', 'try later', '稍后再试', '请求过多'];
const transforms = (height: number, width: number): string => {
  const rotate = Math.random() * 10;
  const translateX = Math.random() * width / 5;
  const translateY = Math.random() * height / 5;
  const skew = `-${Math.random() * 20}deg, ${Math.random() * 20}deg`

  // any more transform can be added here
  const scale = Math.random() * 0.1 + 0.9;
  return `rotate(${rotate}deg) translateX(${translateX}px) translateY(${translateY}px) scale(${scale}) skew(${skew}) `;
}

const ONE_MINUTE = 1000 * 60;
const FIVE_MINUTES = ONE_MINUTE * 5;

const generateValidateCodeImage = (code: string) => {
  const levels = [3, 4, 7];
  const width = 400;
  const height = 120;
  const backgroundColor = exceededTextArray.includes(code) ? '#FF0000' : backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
  const font = fonts[Math.floor(Math.random() * fonts.length)];
  const fontSize = 50;
  const codeColor = codeColors[Math.floor(Math.random() * codeColors.length)];
  const transform = transforms(height, width);
  const level = levels[Math.floor(Math.random() * levels.length)];


  const randomLine = (width: number, height: number) => {
    const svgText = [];
    for (let i = 0; i < 2 * level; i++) {
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      const x2 = Math.random() * width;
      const y2 = Math.random() * height;
      const fill = lineColors[Math.floor(Math.random() * lineColors.length)]
      svgText.push(<line x1={x1} y1={y1} x2={x2} y2={y2} stroke={fill}/>);
    }

    return svgText;
  }
  const randomDot = (width: number, height: number) => {
    const svgText = [];
    for (let i = 0; i < 10 * level; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 3;
      const fill = lineColors[Math.floor(Math.random() * lineColors.length)];
      svgText.push(<circle cx={x} cy={y} r={r} fill={fill}/>);
    }


    return svgText;
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      <rect width={width} height={height} fill={backgroundColor}/>
      <path
        style={{
          transform,
          fontSize,
          textAlign: 'center',
          color: codeColor,
          fontFamily: font,
          zIndex: -1,
        }}
      >{code}</path>
      {randomLine(width, height)}
      {randomDot(width, height)}
    </svg>);
}

async function get(req: NextRequest) {
  let sessionId = req.cookies.get('sessionId')?.value || '';
  let data: validateCode | null = null;
  const requestLimit = 10;
  let isNewSession = false;
  let isReachRequestLimit = false;
  let isCodeOutdated = false;
  const exceededText = exceededTextArray[Math.floor(Math.random() * exceededTextArray.length)];

  await validateCodeDao.clearTimeoutValidateCode();
  if (!sessionId) {
    // if request does not have sessionId, create a new one
    // get some user agent and ip address and timestamp to generate a fingerprint
    // you should know that type of req is NextRequest.
    const userFingerprint = req.headers.get('user-agent') || '' + req.headers.get('remoteAddress') || '' + Date.now() as string;
    const salt = process.env.SESSION_SECRET || '';
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

  const code = isReachRequestLimit ? exceededText : validateCodeGen(6, false);
  const svgText = generateValidateCodeImage(code);

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

  return new ImageResponse(
    svgText

    , {
      width: 400,
      height: 120,
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Strict;`,
        'Cache-Control': 'no-store, max-age=0',
      }
    })
}

export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, get);
