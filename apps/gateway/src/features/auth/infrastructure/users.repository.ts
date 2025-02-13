import { Injectable } from '@nestjs/common';
import {UserType} from "../api/dto/User-type";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
@Injectable()
export class UsersRepository {

  constructor() {
  }
  async findByUsername(username: string): Promise<UserType>{
    return prisma.user.findUnique({
      where: {
        username
      }
    })

  }
  async findByEmail(email: string): Promise<UserType>{
    return prisma.user.findUnique({
      where: {
        email
      }
    })
  }
  async findById(id: number): Promise<UserType>{
    return prisma.user.findUnique({
      where: {
        id
      }
    })

  }
  async createUser(username: string,email: string, passwordHash: string): Promise<UserType>{
    return prisma.user.findUnique({
      where: {
        email
      }
    })
  }
}