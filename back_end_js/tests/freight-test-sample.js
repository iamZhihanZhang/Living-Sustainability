

// Contains all of the input and expected output for api/freight. Used for testing in server.test.js

// Seattle -> New York
const SEA_NY_GRND_INPUT = {
  "route": [
    {
      "location": {
        "query": "Seattle, Washington, 98154, United States"
      }
    },
    {
      "transport_mode": "road"
    },
    {
      "location": {
        "query": "New York, New York, 10007, United States"
      }
    }
  ],
  "cargo": {
    "weight": 4.53,
    "weight_unit": "kg"
  }
}
const SEA_NY_GRND_EXPECTED = {
  "co2e": 2.094,
  "hub_equipment_co2e": 0.005436,
  "vehicle_operation_co2e": 1.734,
  "vehicle_energy_provision_co2e": 0.3551,
  "co2e_unit": "kg",
  "co2e_calculation_method": "ipcc_ar6_gwp100",
  "cargo_tonnes": 0.00453,
  "distance_km": 4611,
  "route": [
    {
      "type": "location",
      "co2e": 0.002718,
      "co2e_unit": "kg",
      "co2e_calculation_method": "ipcc_ar6_gwp100",
      "source_trail": [
        {
          "data_category": "emission_factor",
          "name": "Freight logistics - transshipment - ambient",
          "source": "GLEC",
          "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
          "year": "2023",
          "region": "GLOBAL",
          "region_name": "Global"
        }
      ],
      "name": "98154, Central Business District, Seattle, WA, United States",
      "confidence_score": 1
    },
    {
      "type": "leg",
      "co2e": 2.089,
      "co2e_unit": "kg",
      "co2e_calculation_method": "ipcc_ar6_gwp100",
      "source_trail": [
        {
          "data_category": "emission_factor",
          "name": "Road freight - General",
          "source": "GLEC",
          "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
          "year": "2023",
          "region": "N_AMERICA",
          "region_name": "North America"
        }
      ],
      "vehicle_operation_co2e": 1.734,
      "vehicle_energy_provision_co2e": 0.3551,
      "transport_mode": "road",
      "distance_km": 4611,
      "notices": []
    },
    {
      "type": "location",
      "co2e": 0.002718,
      "co2e_unit": "kg",
      "co2e_calculation_method": "ipcc_ar6_gwp100",
      "source_trail": [
        {
          "data_category": "emission_factor",
          "name": "Freight logistics - transshipment - ambient",
          "source": "GLEC",
          "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
          "year": "2023",
          "region": "GLOBAL",
          "region_name": "Global"
        }
      ],
      "name": "10007, Civic Center, New York, NY, United States",
      "confidence_score": 1
    }
  ]
};

const SEA_NY_AIR_INPUT = {"route":[{"location":{"query":"Seattle, Washington, 98154, United States"}},{"transport_mode":"road"},{"transport_mode":"air"},{"transport_mode":"road"},{"location":{"query":"New York, New York, 10007, United States"}}],"cargo":{"weight":4.53,"weight_unit":"kg"}};
const SEA_NY_AIR_EXPECTED = {
  "co2e": 25.58,
  "hub_equipment_co2e": 0.01087,
  "vehicle_operation_co2e": 22.58,
  "vehicle_energy_provision_co2e": 2.99,
  "co2e_unit": "kg",
  "co2e_calculation_method": "ipcc_ar6_gwp100",
  "cargo_tonnes": 0.00453,
  "distance_km": 3899,
  "route": [
      {
          "type": "location",
          "co2e": 0.002718,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Freight logistics - transshipment - ambient",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "GLOBAL",
                  "region_name": "Global"
              }
          ],
          "name": "98154, Central Business District, Seattle, WA, United States",
          "confidence_score": 1
      },
      {
          "type": "leg",
          "co2e": 0.01008,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Road freight - General",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "N_AMERICA",
                  "region_name": "North America"
              }
          ],
          "vehicle_operation_co2e": 0.008368,
          "vehicle_energy_provision_co2e": 0.001714,
          "transport_mode": "road",
          "distance_km": 22.26,
          "notices": []
      },
      {
          "type": "location",
          "co2e": 0.002718,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Freight logistics - transshipment - ambient",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "GLOBAL",
                  "region_name": "Global"
              }
          ],
          "name": "Seattle–Tacoma International Airport",
          "confidence_score": null
      },
      {
          "type": "leg",
          "co2e": 25.55,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": null,
                  "name": "Radiative Forcing uplift",
                  "source": "The International Journal of Life Cycle Assessment",
                  "source_dataset": "Jungbluth, N., Meili, C. Recommendations for calculation of the global warming potential of aviation including the radiative forcing index. Int J Life Cycle Assess 24, 404–411 (2019). https://doi.org/10.1007/s11367-018-1556-3",
                  "year": null,
                  "region": "GLOBAL",
                  "region_name": "Global"
              },
              {
                  "data_category": "emission_factor",
                  "name": "Air freight (>1500 km) - unknown - RP1678",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "GLOBAL",
                  "region_name": "Global"
              }
          ],
          "vehicle_operation_co2e": 22.56,
          "vehicle_energy_provision_co2e": 2.986,
          "transport_mode": "air",
          "distance_km": 3855,
          "notices": [
              {
                  "message": "A Radiative Forcing Index of 2 applied to operational emissions of air leg. This value accounts for the fact that greenhouse gases emitted at higher altitudes contribute more to global warming.",
                  "code": "radiative_forcing_applied",
                  "severity": "info"
              }
          ]
      },
      {
          "type": "location",
          "co2e": 0.002718,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Freight logistics - transshipment - ambient",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "GLOBAL",
                  "region_name": "Global"
              }
          ],
          "name": "Newark Liberty International Airport",
          "confidence_score": null
      },
      {
          "type": "leg",
          "co2e": 0.0099,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Road freight - General",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "N_AMERICA",
                  "region_name": "North America"
              }
          ],
          "vehicle_operation_co2e": 0.008217,
          "vehicle_energy_provision_co2e": 0.001683,
          "transport_mode": "road",
          "distance_km": 21.86,
          "notices": []
      },
      {
          "type": "location",
          "co2e": 0.002718,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Freight logistics - transshipment - ambient",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "GLOBAL",
                  "region_name": "Global"
              }
          ],
          "name": "10007, Civic Center, New York, NY, United States",
          "confidence_score": 1
      }
  ]
}

const NY_TKY_AIR_INPUT = {"route":[{"location":{"query":"New York, New York, 10007, United States"}},{"transport_mode":"road"},{"transport_mode":"air"},{"transport_mode":"road"},{"location":{"query":"Suginami City, Tokyo, 168-0063, Japan"}}],"cargo":{"weight":4.53,"weight_unit":"kg"}};

const NY_TKY_AIR_EXPECTED = {
  "co2e": 0.5868,
  "hub_equipment_co2e": 0.005436,
  "vehicle_operation_co2e": 0.4826,
  "vehicle_energy_provision_co2e": 0.09884,
  "co2e_unit": "kg",
  "co2e_calculation_method": "ipcc_ar6_gwp100",
  "cargo_tonnes": 0.00453,
  "distance_km": 1283,
  "route": [
      {
          "type": "location",
          "co2e": 0.002718,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Freight logistics - transshipment - ambient",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "GLOBAL",
                  "region_name": "Global"
              }
          ],
          "name": "Seattle, WA, United States",
          "confidence_score": 1
      },
      {
          "type": "leg",
          "co2e": 0.5814,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Road freight - General",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "N_AMERICA",
                  "region_name": "North America"
              }
          ],
          "vehicle_operation_co2e": 0.4826,
          "vehicle_energy_provision_co2e": 0.09884,
          "transport_mode": "road",
          "distance_km": 1283,
          "notices": []
      },
      {
          "type": "location",
          "co2e": 0.002718,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Freight logistics - transshipment - ambient",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "GLOBAL",
                  "region_name": "Global"
              }
          ],
          "name": "Berkeley, CA, United States",
          "confidence_score": 1
      }
  ]
};

const BRLN_PRS_GRND_INPUT = {"route":[{"location":{"query":"Berlin, Berlin, 10178, Germany"}},{"transport_mode":"road"},{"location":{"query":"Paris, Île-de-France, 75004, France"}}],"cargo":{"weight":10,"weight_unit":"kg"}};
const BRLN_PRS_GRND_EXPECTED = {
  "co2e": 1.246,
  "hub_equipment_co2e": 0.012,
  "vehicle_operation_co2e": 0.9469,
  "vehicle_energy_provision_co2e": 0.2873,
  "co2e_unit": "kg",
  "co2e_calculation_method": "ipcc_ar6_gwp100",
  "cargo_tonnes": 0.01,
  "distance_km": 1064,
  "route": [
      {
          "type": "location",
          "co2e": 0.006,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Freight logistics - transshipment - ambient",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "GLOBAL",
                  "region_name": "Global"
              }
          ],
          "name": "10178, Mitte, Berlin, Germany",
          "confidence_score": 1
      },
      {
          "type": "leg",
          "co2e": 1.234,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Articulated truck <34t - Average/mixed load - Diesel",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "EU_S_AMERICA",
                  "region_name": "Europe and South America"
              }
          ],
          "vehicle_operation_co2e": 0.9469,
          "vehicle_energy_provision_co2e": 0.2873,
          "transport_mode": "road",
          "distance_km": 1064,
          "notices": []
      },
      {
          "type": "location",
          "co2e": 0.006,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Freight logistics - transshipment - ambient",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "GLOBAL",
                  "region_name": "Global"
              }
          ],
          "name": "75004, 4th Arrondissement, Paris, Ile-de-France, France",
          "confidence_score": 1
      }
  ]
};
const BRLN_PRS_AIR_INPUT = {"route":[{"location":{"query":"Berlin, Berlin, 10178, Germany"}},{"transport_mode":"road"},{"location":{"query":"Paris, Île-de-France, 75004, France"}}],"cargo":{"weight":10,"weight_unit":"kg"}};
const BRLN_PRS_AIR_EXPECTED = {
  "co2e": 21.56,
  "hub_equipment_co2e": 0.024,
  "vehicle_operation_co2e": 19.02,
  "vehicle_energy_provision_co2e": 2.519,
  "co2e_unit": "kg",
  "co2e_calculation_method": "ipcc_ar6_gwp100",
  "cargo_tonnes": 0.01,
  "distance_km": 927.5,
  "route": [
      {
          "type": "location",
          "co2e": 0.006,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Freight logistics - transshipment - ambient",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "GLOBAL",
                  "region_name": "Global"
              }
          ],
          "name": "10178, Mitte, Berlin, Germany",
          "confidence_score": 1
      },
      {
          "type": "leg",
          "co2e": 0.03004,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Articulated truck <34t - Average/mixed load - Diesel",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "EU_S_AMERICA",
                  "region_name": "Europe and South America"
              }
          ],
          "vehicle_operation_co2e": 0.02305,
          "vehicle_energy_provision_co2e": 0.006992,
          "transport_mode": "road",
          "distance_km": 25.9,
          "notices": []
      },
      {
          "type": "location",
          "co2e": 0.006,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Freight logistics - transshipment - ambient",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "GLOBAL",
                  "region_name": "Global"
              }
          ],
          "name": "Berlin Brandenburg Airport",
          "confidence_score": null
      },
      {
          "type": "leg",
          "co2e": 21.48,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": null,
                  "name": "Radiative Forcing uplift",
                  "source": "The International Journal of Life Cycle Assessment",
                  "source_dataset": "Jungbluth, N., Meili, C. Recommendations for calculation of the global warming potential of aviation including the radiative forcing index. Int J Life Cycle Assess 24, 404–411 (2019). https://doi.org/10.1007/s11367-018-1556-3",
                  "year": null,
                  "region": "GLOBAL",
                  "region_name": "Global"
              },
              {
                  "data_category": "emission_factor",
                  "name": "Air freight (<1500 km) - unknown - RP1678",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "GLOBAL",
                  "region_name": "Global"
              }
          ],
          "vehicle_operation_co2e": 18.98,
          "vehicle_energy_provision_co2e": 2.507,
          "transport_mode": "air",
          "distance_km": 882.6,
          "notices": [
              {
                  "message": "A Radiative Forcing Index of 2 applied to operational emissions of air leg. This value accounts for the fact that greenhouse gases emitted at higher altitudes contribute more to global warming.",
                  "code": "radiative_forcing_applied",
                  "severity": "info"
              }
          ]
      },
      {
          "type": "location",
          "co2e": 0.006,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Freight logistics - transshipment - ambient",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "GLOBAL",
                  "region_name": "Global"
              }
          ],
          "name": "Paris-Orly Airport",
          "confidence_score": null
      },
      {
          "type": "leg",
          "co2e": 0.02205,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Articulated truck <34t - Average/mixed load - Diesel",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "EU_S_AMERICA",
                  "region_name": "Europe and South America"
              }
          ],
          "vehicle_operation_co2e": 0.01692,
          "vehicle_energy_provision_co2e": 0.005132,
          "transport_mode": "road",
          "distance_km": 19.01,
          "notices": []
      },
      {
          "type": "location",
          "co2e": 0.006,
          "co2e_unit": "kg",
          "co2e_calculation_method": "ipcc_ar6_gwp100",
          "source_trail": [
              {
                  "data_category": "emission_factor",
                  "name": "Freight logistics - transshipment - ambient",
                  "source": "GLEC",
                  "source_dataset": "Default fuel efficiency and GHG emission intensity values v3.0",
                  "year": "2023",
                  "region": "GLOBAL",
                  "region_name": "Global"
              }
          ],
          "name": "75004, 4th Arrondissement, Paris, Ile-de-France, France",
          "confidence_score": 1
      }
  ]
}

module.exports = { SEA_NY_GRND_INPUT, SEA_NY_GRND_EXPECTED,
  SEA_NY_AIR_INPUT, SEA_NY_AIR_EXPECTED, NY_TKY_AIR_INPUT, NY_TKY_AIR_EXPECTED,
  BRLN_PRS_GRND_INPUT, BRLN_PRS_GRND_EXPECTED, BRLN_PRS_AIR_INPUT, BRLN_PRS_AIR_EXPECTED
 };