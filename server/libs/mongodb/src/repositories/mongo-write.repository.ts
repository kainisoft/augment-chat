import { Filter, UpdateFilter, WithId } from 'mongodb';
import { AbstractMongoRepository } from './mongo-base.repository';
import { BaseDocument } from '../schemas/chat.schema';

/**
 * Abstract MongoDB Write Repository
 *
 * Extends the base repository with write operations (create, update, delete).
 * Follows the same patterns as our Drizzle-based write repositories.
 *
 * @typeParam T - The entity type
 * @typeParam TId - The entity ID type
 * @typeParam TDocument - The MongoDB document type
 */
export abstract class AbstractMongoWriteRepository<
  T,
  TId,
  TDocument extends BaseDocument,
> extends AbstractMongoRepository<T, TId, TDocument> {
  /**
   * Save an entity (create or update)
   * @param entity - The entity to save
   */
  async save(entity: T): Promise<void> {
    const id = this.getEntityId(entity);
    const exists = await this.exists(id);

    if (exists) {
      await this.update(id, entity);
    } else {
      await this.create(entity);
    }
  }

  /**
   * Create a new entity
   * @param entity - The entity to create
   * @returns The created entity
   */
  async create(entity: T): Promise<T> {
    const document = this.mapToPersistence(entity);

    const result = await this.collection.insertOne(document as any);

    // Return the entity with the generated ID
    const createdDocument = {
      ...document,
      _id: result.insertedId,
    } as WithId<TDocument>;

    return this.mapToDomain(createdDocument);
  }

  /**
   * Create multiple entities
   * @param entities - The entities to create
   * @returns The created entities
   */
  async createMany(entities: T[]): Promise<T[]> {
    if (entities.length === 0) {
      return [];
    }

    const documents = entities.map((entity) => this.mapToPersistence(entity));

    const result = await this.collection.insertMany(documents as any);

    // Return the entities with generated IDs
    return documents.map((doc, index) => {
      const createdDocument = {
        ...doc,
        _id: result.insertedIds[index],
      } as WithId<TDocument>;

      return this.mapToDomain(createdDocument);
    });
  }

  /**
   * Update an existing entity
   * @param id - The entity ID
   * @param entity - The entity with updated values
   * @returns The updated entity
   */
  async update(id: TId, entity: Partial<T> | T): Promise<T> {
    const objectId = this.toObjectId(id);
    const updateData = this.mapToPersistence(entity as T);

    // Remove _id from update data to avoid conflicts
    const { _id, ...updateFields } = updateData as any;

    const result = await this.collection.findOneAndUpdate(
      { _id: objectId } as Filter<TDocument>,
      { $set: updateFields } as UpdateFilter<TDocument>,
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new Error(`Entity with id ${id} not found for update`);
    }

    return this.mapToDomain(result);
  }

  /**
   * Update multiple entities by filter
   * @param filter - MongoDB filter
   * @param update - Update operations
   * @returns Number of updated documents
   */
  async updateMany(
    filter: Filter<TDocument>,
    update: UpdateFilter<TDocument>,
  ): Promise<number> {
    const result = await this.collection.updateMany(filter, update);
    return result.modifiedCount;
  }

  /**
   * Delete an entity
   * @param id - The entity ID
   */
  async delete(id: TId): Promise<void> {
    const objectId = this.toObjectId(id);

    const result = await this.collection.deleteOne({
      _id: objectId,
    } as Filter<TDocument>);

    if (result.deletedCount === 0) {
      throw new Error(`Entity with id ${id} not found for deletion`);
    }
  }

  /**
   * Delete multiple entities by filter
   * @param filter - MongoDB filter
   * @returns Number of deleted documents
   */
  async deleteMany(filter: Filter<TDocument>): Promise<number> {
    const result = await this.collection.deleteMany(filter);
    return result.deletedCount;
  }

  /**
   * Upsert an entity (update if exists, create if not)
   * @param filter - Filter to find the entity
   * @param entity - The entity data
   * @returns The upserted entity
   */
  async upsert(filter: Filter<TDocument>, entity: T): Promise<T> {
    const updateData = this.mapToPersistence(entity);

    const result = await this.collection.findOneAndUpdate(
      filter,
      { $set: updateData } as UpdateFilter<TDocument>,
      { upsert: true, returnDocument: 'after' },
    );

    if (!result) {
      throw new Error('Upsert operation failed');
    }

    return this.mapToDomain(result);
  }

  /**
   * Replace an entire document
   * @param id - The entity ID
   * @param entity - The replacement entity
   * @returns The replaced entity
   */
  async replace(id: TId, entity: T): Promise<T> {
    const objectId = this.toObjectId(id);
    const document = this.mapToPersistence(entity);

    const result = await this.collection.findOneAndReplace(
      { _id: objectId } as Filter<TDocument>,
      document as TDocument,
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new Error(`Entity with id ${id} not found for replacement`);
    }

    return this.mapToDomain(result);
  }

  /**
   * Increment a numeric field
   * @param id - The entity ID
   * @param field - The field to increment
   * @param value - The increment value (default: 1)
   * @returns The updated entity
   */
  async increment(id: TId, field: string, value: number = 1): Promise<T> {
    const objectId = this.toObjectId(id);

    const result = await this.collection.findOneAndUpdate(
      { _id: objectId } as Filter<TDocument>,
      { $inc: { [field]: value } } as UpdateFilter<TDocument>,
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new Error(`Entity with id ${id} not found for increment`);
    }

    return this.mapToDomain(result);
  }

  /**
   * Add item to array field
   * @param id - The entity ID
   * @param field - The array field name
   * @param value - The value to add
   * @returns The updated entity
   */
  async addToArray(id: TId, field: string, value: any): Promise<T> {
    const objectId = this.toObjectId(id);

    const result = await this.collection.findOneAndUpdate(
      { _id: objectId } as Filter<TDocument>,
      { $push: { [field]: value } } as UpdateFilter<TDocument>,
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new Error(`Entity with id ${id} not found for array update`);
    }

    return this.mapToDomain(result);
  }

  /**
   * Remove item from array field
   * @param id - The entity ID
   * @param field - The array field name
   * @param value - The value to remove
   * @returns The updated entity
   */
  async removeFromArray(id: TId, field: string, value: any): Promise<T> {
    const objectId = this.toObjectId(id);

    const result = await this.collection.findOneAndUpdate(
      { _id: objectId } as Filter<TDocument>,
      { $pull: { [field]: value } } as UpdateFilter<TDocument>,
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new Error(`Entity with id ${id} not found for array update`);
    }

    return this.mapToDomain(result);
  }
}
