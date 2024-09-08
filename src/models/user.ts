import knex from '../db/knex';

export const createUser = async (email: string, name: string) => {
  return await knex('users')
    .insert({ email, name })
    .returning('*');
};

export const findUserById = async (id: number) => {
  return await knex('users')
    .where({ id })
    .first();
};

export const findUserByEmail = async (email: string) => {
  return await knex('users')
    .where({ email })
    .first();
};
