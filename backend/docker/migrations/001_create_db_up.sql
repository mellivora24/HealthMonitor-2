CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(20),
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_code VARCHAR(100) UNIQUE,
    device_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE health_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    heart_rate DECIMAL(6,2),
    spo2 DECIMAL(5,2),
    body_temperature DECIMAL(4,2),
    blood_pressure_systolic DECIMAL(5,2),
    blood_pressure_diastolic DECIMAL(5,2),
    accel_x DECIMAL(6,3),
    accel_y DECIMAL(6,3),
    accel_z DECIMAL(6,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE health_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    heart_rate_min DECIMAL(6,2) DEFAULT 60,
    heart_rate_max DECIMAL(6,2) DEFAULT 100,
    spo2_min DECIMAL(5,2) DEFAULT 95,
    body_temp_min DECIMAL(4,2) DEFAULT 36.1,
    body_temp_max DECIMAL(4,2) DEFAULT 37.2,
    bp_systolic_min DECIMAL(5,2) DEFAULT 90,
    bp_systolic_max DECIMAL(5,2) DEFAULT 140,
    bp_diastolic_min DECIMAL(5,2) DEFAULT 60,
    bp_diastolic_max DECIMAL(5,2) DEFAULT 90,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_health_data_user_id ON health_data(user_id);
CREATE INDEX idx_health_data_device_id ON health_data(device_id);
CREATE INDEX idx_health_data_created_at ON health_data(created_at DESC);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_devices_device_code ON devices(device_code);

CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_thresholds_updated_at BEFORE UPDATE ON health_thresholds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION create_default_thresholds()
    RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO health_thresholds (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_user_default_thresholds
    AFTER INSERT ON users
    FOR EACH ROW
EXECUTE FUNCTION create_default_thresholds();

CREATE VIEW latest_health_data AS
SELECT DISTINCT ON (user_id)
    id,
    user_id,
    device_id,
    heart_rate,
    spo2,
    body_temperature,
    blood_pressure_systolic,
    blood_pressure_diastolic,
    accel_x,
    accel_y,
    accel_z,
    created_at
FROM health_data
ORDER BY user_id, created_at DESC;
