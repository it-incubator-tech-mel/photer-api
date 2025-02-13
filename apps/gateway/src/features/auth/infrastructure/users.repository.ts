import { Injectable } from '@nestjs/common';
import {UserType} from "../api/dto/User-type";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
@Injectable()
export class UsersRepository {

  constructor() {
  }
  async findByUsername(username: string): Promise<UserType>{
    const userFoundByUsername = await prisma.user.findUnique({
      where: {
        username
      }
    })
    return userFoundByUsername
  }
  async findByEmail(email: string): Promise<UserType>{
    const userFoundByEmail = await prisma.user.findUnique({
      where: {
        email
      }
    })
    return userFoundByEmail
  }
  async createUser(username: string,email: string, passwordHash: string): Promise<UserType>{
    const userFoundByEmail = await prisma.user.findUnique({
      where: {
        email
      }
    })
    return userFoundByEmail
  }
}