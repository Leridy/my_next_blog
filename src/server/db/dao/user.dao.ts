import {User as UserModel} from '../models/user';
import {User} from "@prisma/client";

export class UserDao {
  public async createUser(data: User): Promise<User> {
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

  public async getUsers(query: Partial<User>): Promise<User[]> {
    // some logic to get users from database
    return UserModel.findMany(
      {
        where: {
          ...query,
          id: query.id ? Number(query.id) : undefined,
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
}
