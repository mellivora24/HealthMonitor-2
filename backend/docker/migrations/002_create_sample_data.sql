INSERT INTO users (id, email, password_hash, full_name, date_of_birth, gender, phone, height, weight)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'john@example.com', '$2y$10$hashdemo', 'John Doe', '1990-05-21', 'male', '0912345678', 175, 70),
    ('22222222-2222-2222-2222-222222222222', 'anna@example.com', '$2y$10$hashdemo', 'Anna Smith', '1995-08-10', 'female', '0987654321', 162, 55);

INSERT INTO devices (id, user_id, device_code, device_name, is_active)
VALUES
    ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'DEVICE_001', 'Smart Health Tracker #1', true),
    ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '22222222-2222-2222-2222-222222222222', 'DEVICE_002', 'Smart Health Tracker #2', true);

INSERT INTO health_data (
    id, user_id, device_id, heart_rate, spo2, body_temperature,
    blood_pressure_systolic, blood_pressure_diastolic,
    accel_x, accel_y, accel_z, created_at
)
VALUES
    ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
     '11111111-1111-1111-1111-111111111111',
     'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
     78, 97, 36.7, 118, 76, 0.12, -0.03, 0.98, NOW()),

    ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
     '22222222-2222-2222-2222-222222222222',
     'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
     82, 95, 36.5, 122, 80, 0.05, 0.01, 1.01, NOW());
