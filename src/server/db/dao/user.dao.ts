import {User as UserModel} from '../models/user';
import {User} from "@prisma/client";


export class UserDao {
  public async createUser(data: Pick<User, 'email' | 'name' | 'password'>): Promise<Partial<User>> {
    // some logic to get user from database
    return UserModel.create({
      data
    });
  }

  public async updateUser(user: User): Promise<User> {
    // some logic to update user in database
    return UserModel.update({
      where: {
        id: user.id
      },
      data: user
    });
  }

  public async deleteUser(id: string): Promise<User> {
    // some logic to delete user from database
    return UserModel.delete({
      where: {
        id: Number(id)
      }
    });
  }

  public async login(data: Pick<User, 'email'>): Promise<User | null> {
    // some logic to login user
    return UserModel.findUnique({
      where: {
        email: data.email,
      },
    });
  }

  public async getUserById(id: number): Promise<Omit<User, 'password'> | null> {
    // some logic to get user from database
    return UserModel.findUnique({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
      where: {
        id
      }
    });
  }

  public async getUsers(query: Partial<User>): Promise<User[]> {
    // some logic to get users from database
    return UserModel.findMany(
      {
        where: {
          ...query,
          name: {
            contains: query.name,
            mode: 'insensitive'
          },
          email: {
            contains: query.email,
            mode: 'insensitive'
          },
        },
        orderBy: {
          id: 'asc'
        }
      }
    );
  }

  public async updateLastLoginData(data: Pick<User, 'id'>): Promise<void> {
    // some logic to update user last login data
    await UserModel.update({
      where: {
        id: data.id
      },
      data: {
        lastLogin: new Date()
      }
    });
  }
}

export default new UserDao();
