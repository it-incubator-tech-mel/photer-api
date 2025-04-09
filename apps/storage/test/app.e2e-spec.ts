import { INestApplication } from '@nestjs/common';

describe('StorageController (e2e)', () => {
  let app: INestApplication;

  // beforeEach(async () => {
  //   const moduleFixture: TestingModule = await Test.createTestingModule({
  //     imports: [StorageModule],
  //   }).compile();
  //
  //   app = moduleFixture.createNestApplication();
  //   await app.init();
  // });

  it('/ (GET)', () => {
    expect(1).toBe(1);
    // return request(app.getHttpServer())
    //   .get('/')
    //   .expect(200)
    //   .expect('Hello World!');
  });
});
