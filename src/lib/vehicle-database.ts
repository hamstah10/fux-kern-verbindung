// Known vehicle specs for auto-detection of stock HP and Nm
export interface VehicleSpec {
  brand: string;
  model: string;
  engineCode: string;
  stockHp: number;
  stockNm: number;
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  ecuType?: string;
}

const database: VehicleSpec[] = [
  // Volkswagen
  { brand: 'Volkswagen', model: 'Golf 8 GTI', engineCode: 'DNUA', stockHp: 245, stockNm: 370, fuelType: 'petrol', ecuType: 'Bosch MG1CS111' },
  { brand: 'Volkswagen', model: 'Golf 8 R', engineCode: 'DNUE', stockHp: 320, stockNm: 420, fuelType: 'petrol', ecuType: 'Bosch MG1CS111' },
  { brand: 'Volkswagen', model: 'Golf 7 GTI', engineCode: 'DKTB', stockHp: 230, stockNm: 350, fuelType: 'petrol', ecuType: 'Bosch MED17.5.2' },
  { brand: 'Volkswagen', model: 'Golf 7 R', engineCode: 'DJHB', stockHp: 310, stockNm: 400, fuelType: 'petrol', ecuType: 'Bosch MED17.1.62' },
  { brand: 'Volkswagen', model: 'Polo GTI', engineCode: 'DKZC', stockHp: 207, stockNm: 320, fuelType: 'petrol', ecuType: 'Bosch MG1CS011' },
  { brand: 'Volkswagen', model: 'T-Roc R', engineCode: 'DNUE', stockHp: 300, stockNm: 400, fuelType: 'petrol', ecuType: 'Bosch MG1CS111' },
  { brand: 'Volkswagen', model: 'Tiguan 2.0 TDI', engineCode: 'DFGA', stockHp: 150, stockNm: 340, fuelType: 'diesel', ecuType: 'Bosch EDC17C74' },
  { brand: 'Volkswagen', model: 'Passat 2.0 TSI', engineCode: 'DNPA', stockHp: 272, stockNm: 350, fuelType: 'petrol', ecuType: 'Bosch MG1CS111' },

  // BMW
  { brand: 'BMW', model: 'M340i', engineCode: 'B58B30O1', stockHp: 374, stockNm: 500, fuelType: 'petrol', ecuType: 'Bosch MG1CS201' },
  { brand: 'BMW', model: 'M240i', engineCode: 'B58B30M1', stockHp: 374, stockNm: 500, fuelType: 'petrol', ecuType: 'Bosch MG1CS201' },
  { brand: 'BMW', model: 'M2 G87', engineCode: 'S58B30', stockHp: 460, stockNm: 550, fuelType: 'petrol', ecuType: 'Bosch MG1CS201' },
  { brand: 'BMW', model: 'M3 G80', engineCode: 'S58B30', stockHp: 480, stockNm: 550, fuelType: 'petrol', ecuType: 'Bosch MG1CS201' },
  { brand: 'BMW', model: 'M4 G82', engineCode: 'S58B30', stockHp: 480, stockNm: 550, fuelType: 'petrol', ecuType: 'Bosch MG1CS201' },
  { brand: 'BMW', model: '320d G20', engineCode: 'B47D20O1', stockHp: 190, stockNm: 400, fuelType: 'diesel', ecuType: 'Bosch EDC17C76' },
  { brand: 'BMW', model: '330i G20', engineCode: 'B48B20O1', stockHp: 258, stockNm: 400, fuelType: 'petrol', ecuType: 'Bosch MG1CS201' },
  { brand: 'BMW', model: '120i F40', engineCode: 'B48A20O1', stockHp: 178, stockNm: 280, fuelType: 'petrol', ecuType: 'Bosch MG1CS201' },

  // Mercedes-Benz
  { brand: 'Mercedes-Benz', model: 'A 35 AMG', engineCode: 'M260', stockHp: 306, stockNm: 400, fuelType: 'petrol', ecuType: 'Bosch MED17.7.2' },
  { brand: 'Mercedes-Benz', model: 'A 45 S AMG', engineCode: 'M139', stockHp: 421, stockNm: 500, fuelType: 'petrol', ecuType: 'Bosch MED17.7.5' },
  { brand: 'Mercedes-Benz', model: 'C 43 AMG', engineCode: 'M254', stockHp: 408, stockNm: 500, fuelType: 'petrol', ecuType: 'Bosch MG1CS163' },
  { brand: 'Mercedes-Benz', model: 'C 63 S AMG', engineCode: 'M177', stockHp: 510, stockNm: 700, fuelType: 'petrol', ecuType: 'Bosch MED17.7.5' },
  { brand: 'Mercedes-Benz', model: 'C 220d', engineCode: 'OM654', stockHp: 200, stockNm: 440, fuelType: 'diesel', ecuType: 'Delphi CRD3' },
  { brand: 'Mercedes-Benz', model: 'E 300', engineCode: 'M254', stockHp: 258, stockNm: 400, fuelType: 'petrol', ecuType: 'Bosch MG1CS163' },

  // Audi
  { brand: 'Audi', model: 'S3 8Y', engineCode: 'DNUE', stockHp: 310, stockNm: 400, fuelType: 'petrol', ecuType: 'Bosch MG1CS111' },
  { brand: 'Audi', model: 'RS3 8Y', engineCode: 'DAZA', stockHp: 400, stockNm: 500, fuelType: 'petrol', ecuType: 'Bosch MG1CS002' },
  { brand: 'Audi', model: 'RS6 C8', engineCode: 'DHTB', stockHp: 600, stockNm: 800, fuelType: 'petrol', ecuType: 'Bosch MG1CS163' },
  { brand: 'Audi', model: 'A4 2.0 TFSI', engineCode: 'DETA', stockHp: 252, stockNm: 370, fuelType: 'petrol', ecuType: 'Bosch MG1CS111' },
  { brand: 'Audi', model: 'A3 2.0 TDI', engineCode: 'DETA', stockHp: 150, stockNm: 340, fuelType: 'diesel', ecuType: 'Bosch EDC17C74' },
  { brand: 'Audi', model: 'TT RS', engineCode: 'DAZA', stockHp: 400, stockNm: 480, fuelType: 'petrol', ecuType: 'Bosch MG1CS002' },

  // Porsche
  { brand: 'Porsche', model: '911 Carrera S (992)', engineCode: '9A2EVO', stockHp: 450, stockNm: 530, fuelType: 'petrol', ecuType: 'Bosch MG1CS163' },
  { brand: 'Porsche', model: '718 Cayman GTS 4.0', engineCode: '9A2', stockHp: 400, stockNm: 420, fuelType: 'petrol', ecuType: 'Bosch MG1CS163' },
  { brand: 'Porsche', model: 'Macan S', engineCode: 'DKN', stockHp: 380, stockNm: 520, fuelType: 'petrol', ecuType: 'Bosch MG1CS163' },
  { brand: 'Porsche', model: 'Cayenne Turbo', engineCode: 'DJH', stockHp: 550, stockNm: 770, fuelType: 'petrol', ecuType: 'Bosch MG1CS163' },

  // Ford
  { brand: 'Ford', model: 'Focus ST', engineCode: 'M9DA', stockHp: 280, stockNm: 420, fuelType: 'petrol', ecuType: 'Bosch MED17.0.7' },
  { brand: 'Ford', model: 'Focus RS', engineCode: 'YVDA', stockHp: 350, stockNm: 440, fuelType: 'petrol', ecuType: 'Bosch MED17.2' },
  { brand: 'Ford', model: 'Fiesta ST', engineCode: 'YEJD', stockHp: 200, stockNm: 290, fuelType: 'petrol', ecuType: 'Bosch MED17.0.7' },
  { brand: 'Ford', model: 'Mustang 5.0 V8', engineCode: 'COYOTE', stockHp: 450, stockNm: 529, fuelType: 'petrol', ecuType: 'Ford PCM' },

  // Seat
  { brand: 'Seat', model: 'Leon Cupra 300', engineCode: 'DJHB', stockHp: 300, stockNm: 400, fuelType: 'petrol', ecuType: 'Bosch MED17.1.62' },
  { brand: 'Seat', model: 'Leon FR 2.0 TSI', engineCode: 'DNUA', stockHp: 190, stockNm: 320, fuelType: 'petrol', ecuType: 'Bosch MG1CS111' },
  { brand: 'Seat', model: 'Ibiza FR 1.5 TSI', engineCode: 'DPCA', stockHp: 150, stockNm: 250, fuelType: 'petrol', ecuType: 'Bosch MG1CS011' },

  // Skoda
  { brand: 'Skoda', model: 'Octavia RS 245', engineCode: 'DNUA', stockHp: 245, stockNm: 370, fuelType: 'petrol', ecuType: 'Bosch MG1CS111' },
  { brand: 'Skoda', model: 'Octavia RS TDI', engineCode: 'DTUA', stockHp: 200, stockNm: 400, fuelType: 'diesel', ecuType: 'Bosch EDC17C74' },
  { brand: 'Skoda', model: 'Superb 2.0 TSI', engineCode: 'DNPA', stockHp: 272, stockNm: 350, fuelType: 'petrol', ecuType: 'Bosch MG1CS111' },
  { brand: 'Skoda', model: 'Kodiaq RS', engineCode: 'DTUA', stockHp: 245, stockNm: 500, fuelType: 'diesel', ecuType: 'Bosch EDC17C74' },
];

// Search for matching specs - returns best match
export function lookupVehicleSpec(
  brand: string,
  model: string,
  engineCode: string
): VehicleSpec | undefined {
  const brandLower = brand.toLowerCase();
  const modelLower = model.toLowerCase().trim();
  const engineLower = engineCode.toLowerCase().trim();

  // Exact match on all three fields
  if (engineLower) {
    const exactMatch = database.find(
      (s) =>
        s.brand.toLowerCase() === brandLower &&
        s.engineCode.toLowerCase() === engineLower
    );
    if (exactMatch) return exactMatch;
  }

  // Match on brand + model (partial/fuzzy)
  if (modelLower) {
    const modelMatch = database.find(
      (s) =>
        s.brand.toLowerCase() === brandLower &&
        s.model.toLowerCase().includes(modelLower)
    );
    if (modelMatch) return modelMatch;

    // Reverse: check if user input contains the db model name
    const reverseMatch = database.find(
      (s) =>
        s.brand.toLowerCase() === brandLower &&
        modelLower.includes(s.model.toLowerCase().split(' ')[0].toLowerCase())
    );
    if (reverseMatch) return reverseMatch;
  }

  return undefined;
}

// Get all models for a brand
export function getModelsForBrand(brand: string): string[] {
  return [...new Set(
    database
      .filter((s) => s.brand.toLowerCase() === brand.toLowerCase())
      .map((s) => s.model)
  )];
}
