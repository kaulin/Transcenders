export class QueryBuilder {
  static insert(tableName: string, data: Record<string, unknown>) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?');

    return {
      sql: `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
      values,
    };
  }

  static update(
    tableName: string,
    data: Record<string, unknown>,
    whereClause: string,
    whereValues: unknown[] = [],
  ) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setParts = columns.map((col) => `${col} = ?`);

    return {
      sql: `UPDATE ${tableName} SET ${setParts.join(', ')} WHERE ${whereClause}`,
      values: [...values, ...whereValues],
    };
  }
}
