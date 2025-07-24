export function buildInsertQuery(tableName: string, data: Record<string, unknown>) {
  const columns = Object.keys(data);
  const placeholders = columns.map(() => '?');
  const values = Object.values(data);

  return {
    sql: `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
    values,
  };
}
