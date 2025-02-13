import { createHash } from "crypto";
import { auth } from "@/app/auth";

export const userSession = async (): Promise<UserModel | null> => {
  const session = await auth();
  if (session && session.user) {
    return {
      name: session.user.name!,
      image: session.user.image!,
      email: session.user.email!
    };
  }
  return null;
};

export const getCurrentUser = async (): Promise<UserModel> => {
  const user = await userSession();
  if (user) {
    return user;
  }
  throw new Error("User not found");
};

export const userHashedId = async (): Promise<string> => {
  const user = await userSession();
  if (user) {
    return hashValue(user.email);
  }

  throw new Error("User not found");
};

export const hashValue = (value: string): string => {
  const hash = createHash("sha256");
  hash.update(value);
  return hash.digest("hex");
};

export type UserModel = {
  name: string;
  image: string;
  email: string;
};
