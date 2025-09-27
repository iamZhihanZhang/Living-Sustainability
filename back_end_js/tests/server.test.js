
require('dotenv').config();
const request = require('supertest');
const app = require('../server');
const axios = require('axios');

const {
  SEA_NY_GRND_INPUT, SEA_NY_GRND_EXPECTED,
  SEA_NY_AIR_INPUT, SEA_NY_AIR_EXPECTED,
  NY_TKY_AIR_INPUT, NY_TKY_AIR_EXPECTED,
  BRLN_PRS_GRND_INPUT, BRLN_PRS_GRND_EXPECTED,
  BRLN_PRS_AIR_INPUT, BRLN_PRS_AIR_EXPECTED
} = require('./freight-test-sample');

const {
  EPOXY_INPUT, PDMS_INPUT
} = require('./evaluate-text-test-sample');

const { IPHONE_16_INPUT, IPHONE_13_INPUT,
  GOOGLE_PIXEL_9_INPUT, GALAXY_Z_FLIP_6_INPUT } = require('./phone-test-sample');

jest.mock('axios');

// test: /api/freight
describe('/api/freight Endpoint', () => {
  it('Test: Seattle -> New York (ground)', async () => {
    // Expected output
    axios.post.mockResolvedValue({
      data: SEA_NY_GRND_EXPECTED
    })
    const response = await request(app)
      .post('/api/freight')
      .send(SEA_NY_GRND_INPUT)
      .set('Content-Type', 'application/json');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(SEA_NY_GRND_EXPECTED);
  });

  it('Test: Seattle -> New York (air)', async () => {
    // Expected output
    axios.post.mockResolvedValue({
      data: SEA_NY_AIR_EXPECTED
    })
    const response = await request(app)
      .post('/api/freight')
      .send(SEA_NY_AIR_INPUT)
      .set('Content-Type', 'application/json');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(SEA_NY_AIR_EXPECTED);
  });

  it('Test: New York -> Tokyo (air)', async () => {
    // Expected output
    axios.post.mockResolvedValue({
      data: NY_TKY_AIR_EXPECTED
    })
    const response = await request(app)
      .post('/api/freight')
      .send(NY_TKY_AIR_INPUT)
      .set('Content-Type', 'application/json');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(NY_TKY_AIR_EXPECTED);
  });

  it('Test: Berlin -> Paris (ground)', async () => {
    // Expected output
    axios.post.mockResolvedValue({
      data: BRLN_PRS_GRND_EXPECTED
    })
    const response = await request(app)
      .post('/api/freight')
      .send(BRLN_PRS_GRND_INPUT)
      .set('Content-Type', 'application/json');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(BRLN_PRS_GRND_EXPECTED);
  });

  it('Test: Berlin -> Paris (air)', async () => {
    // Expected output
    axios.post.mockResolvedValue({
      data: BRLN_PRS_AIR_EXPECTED
    })
    const response = await request(app)
      .post('/api/freight')
      .send(BRLN_PRS_AIR_INPUT)
      .set('Content-Type', 'application/json');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(BRLN_PRS_AIR_EXPECTED);
  });
})

// test: /api/evaluate text
describe('/api/evaluate-text Endpoint', () => {
  it('Test: raw materials epoxy case ', async () => {
    const response = await request(app)
      .post('/api/evaluate-text')
      .send(EPOXY_INPUT)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      raw_materials: expect.objectContaining({
        related_materials: expect.arrayContaining([
          expect.objectContaining({
            text_source: expect.any(String),
            ratio: expect.arrayContaining([
              expect.objectContaining({
                name: expect.any(String),
                ratio_value: expect.any(Number),
                unit: expect.any(String),
                ratio_value_source: expect.any(String),
                unit_source: expect.any(String),
                carbon_emission_factor: expect.any(String),
                index: expect.any(Number),
              })
            ])
          })
        ]),
        independent_materials: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            amount: expect.any(Number),
            unit: expect.any(String),
            amount_source: expect.any(String),
            unit_source: expect.any(String),
            carbon_emission_factor: expect.any(String),
            index: expect.any(Number),
          })
        ]),
        notes: expect.any(String)
      })
    });
  }, 12000);

  it('Test: raw materials PDMS case ', async() => {
    const response = await request(app)
      .post('/api/evaluate-text')
      .send(PDMS_INPUT)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      raw_materials: expect.objectContaining({
        related_materials: expect.arrayContaining([
          expect.objectContaining({
            text_source: expect.any(String),
            ratio: expect.arrayContaining([
              expect.objectContaining({
                name: expect.any(String),
                ratio_value: expect.any(Number),
                unit: expect.any(String),
                ratio_value_source: expect.any(String),
                unit_source: expect.any(String),
                carbon_emission_factor: expect.any(String),
                index: expect.any(Number),
              })
            ])
          })
        ]),
        independent_materials: expect.any(Array), // Empty array is valid
        notes: expect.any(String)
      })
    });
  }, 10000);
});


const expectedAttributes = [
  '_id',
  'device',
  'base_co2e',
  'source',
  'method',
  'specs',
  'normalized_name',
];

const productEmissionsDevices = [
  ['iPhone 16', IPHONE_16_INPUT],
  ['iPhone 13', IPHONE_13_INPUT],
  ['Google Pixel 9', GOOGLE_PIXEL_9_INPUT],
  ['Galaxy Z Flip 6', GALAXY_Z_FLIP_6_INPUT],
];

describe('/api/product-emissions Endpoint', () => {
  test.each(productEmissionsDevices)('Testing %s', async(name, input) => {
    const response = await request(app)
      .post('/api/product-emissions')
      .send(input)
      .set('Accept', 'application/json')

    expect(response.statusCode).toBe(200);
    const data = response.body;

    expectedAttributes.forEach((attr) => {
      expect(data).toHaveProperty(attr);
    });

    expect(data).toHaveProperty('competitors');

    expect(Array.isArray(data.specs)).toBe(true);
    data.specs.forEach(spec => {
      expect(spec).toHaveProperty('storage');
      expect(spec).toHaveProperty('co2e');
    });
  });
});


const productRecommendationsDevices = [
  ['iPhone 13', IPHONE_13_INPUT],
  ['Google Pixel 9', GOOGLE_PIXEL_9_INPUT],
];

describe('/api/product-recommendations Endpoint', () => {
  test.each(productRecommendationsDevices)('Testing %s', async(name, input) => {
    const response = await request(app)
      .post('/api/product-emissions')
      .send(input)
      .set('Accept', 'application/json')

    expect(response.statusCode).toBe(200);
    const data = response.body;

    expectedAttributes.forEach((attr) => {
      expect(data).toHaveProperty(attr);
    });

    expect(Array.isArray(data.specs)).toBe(true);
    data.specs.forEach(spec => {
      expect(spec).toHaveProperty('storage');
      expect(spec).toHaveProperty('co2e');
    });
  });
});