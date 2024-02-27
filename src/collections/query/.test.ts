/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import weaviate, { WeaviateNextClient } from '../../index.node';
import { Collection } from '../collection';
import { CrossReference, Reference } from '../references';
import { GroupByOptions, Vector } from '../types';

describe('Testing of the collection.query methods with a simple collection', () => {
  let client: WeaviateNextClient;
  let collection: Collection<TestCollectionQueryMinimalOptions>;
  const className = 'TestCollectionQueryMinimalOptions';
  let id: string;
  let vector: number[];

  type TestCollectionQueryMinimalOptions = {
    testProp: string;
  };

  afterAll(() => {
    return client.collections.delete(className).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.client({
      rest: {
        secure: false,
        host: 'localhost',
        port: 8080,
      },
      grpc: {
        secure: false,
        host: 'localhost',
        port: 50051,
      },
    });
    collection = client.collections.get(className);
    id = await client.collections
      .create({
        name: className,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        vectorizer: weaviate.configure.vectorizer.text2VecContextionary({ vectorizeClassName: false }),
      })
      .then(() => {
        return collection.data.insert({
          properties: {
            testProp: 'test',
          },
        });
      });
    const res = await collection.query.fetchObjectById(id, { includeVector: true });
    vector = res?.vectors.default!;
  });

  it('should fetch an object by its id', async () => {
    const object = await collection.query.fetchObjectById(id);
    expect(object?.properties.testProp).toEqual('test');
    expect(object?.uuid).toEqual(id);
  });

  it('should query without search', async () => {
    const ret = await collection.query.fetchObjects();
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query without search specifying return properties', async () => {
    const ret = await collection.query.fetchObjects({
      returnProperties: ['testProp'],
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with bm25', async () => {
    const ret = await collection.query.bm25('test');
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with hybrid', async () => {
    const ret = await collection.query.hybrid('test');
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with nearObject', async () => {
    const ret = await collection.query.nearObject(id);
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with nearText', async () => {
    const ret = await collection.query.nearText(['test']);
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with nearVector', async () => {
    const ret = await collection.query.nearVector(vector);
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
  });
});

describe('Testing of the collection.query methods with a collection with a reference property', () => {
  let client: WeaviateNextClient;
  let collection: Collection<TestCollectionQueryWithRefProp>;
  const className = 'TestCollectionQueryWithRefProp';

  let id1: string;
  let id2: string;

  type TestCollectionQueryWithRefProp = {
    testProp: string;
    refProp?: CrossReference<TestCollectionQueryWithRefProp>;
  };

  afterAll(() => {
    return client.collections.delete(className).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.client({
      rest: {
        secure: false,
        host: 'localhost',
        port: 8080,
      },
      grpc: {
        secure: false,
        host: 'localhost',
        port: 50051,
      },
    });
    collection = client.collections.get(className);
    return client.collections
      .create({
        name: className,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
            vectorizePropertyName: false,
          },
        ],
        references: [
          {
            name: 'refProp',
            targetCollection: className,
          },
        ],
        vectorizer: weaviate.configure.vectorizer.text2VecContextionary({ vectorizeClassName: false }),
      })
      .then(async () => {
        id1 = await collection.data.insert({
          properties: {
            testProp: 'test',
          },
        });
        id2 = await collection.data.insert({
          properties: {
            testProp: 'other',
          },
          references: {
            refProp: Reference.to<TestCollectionQueryWithRefProp>(id1),
          },
        });
      });
  });

  describe('using a non-generic collection', () => {
    it('should query without searching returning the referenced object', async () => {
      const ret = await client.collections.get(className).query.fetchObjects({
        returnProperties: ['testProp'],
        returnReferences: [
          {
            linkOn: 'refProp',
            returnProperties: ['testProp'],
            returnReferences: [
              {
                linkOn: 'refProp',
                returnProperties: ['testProp'],
              },
            ],
          },
        ],
      });
      ret.objects.sort((a, b) => a.properties.testProp.localeCompare(b.properties.testProp));
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects[0].properties.testProp).toEqual('other');
      expect(ret.objects[0].references?.refProp?.objects[0].properties?.testProp).toEqual('test');
      expect(ret.objects[0].references?.refProp?.objects[0].references).toBeUndefined();
      expect(ret.objects[1].properties.testProp).toEqual('test');
      expect(ret.objects[1].references?.refProp).toBeUndefined();
    });
  });

  describe('using a generic collection', () => {
    it('should query without searching returning the referenced object', async () => {
      const ret = await collection.query.fetchObjects({
        returnProperties: ['testProp'],
        returnReferences: [
          {
            linkOn: 'refProp',
            returnProperties: ['testProp'],
            returnReferences: [
              {
                linkOn: 'refProp',
                returnProperties: ['testProp'],
              },
            ],
          },
        ],
      });
      ret.objects.sort((a, b) => a.properties.testProp.localeCompare(b.properties.testProp));
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects[0].properties.testProp).toEqual('other');
      expect(ret.objects[0].references?.refProp?.objects[0].properties?.testProp).toEqual('test');
      expect(ret.objects[0].references?.refProp?.objects[0].references).toBeUndefined();
      expect(ret.objects[1].properties.testProp).toEqual('test');
      expect(ret.objects[1].references?.refProp).toBeUndefined();
    });

    it('should query with bm25 returning the referenced object', async () => {
      const ret = await collection.query.bm25('other', {
        returnProperties: ['testProp'],
        returnReferences: [
          {
            linkOn: 'refProp',
            returnProperties: ['testProp'],
          },
        ],
      });
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects.map((obj) => obj.properties.testProp).includes('other')).toEqual(true);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects.length
      ).toEqual(1);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects[0]
          .properties?.testProp
      ).toEqual('test');
    });

    it('should query with hybrid returning the referenced object', async () => {
      const ret = await collection.query.hybrid('other', {
        returnProperties: ['testProp'],
        returnReferences: [
          {
            linkOn: 'refProp',
            returnProperties: ['testProp'],
          },
        ],
      });
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects.map((obj) => obj.properties.testProp).includes('other')).toEqual(true);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects.length
      ).toEqual(1);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects[0]
          .properties?.testProp
      ).toEqual('test');
    });

    it('should query with nearObject returning the referenced object', async () => {
      const ret = await collection.query.nearObject(id2, {
        returnProperties: ['testProp'],
        returnReferences: [
          {
            linkOn: 'refProp',
            returnProperties: ['testProp'],
          },
        ],
      });
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects.map((obj) => obj.properties.testProp).includes('other')).toEqual(true);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects.length
      ).toEqual(1);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects[0]
          .properties?.testProp
      ).toEqual('test');
    });

    it('should fetch an object by its ID returning its references', async () => {
      const res = await collection.query.fetchObjectById(id2, {
        returnReferences: [{ linkOn: 'refProp' }],
      });
      expect(res?.properties.testProp).toEqual('other');
      expect(res?.references?.refProp?.objects.length).toEqual(1);
      expect(res?.references?.refProp?.objects[0].properties?.testProp).toEqual('test');
    });

    it('should query with nearVector returning the referenced object', async () => {
      const res = await collection.query.fetchObjectById(id2, { includeVector: true });
      const ret = await collection.query.nearVector(res?.vectors.default!, {
        returnProperties: ['testProp'],
        returnReferences: [
          {
            linkOn: 'refProp',
            returnProperties: ['testProp'],
          },
        ],
      });
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects.map((obj) => obj.properties.testProp).includes('other')).toEqual(true);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects.length
      ).toEqual(1);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects[0]
          .properties?.testProp
      ).toEqual('test');
    });
  });

  describe('Testing of the collection.query methods with a collection with a nested property', () => {
    let client: WeaviateNextClient;
    let collection: Collection<TestCollectionQueryWithNestedProp>;
    const className = 'TestCollectionQueryWithNestedProp';

    let id1: string;
    let id2: string;

    type TestCollectionQueryWithNestedProp = {
      testProp: string;
      nestedProp?: {
        one: string;
        two: string;
        again?: {
          three: string;
        };
      };
    };

    afterAll(() => {
      return client.collections.delete(className).catch((err) => {
        console.error(err);
        throw err;
      });
    });

    beforeAll(async () => {
      client = await weaviate.client({
        rest: {
          secure: false,
          host: 'localhost',
          port: 8080,
        },
        grpc: {
          secure: false,
          host: 'localhost',
          port: 50051,
        },
      });
      collection = client.collections.get(className);
      return client.collections
        .create({
          name: className,
          properties: [
            {
              name: 'testProp',
              dataType: 'text',
              vectorizePropertyName: false,
            },
            {
              name: 'nestedProp',
              dataType: 'object',
              vectorizePropertyName: false,
              nestedProperties: [
                {
                  name: 'one',
                  dataType: 'text',
                },
                {
                  name: 'two',
                  dataType: 'text',
                },
                {
                  name: 'again',
                  dataType: 'object',
                  nestedProperties: [
                    {
                      name: 'three',
                      dataType: 'text',
                    },
                  ],
                },
              ],
            },
          ],
          vectorizer: weaviate.configure.vectorizer.text2VecContextionary({ vectorizeClassName: false }),
        })
        .then(async () => {
          id1 = await collection.data.insert({
            properties: {
              testProp: 'test',
            },
          });
          id2 = await collection.data.insert({
            properties: {
              testProp: 'other',
              nestedProp: {
                one: 'test',
                two: 'test',
                again: {
                  three: 'test',
                },
              },
            },
          });
        });
    });

    it('should query without searching returning the referenced object', async () => {
      const ret = await collection.query.fetchObjects({
        returnProperties: [
          'testProp',
          {
            name: 'nestedProp',
            properties: [
              'one',
              {
                name: 'again',
                properties: ['three'],
              },
            ],
          },
        ],
      });
      ret.objects.sort((a, b) => a.properties.testProp.localeCompare(b.properties.testProp));
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects[0].properties.testProp).toEqual('other');
      expect(ret.objects[0].properties.nestedProp?.one).toEqual('test');
      expect(ret.objects[0].properties.nestedProp?.two).toBeUndefined();
      expect(ret.objects[0].properties.nestedProp?.again?.three).toEqual('test');
      expect(ret.objects[1].properties.testProp).toEqual('test');
      expect(ret.objects[1].properties.nestedProp).toBeUndefined();
    });
  });

  describe('Testing of the collection.query methods with a collection with multiple vectors', () => {
    let client: WeaviateNextClient;
    let collection: Collection<TestCollectionQueryWithMultiVector, Vectors>;
    const className = 'TestCollectionQueryWithMultiVector';

    let id1: string;
    let id2: string;

    type TestCollectionQueryWithMultiVector = {
      title: string;
    };
    type Vectors = ['title'];

    afterAll(() => {
      return client.collections.delete(className).catch((err) => {
        console.error(err);
        throw err;
      });
    });

    beforeAll(async () => {
      client = await weaviate.client({
        rest: {
          secure: false,
          host: 'localhost',
          port: 8080,
        },
        grpc: {
          secure: false,
          host: 'localhost',
          port: 50051,
        },
      });
      collection = client.collections.get(className);
      return client.collections
        .create<TestCollectionQueryWithMultiVector, Vectors>({
          name: className,
          properties: [
            {
              name: 'title',
              dataType: 'text',
              vectorizePropertyName: false,
            },
          ],
          vectorizer: [weaviate.configure.namedVectorizer.make('title', 'hnsw', 'text2vec-contextionary')],
        })
        .then(async () => {
          id1 = await collection.data.insert({
            properties: {
              title: 'test',
            },
          });
          id2 = await collection.data.insert({
            properties: {
              title: 'other',
            },
          });
        });
    });

    it('should query without searching returning named vector', async () => {
      const ret = await collection.query.fetchObjects({
        returnProperties: ['title'],
        includeVector: ['title'],
      });
      ret.objects.sort((a, b) => a.properties.title.localeCompare(b.properties.title));
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects[0].properties.title).toEqual('other');
      expect(ret.objects[0].vectors.title).toBeDefined();
      expect(ret.objects[1].properties.title).toEqual('test');
      expect(ret.objects[1].vectors.title).toBeDefined();
    });

    it('should query with a vector search over the named vector space', async () => {
      const ret = await collection.query.nearObject(id1, {
        returnProperties: ['title'],
        targetVector: 'title',
      });
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects[0].properties.title).toEqual('test');
      expect(ret.objects[1].properties.title).toEqual('other');
    });
  });
});

describe('Testing of the groupBy collection.query methods with a simple collection', () => {
  let client: WeaviateNextClient;
  let collection: Collection<TestCollectionGroupBySimple>;
  const className = 'TestCollectionGroupBySimple';
  let id: string;
  let vector: number[];

  type TestCollectionGroupBySimple = {
    testProp: string;
  };

  const groupByArgs: GroupByOptions<TestCollectionGroupBySimple> = {
    numberOfGroups: 1,
    objectsPerGroup: 1,
    property: 'testProp',
  };

  afterAll(() => {
    return client.collections.delete(className).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.client({
      rest: {
        secure: false,
        host: 'localhost',
        port: 8080,
      },
      grpc: {
        secure: false,
        host: 'localhost',
        port: 50051,
      },
    });
    collection = client.collections.get(className);
    id = await client.collections
      .create({
        name: className,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        vectorizer: weaviate.configure.vectorizer.text2VecContextionary({ vectorizeClassName: false }),
      })
      .then(() => {
        return collection.data.insert({
          properties: {
            testProp: 'test',
          },
        });
      });
    const res = await collection.query.fetchObjectById(id, { includeVector: true });
    vector = res?.vectors.default!;
  });

  // it('should groupBy without search', async () => {
  //   const ret = await collection.groupBy.fetchObjects(groupByArgs);
  //   expect(ret.objects.length).toEqual(1);
  //   expect(ret.groups).toBeDefined();
  //   expect(Object.keys(ret.groups)).toEqual(['test']);
  //   expect(ret.objects[0].properties.testProp).toEqual('test');
  //   expect(ret.objects[0].metadata.uuid).toEqual(id);
  //   expect(ret.objects[0].belongsToGroup).toEqual('test');
  // });

  // it('should groupBy without search specifying return properties', async () => {
  //   const ret = await collection.groupBy.fetchObjects({
  //     returnProperties: ['testProp'],
  //     returnMetadata: ['uuid'],
  //     ...groupByArgs,
  //   });
  //   expect(ret.objects.length).toEqual(1);
  //   expect(ret.groups).toBeDefined();
  //   expect(Object.keys(ret.groups)).toEqual(['test']);
  //   expect(ret.objects[0].properties.testProp).toEqual('test');
  //   expect(ret.objects[0].metadata.uuid).toEqual(id);
  //   expect(ret.objects[0].belongsToGroup).toEqual('test');
  // });

  // it('should groupBy with bm25', async () => {
  //   const ret = await collection.groupBy.bm25({
  //     query: 'test',
  //     ...groupByArgs,
  //   });
  //   expect(ret.objects.length).toEqual(1);
  //   expect(ret.groups).toBeDefined();
  //   expect(Object.keys(ret.groups)).toEqual(['test']);
  //   expect(ret.objects[0].properties.testProp).toEqual('test');
  //   expect(ret.objects[0].metadata.uuid).toEqual(id);
  //   expect(ret.objects[0].belongsToGroup).toEqual('test');
  // });

  // it('should groupBy with hybrid', async () => {
  //   const ret = await collection.groupBy.hybrid({
  //     query: 'test',
  //     ...groupByArgs,

  //   });
  //   expect(ret.objects.length).toEqual(1);
  //   expect(ret.groups).toBeDefined();
  //   expect(Object.keys(ret.groups)).toEqual(['test']);
  //   expect(ret.objects[0].properties.testProp).toEqual('test');
  //   expect(ret.objects[0].metadata.uuid).toEqual(id);
  //   expect(ret.objects[0].belongsToGroup).toEqual('test');
  // });

  it('should groupBy with nearObject', async () => {
    const ret = await collection.query.nearObject(id, {
      groupBy: groupByArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.groups).toBeDefined();
    expect(Object.keys(ret.groups)).toEqual(['test']);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
  });

  it('should groupBy with nearText', async () => {
    const ret = await collection.query.nearText(['test'], {
      groupBy: groupByArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.groups).toBeDefined();
    expect(Object.keys(ret.groups)).toEqual(['test']);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
  });

  it('should groupBy with nearVector', async () => {
    const ret = await collection.query.nearVector(vector, {
      groupBy: groupByArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.groups).toBeDefined();
    expect(Object.keys(ret.groups)).toEqual(['test']);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
  });
});
