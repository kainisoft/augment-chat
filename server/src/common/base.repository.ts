import {
  and,
  eq,
  InferInsertModel,
  InferSelectModel,
  sql,
  SQL,
  Table,
  TableConfig,
} from 'drizzle-orm';
import { PgTableWithColumns } from 'drizzle-orm/pg-core';
import { DrizzleDatabase } from '../database/database.types';

export abstract class BaseRepository<
  TTable extends PgTableWithColumns<any>,
  TSelect extends InferSelectModel<Table<TableConfig>>,
  TInsert extends InferInsertModel<Table<TableConfig>>, // to make sure all required columns are present
> {
  protected constructor(
    protected readonly db: DrizzleDatabase,
    protected readonly table: TTable,
  ) {}

  async findById(id: string): Promise<TSelect | null> {
    const [record] = await this.db
      .select()
      .from(this.table as any)
      .where(eq(this.table.id, id))
      .limit(1);

    return record;
  }

  async exists(id: string): Promise<boolean> {
    const record = await this.findById(id);

    return !!record;
  }

  async count(where: Partial<TSelect> = {}): Promise<number> {
    const conditions: SQL[] = Object.entries(where).map(([key, value]) =>
      eq(this.table[key], value),
    );

    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(this.table as any)
      .where(and(...conditions));

    return Number(result.count);
  }

  async save(data: TInsert): Promise<TSelect> {
    if (data.id) {
      return await this.update(data.id, data);
    }

    const [record] = await this.db.insert(this.table).values(data).returning();

    return record as TSelect;
  }

  async createMany(data: TInsert[]): Promise<TInsert[]> {
    return this.db.insert(this.table).values(data).returning();
  }

  async update(id: string, data: Partial<TInsert>): Promise<TSelect | null> {
    const record = await this.db
      .update(this.table)
      .set(data)
      .where(eq(this.table.id, id))
      .returning();

    if (!record.length) {
      return null;
    }

    return record as TSelect;
  }

  async delete(id: string): Promise<TSelect | null> {
    const [record] = await this.db
      .delete(this.table)
      .where(eq(this.table.id, id))
      .returning();

    return record;
  }
}
