/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcryptjs";
import { Request } from "express";
import ApiError from "../../errors/apiError";
import { prisma } from "../../prisma/prisma";
import { PrismaQueryBuilder } from "../../utils/QueryBuilder";
import { UserRole } from "@prisma/client";

const createUser = async (req: Request) => {
  const { password } = req.body;

  const isExistingUser = await prisma.user.findUnique({
    where: {
      email: req.body.email
    }
  })

  if (!password) {
    throw new ApiError(500, "password is required")
  }

  const hashPassword = await bcrypt.hash(password, 10)

  if (isExistingUser) {
    throw new ApiError(403, "User already exists!")
  }



  const result = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      role: req.body.role ?? UserRole.EMPLOYEE,
      profilePicture: "https://i.ibb.co.com/q2gwGfV/356306451-54b19ada-d53e-4ee9-8882-9dfed1bf1396.jpg",
    }
  })

  return result
};


const findUserById = async (id: string) => {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profilePicture: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};


const getAllUsers = async (query: Record<string, any>) => {
  const qb = new PrismaQueryBuilder(query)
    .filter()
    .search(["name", "email"])
    .sort()
    .fields()
    .paginate();

  const prismaQuery = qb.build();

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      ...prismaQuery,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where: prismaQuery.where }),
  ]);

  return {
    meta: qb.getMeta(total),
    data,
  };
};



const getSingleUser = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
};

const userUpdateProfile = async (userId: string, payload: any) => {
  const { name, oldPassword, newPassword } = payload;


  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updateData: any = {};

  // update name
  if (name) {
    updateData.name = name;
  }

  // update password
  if (oldPassword && newPassword) {

    if (!user.password) {
      throw new ApiError(400, "Password not set for this user");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new ApiError(400, "Old password is incorrect");
    }

    updateData.password = await bcrypt.hash(newPassword, 10);
  }


  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return updatedUser;
};

const deleteUser = async (userId: string) => {
  if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }
  return prisma.user.delete({
    where: { id: userId },
  });
};



const changeUserRole = async (id: string, payload: { role: UserRole }) => {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const result = await prisma.user.update({
    where: { id },
    data: {
      role: payload.role,
    },
  });

  return result;
};

export const UserService = {
  createUser,
  getAllUsers,
  findUserById,
  getSingleUser,
  userUpdateProfile,
  deleteUser,
  changeUserRole,
};