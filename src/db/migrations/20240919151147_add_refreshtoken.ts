import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("users", (table) => {
    table.string("google_refresh_token").unique();
  });
}

export async function down(knex: Knex): Promise<void> {}
