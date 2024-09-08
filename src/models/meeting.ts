import knex from '../db/knex';

export const createMeeting = async (userId: number, agenda: string, dateTime: string) => {
  return await knex('meetings').insert({ user_id: userId, agenda, date_time: dateTime }).returning('*');
};

export const getMeetingsByUser = async (userId: number) => {
  return await knex('meetings').where({ user_id: userId }).orderBy('date_time', 'desc');
};
