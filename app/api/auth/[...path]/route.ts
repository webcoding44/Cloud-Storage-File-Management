import { auth } from "@/src/auth/server";

export const { GET, POST, PUT, PATCH, DELETE } = auth.handler();
