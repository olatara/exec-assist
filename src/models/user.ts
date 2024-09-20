import db from "../db/knex";

export const createUser = async (
  id: string,
  email: string,
  name: string,
  refreshToken: string
) => {
  const user = await db("users")
    .insert({ google_id: id, email, name, google_refresh_token: refreshToken })
    .returning("*");
  return user[0];
};

export const findUserById = async (id: number) => {
  return await db("users").where({ id }).first();
};

export const findUserByEmail = async (email: string) => {
  return await db("users").where({ email }).first();
};
