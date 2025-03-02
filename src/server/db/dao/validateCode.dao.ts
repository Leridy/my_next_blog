import { ValidateCode as VC } from '../models/validateCode';
import { validateCode } from '@prisma/client';

export class ValidateCodeDao {
  public async clearTimeoutValidateCode(): Promise<void> {
    await VC.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 1000 * 60 * 10),
        },
      },
    });
  }

  public async createValidateCode(
    data: Omit<validateCode, 'id' | 'createdAt'>
  ): Promise<validateCode> {
    return VC.create({
      data,
    });
  }

  public async getValidateCodeBySessionId(
    sessionId: string
  ): Promise<validateCode | null> {
    return VC.findFirst({
      where: {
        sessionId,
      },
    });
  }

  public async getValidateCode(
    query: Partial<validateCode>
  ): Promise<validateCode | null> {
    return VC.findFirst({
      where: {
        ...query,
        validate: query.validate,
      },
    });
  }

  public async updateValidateCode(data: validateCode): Promise<validateCode> {
    return VC.update({
      where: {
        id: data.id,
      },
      data: data,
    });
  }

  public async deleteValidateCode(id: string): Promise<validateCode> {
    return VC.delete({
      where: {
        id: Number(id),
      },
    });
  }
}

const validateCodeDao = new ValidateCodeDao();
export default validateCodeDao;
