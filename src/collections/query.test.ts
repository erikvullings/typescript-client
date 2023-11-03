/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate from '..';

type TestCollectionQuery = {
  testProp: string;
};

describe('Testing of the query methods', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
    grpcAddress: 'localhost:50051',
  });

  const className = 'TestCollectionQuery';
  let id: string;

  beforeAll(async () => {
    id = await client.collections
      .create({
        name: className,
        properties: [
          {
            name: 'testProp',
            dataType: ['text'],
          },
        ],
      })
      .then(() => {
        const collection = client.collections.get<TestCollectionQuery>(className);
        return collection.data.insert({
          properties: {
            testProp: 'test',
          },
        });
      });
  });

  it('should fetch an object by its id', async () => {
    const collection = client.collections.get<TestCollectionQuery>(className);
    const object = await collection.query.fetchObjectById({ id });
    expect(object.properties.testProp).toEqual('test');
    expect(object.metadata.uuid).toEqual(id);
  });

  it('should fetch all objects with no options', async () => {
    const collection = client.collections.get<TestCollectionQuery>(className);
    const ret = await collection.query.fetchObjects();
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
  });
});
