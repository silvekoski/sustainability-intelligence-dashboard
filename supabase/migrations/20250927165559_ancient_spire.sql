/*
  # Create Power Plants Schema

  1. New Tables
    - `power_plants`
      - `id` (uuid, primary key)
      - `plant_name` (text)
      - `fuel_type` (text)
      - `location` (text, optional)
      - `capacity_mw` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `plant_readings`
      - `id` (uuid, primary key)
      - `plant_id` (uuid, foreign key)
      - `reading_time` (timestamp)
      - `electricity_output_mwh` (numeric)
      - `heat_output_mwh` (numeric)
      - `fuel_consumption_mwh` (numeric)
      - `co2_emissions_tonnes` (numeric)
      - `ch4_emissions_kg` (numeric)
      - `n2o_emissions_kg` (numeric)
      - `efficiency_percent` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read data
    - Add policies for service role to insert/update data

  3. Sample Data
    - Insert sample power plants
    - Insert sample readings based on CSV data
*/

-- Create power_plants table
CREATE TABLE IF NOT EXISTS power_plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_name text NOT NULL,
  fuel_type text NOT NULL,
  location text,
  capacity_mw numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create plant_readings table
CREATE TABLE IF NOT EXISTS plant_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid NOT NULL REFERENCES power_plants(id) ON DELETE CASCADE,
  reading_time timestamptz NOT NULL,
  electricity_output_mwh numeric NOT NULL DEFAULT 0,
  heat_output_mwh numeric NOT NULL DEFAULT 0,
  fuel_consumption_mwh numeric NOT NULL DEFAULT 0,
  co2_emissions_tonnes numeric NOT NULL DEFAULT 0,
  ch4_emissions_kg numeric NOT NULL DEFAULT 0,
  n2o_emissions_kg numeric NOT NULL DEFAULT 0,
  efficiency_percent numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE power_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_readings ENABLE ROW LEVEL SECURITY;

-- Create policies for power_plants
CREATE POLICY "Anyone can read power plants"
  ON power_plants
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage power plants"
  ON power_plants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for plant_readings
CREATE POLICY "Anyone can read plant readings"
  ON plant_readings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage plant readings"
  ON plant_readings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plant_readings_plant_id ON plant_readings(plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_readings_time ON plant_readings(reading_time);
CREATE INDEX IF NOT EXISTS idx_plant_readings_plant_time ON plant_readings(plant_id, reading_time);

-- Insert sample power plants
INSERT INTO power_plants (plant_name, fuel_type, location, capacity_mw) VALUES
  ('Alpha Power Station', 'Coal', 'Germany', 150),
  ('Beta Energy Facility', 'Natural Gas', 'Netherlands', 120),
  ('Gamma CHP Plant', 'Natural Gas', 'Denmark', 80),
  ('Delta Dual-Fuel Plant', 'Natural Gas', 'France', 100)
ON CONFLICT DO NOTHING;

-- Insert sample readings (using data from CSV)
DO $$
DECLARE
  alpha_id uuid;
  beta_id uuid;
  gamma_id uuid;
  delta_id uuid;
BEGIN
  -- Get plant IDs
  SELECT id INTO alpha_id FROM power_plants WHERE plant_name = 'Alpha Power Station';
  SELECT id INTO beta_id FROM power_plants WHERE plant_name = 'Beta Energy Facility';
  SELECT id INTO gamma_id FROM power_plants WHERE plant_name = 'Gamma CHP Plant';
  SELECT id INTO delta_id FROM power_plants WHERE plant_name = 'Delta Dual-Fuel Plant';

  -- Insert recent readings (last 24 hours)
  INSERT INTO plant_readings (plant_id, reading_time, electricity_output_mwh, heat_output_mwh, fuel_consumption_mwh, co2_emissions_tonnes, ch4_emissions_kg, n2o_emissions_kg, efficiency_percent) VALUES
    -- Alpha Power Station (Coal) - Recent 24h data
    (alpha_id, now() - interval '23 hours', 75.7, 0.0, 199.2, 67.729, 3.984, 19.92, 38.0),
    (alpha_id, now() - interval '22 hours', 78.3, 0.0, 206.04, 70.054, 4.121, 20.604, 38.0),
    (alpha_id, now() - interval '21 hours', 88.81, 0.0, 233.72, 79.465, 4.674, 23.372, 38.0),
    (alpha_id, now() - interval '20 hours', 96.48, 0.0, 253.89, 86.321, 5.078, 25.389, 38.0),
    (alpha_id, now() - interval '19 hours', 109.88, 0.0, 289.16, 98.316, 5.783, 28.916, 38.0),
    (alpha_id, now() - interval '18 hours', 112.82, 0.0, 296.91, 100.948, 5.938, 29.691, 38.0),
    (alpha_id, now() - interval '17 hours', 121.95, 0.0, 320.91, 109.11, 6.418, 32.091, 38.0),
    (alpha_id, now() - interval '16 hours', 129.11, 0.0, 339.77, 115.522, 6.795, 33.977, 38.0),
    (alpha_id, now() - interval '15 hours', 119.44, 0.0, 314.31, 106.867, 6.286, 31.431, 38.0),
    (alpha_id, now() - interval '14 hours', 112.79, 0.0, 296.82, 100.919, 5.936, 29.682, 38.0),
    (alpha_id, now() - interval '13 hours', 116.59, 0.0, 306.81, 104.315, 6.136, 30.681, 38.0),
    (alpha_id, now() - interval '12 hours', 101.46, 0.0, 267.01, 90.783, 5.34, 26.701, 38.0),
    (alpha_id, now() - interval '11 hours', 89.73, 0.0, 236.13, 80.283, 4.723, 23.613, 38.0),
    (alpha_id, now() - interval '10 hours', 82.62, 0.0, 217.43, 73.927, 4.349, 21.743, 38.0),
    (alpha_id, now() - interval '9 hours', 79.05, 0.0, 208.02, 70.727, 4.16, 20.802, 38.0),
    (alpha_id, now() - interval '8 hours', 75.32, 0.0, 198.2, 67.387, 3.964, 19.82, 38.0),
    (alpha_id, now() - interval '7 hours', 85.57, 0.0, 225.2, 76.567, 4.504, 22.52, 38.0),
    (alpha_id, now() - interval '6 hours', 103.52, 0.0, 272.41, 92.62, 5.448, 27.241, 38.0),
    (alpha_id, now() - interval '5 hours', 117.79, 0.0, 309.97, 105.388, 6.199, 30.997, 38.0),
    (alpha_id, now() - interval '4 hours', 120.19, 0.0, 316.28, 107.536, 6.326, 31.628, 38.0),
    (alpha_id, now() - interval '3 hours', 124.09, 0.0, 326.56, 111.03, 6.531, 32.656, 38.0),
    (alpha_id, now() - interval '2 hours', 119.02, 0.0, 313.21, 106.491, 6.264, 31.321, 38.0),
    (alpha_id, now() - interval '1 hour', 109.12, 0.0, 287.17, 97.637, 5.743, 28.717, 38.0),
    (alpha_id, now(), 92.81, 0.0, 244.23, 83.04, 4.885, 24.423, 38.0),

    -- Beta Energy Facility (Natural Gas) - Recent 24h data
    (beta_id, now() - interval '23 hours', 56.77, 0.0, 126.16, 25.232, 6.308, 1.262, 45.0),
    (beta_id, now() - interval '22 hours', 58.72, 0.0, 130.49, 26.099, 6.525, 1.305, 45.0),
    (beta_id, now() - interval '21 hours', 66.61, 0.0, 148.02, 29.604, 7.401, 1.48, 45.0),
    (beta_id, now() - interval '20 hours', 72.36, 0.0, 160.79, 32.159, 8.04, 1.608, 45.0),
    (beta_id, now() - interval '19 hours', 82.41, 0.0, 183.14, 36.628, 9.157, 1.831, 45.0),
    (beta_id, now() - interval '18 hours', 84.62, 0.0, 188.04, 37.608, 9.402, 1.88, 45.0),
    (beta_id, now() - interval '17 hours', 91.46, 0.0, 203.24, 40.649, 10.162, 2.032, 45.0),
    (beta_id, now() - interval '16 hours', 96.83, 0.0, 215.19, 43.038, 10.759, 2.152, 45.0),
    (beta_id, now() - interval '15 hours', 89.58, 0.0, 199.07, 39.813, 9.953, 1.991, 45.0),
    (beta_id, now() - interval '14 hours', 84.59, 0.0, 187.99, 37.597, 9.399, 1.88, 45.0),
    (beta_id, now() - interval '13 hours', 87.44, 0.0, 194.31, 38.862, 9.716, 1.943, 45.0),
    (beta_id, now() - interval '12 hours', 76.1, 0.0, 169.11, 33.821, 8.455, 1.691, 45.0),
    (beta_id, now() - interval '11 hours', 67.3, 0.0, 149.55, 29.91, 7.477, 1.495, 45.0),
    (beta_id, now() - interval '10 hours', 61.97, 0.0, 137.71, 27.541, 6.885, 1.377, 45.0),
    (beta_id, now() - interval '9 hours', 59.29, 0.0, 131.75, 26.349, 6.587, 1.317, 45.0),
    (beta_id, now() - interval '8 hours', 56.49, 0.0, 125.53, 25.105, 6.276, 1.255, 45.0),
    (beta_id, now() - interval '7 hours', 64.18, 0.0, 142.62, 28.525, 7.131, 1.426, 45.0),
    (beta_id, now() - interval '6 hours', 77.64, 0.0, 172.53, 34.506, 8.626, 1.725, 45.0),
    (beta_id, now() - interval '5 hours', 88.34, 0.0, 196.31, 39.262, 9.816, 1.963, 45.0),
    (beta_id, now() - interval '4 hours', 90.14, 0.0, 200.31, 40.063, 10.016, 2.003, 45.0),
    (beta_id, now() - interval '3 hours', 93.07, 0.0, 206.82, 41.364, 10.341, 2.068, 45.0),
    (beta_id, now() - interval '2 hours', 89.26, 0.0, 198.37, 39.673, 9.918, 1.984, 45.0),
    (beta_id, now() - interval '1 hour', 81.84, 0.0, 181.87, 36.375, 9.094, 1.819, 45.0),
    (beta_id, now(), 69.61, 0.0, 154.68, 30.936, 7.734, 1.547, 45.0),

    -- Gamma CHP Plant (Natural Gas) - Recent 24h data
    (gamma_id, now() - interval '23 hours', 37.85, 37.85, 94.62, 18.924, 4.731, 0.946, 80.0),
    (gamma_id, now() - interval '22 hours', 39.15, 39.15, 97.87, 19.574, 4.893, 0.979, 80.0),
    (gamma_id, now() - interval '21 hours', 44.41, 44.41, 111.02, 22.203, 5.551, 1.11, 80.0),
    (gamma_id, now() - interval '20 hours', 48.24, 48.24, 120.6, 24.119, 6.03, 1.206, 80.0),
    (gamma_id, now() - interval '19 hours', 54.94, 54.94, 137.35, 27.471, 6.868, 1.374, 80.0),
    (gamma_id, now() - interval '18 hours', 56.41, 56.41, 141.03, 28.206, 7.051, 1.41, 80.0),
    (gamma_id, now() - interval '17 hours', 60.97, 60.97, 152.43, 30.487, 7.622, 1.524, 80.0),
    (gamma_id, now() - interval '16 hours', 64.56, 64.56, 161.39, 32.278, 8.07, 1.614, 80.0),
    (gamma_id, now() - interval '15 hours', 59.72, 59.72, 149.3, 29.86, 7.465, 1.493, 80.0),
    (gamma_id, now() - interval '14 hours', 56.4, 56.4, 140.99, 28.198, 7.05, 1.41, 80.0),
    (gamma_id, now() - interval '13 hours', 58.29, 58.29, 145.73, 29.147, 7.287, 1.457, 80.0),
    (gamma_id, now() - interval '12 hours', 50.73, 50.73, 126.83, 25.366, 6.341, 1.268, 80.0),
    (gamma_id, now() - interval '11 hours', 44.86, 44.86, 112.16, 22.432, 5.608, 1.122, 80.0),
    (gamma_id, now() - interval '10 hours', 41.31, 41.31, 103.28, 20.656, 5.164, 1.033, 80.0),
    (gamma_id, now() - interval '9 hours', 39.52, 39.52, 98.81, 19.762, 4.94, 0.988, 80.0),
    (gamma_id, now() - interval '8 hours', 37.66, 37.66, 94.14, 18.829, 4.707, 0.941, 80.0),
    (gamma_id, now() - interval '7 hours', 42.79, 42.79, 106.97, 21.394, 5.348, 1.07, 80.0),
    (gamma_id, now() - interval '6 hours', 51.76, 51.76, 129.4, 25.879, 6.47, 1.294, 80.0),
    (gamma_id, now() - interval '5 hours', 58.89, 58.89, 147.23, 29.447, 7.362, 1.472, 80.0),
    (gamma_id, now() - interval '4 hours', 60.09, 60.09, 150.23, 30.047, 7.512, 1.502, 80.0),
    (gamma_id, now() - interval '3 hours', 62.05, 62.05, 155.12, 31.023, 7.756, 1.551, 80.0),
    (gamma_id, now() - interval '2 hours', 59.51, 59.51, 148.77, 29.755, 7.439, 1.488, 80.0),
    (gamma_id, now() - interval '1 hour', 54.56, 54.56, 136.41, 27.281, 6.82, 1.364, 80.0),
    (gamma_id, now(), 46.4, 46.4, 116.01, 23.202, 5.801, 1.16, 80.0),

    -- Delta Dual-Fuel Plant (Natural Gas/Diesel) - Recent 24h data
    (delta_id, now() - interval '23 hours', 45.42, 0.0, 90.84, 18.167, 4.542, 0.908, 50.0),
    (delta_id, now() - interval '22 hours', 46.98, 0.0, 93.96, 18.791, 4.698, 0.94, 50.0),
    (delta_id, now() - interval '21 hours', 53.29, 0.0, 106.58, 21.315, 5.329, 1.066, 50.0),
    (delta_id, now() - interval '20 hours', 57.89, 0.0, 115.77, 31.258, 1.158, 5.789, 50.0),
    (delta_id, now() - interval '19 hours', 65.93, 0.0, 131.86, 26.372, 6.593, 1.319, 50.0),
    (delta_id, now() - interval '18 hours', 67.69, 0.0, 135.39, 36.555, 1.354, 6.769, 50.0),
    (delta_id, now() - interval '17 hours', 73.17, 0.0, 146.34, 39.511, 1.463, 7.317, 50.0),
    (delta_id, now() - interval '16 hours', 77.47, 0.0, 154.94, 30.987, 7.747, 1.549, 50.0),
    (delta_id, now() - interval '15 hours', 71.66, 0.0, 143.33, 38.698, 1.433, 7.166, 50.0),
    (delta_id, now() - interval '14 hours', 67.68, 0.0, 135.35, 36.545, 1.354, 6.768, 50.0),
    (delta_id, now() - interval '13 hours', 69.95, 0.0, 139.9, 27.981, 6.995, 1.399, 50.0),
    (delta_id, now() - interval '12 hours', 60.88, 0.0, 121.76, 24.351, 6.088, 1.218, 50.0),
    (delta_id, now() - interval '11 hours', 53.84, 0.0, 107.67, 29.072, 1.077, 5.384, 50.0),
    (delta_id, now() - interval '10 hours', 49.57, 0.0, 99.15, 19.83, 4.957, 0.991, 50.0),
    (delta_id, now() - interval '9 hours', 47.43, 0.0, 94.86, 25.612, 0.949, 4.743, 50.0),
    (delta_id, now() - interval '8 hours', 45.19, 0.0, 90.38, 24.402, 0.904, 4.519, 50.0),
    (delta_id, now() - interval '7 hours', 51.34, 0.0, 102.69, 20.538, 5.134, 1.027, 50.0),
    (delta_id, now() - interval '6 hours', 62.11, 0.0, 124.22, 33.539, 1.242, 6.211, 50.0),
    (delta_id, now() - interval '5 hours', 70.67, 0.0, 141.34, 28.269, 7.067, 1.413, 50.0),
    (delta_id, now() - interval '4 hours', 72.11, 0.0, 144.23, 28.845, 7.211, 1.442, 50.0),
    (delta_id, now() - interval '3 hours', 74.46, 0.0, 148.91, 40.206, 1.489, 7.446, 50.0),
    (delta_id, now() - interval '2 hours', 71.41, 0.0, 142.82, 38.562, 1.428, 7.141, 50.0),
    (delta_id, now() - interval '1 hour', 65.47, 0.0, 130.95, 35.356, 1.309, 6.547, 50.0),
    (delta_id, now(), 55.69, 0.0, 111.37, 22.274, 5.569, 1.114, 50.0);
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_power_plants_updated_at 
    BEFORE UPDATE ON power_plants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();