import { bcryptjs, createUserRepository, type DrizzleDB } from "database";
import { HTTPException } from "hono/http-exception";
import type { SigninRequest, SignupRequest } from "@/schema";

export async function signup(db: DrizzleDB, data: SignupRequest) {
  const userRepository = createUserRepository(db);

  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new HTTPException(400, { message: "User already exists" });
  }

  const passwordHash = await bcryptjs.hash(data.password, 10);

  const user = await userRepository.create({
    email: data.email,
    passwordHash,
  });

  return user;
}

export async function signin(db: DrizzleDB, data: SigninRequest) {
  const userRepository = createUserRepository(db);

  const user = await userRepository.findByEmail(data.email);
  if (!user) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  const isValid = await bcryptjs.compare(data.password, user.passwordHash);
  if (!isValid) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  return user;
}
