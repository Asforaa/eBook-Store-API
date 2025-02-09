import { DataSource } from 'typeorm';
import { newDb, DataType } from 'pg-mem';
import { v4 as uuidv4 } from 'uuid';

export async function createTestDataSource(entities: any[]): Promise<DataSource> {
  const db = newDb();

	db.public.registerFunction({
		name: 'current_database',
		args: [],
		returns: DataType.text,
		implementation: () => 'test',
	} as any);


	db.public.registerFunction({
		name: 'version',
		args: [],
		returns: DataType.text,
		implementation: () => 'PostgreSQL 13.3',
	} as any);

	db.registerExtension('uuid-ossp', (schema) => {
		schema.registerFunction({
		  name: 'uuid_generate_v4',
		  returns: DataType.uuid,
		  implementation: uuidv4,
		  impure: true,
		});
	  });


	const ds: DataSource = await db.adapters.createTypeormDataSource({
		type: 'postgres',
		entities,
		// synchronize: false, //fix this
	}) as unknown as DataSource;

  await ds.initialize();
  await ds.synchronize();
  return ds;
}
