import weaviate from '../index';

const WCS_URL = 'https://piblpmmdsiknacjnm1ltla.c1.europe-west3.gcp.weaviate.cloud';
const WCS_KEY = 'cy4ua772mBlMdfw3YnclqAWzFhQt0RLIN0sl';

describe('Testing of the connection helper methods', () => {
  it('should connect to a WCS cluster', () => {
    return weaviate
      .connectToWCS(WCS_URL, {
        authCredentials: new weaviate.ApiKey(WCS_KEY),
      })
      .then((client) => client.getMeta())
      .then((res: any) => {
        expect(res.version).toBeDefined();
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('should connect to a local cluster', () => {
    return weaviate
      .connectToLocal()
      .then((client) => client.getMeta())
      .then((res: any) => {
        expect(res.version).toBeDefined();
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });
});
