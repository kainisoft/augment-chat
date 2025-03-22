import { eq } from 'drizzle-orm';
import { BasePgTable } from 'drizzle-orm/pg-core';
import { DrizzleDatabase } from '../database/database.types';

export interface BaseModel {
  id: string;
}

export abstract class BaseRepository<
  TTable extends BasePgTable,
  TSelect extends BaseModel,
  TInsert extends Omit<Partial<TSelect>, 'id'>,
  TUpdate extends Partial<TSelect>,
> {
  protected constructor(
    protected readonly db: DrizzleDatabase,
    protected readonly table: TTable,
  ) {}

  async findById(id: string): Promise<TSelect | undefined> {
    const [record] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    return record as TSelect;
  }

  async findMany(): Promise<TSelect[]> {
    const records = await this.db.select().from(this.table);

    return records as TSelect[];
  }

  async create(data: TInsert): Promise<TSelect> {
    const [record] = await this.db
      .insert(this.table)
      .values(data as any)
      .returning();

    return record as TSelect;
  }

  async update(id: string, data: TUpdate): Promise<TSelect> {
    const [record] = await this.db
      .update(this.table)
      .set(data as any)
      .where(eq(this.table.id, id))
      .returning();

    return record as TSelect;
  }

  async delete(id: string): Promise<TSelect> {
    const [record] = await this.db
      .delete(this.table)
      .where(eq(this.table.id, id))
      .returning();

    return record as TSelect;
  }
}
