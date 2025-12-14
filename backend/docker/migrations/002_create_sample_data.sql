-- 1. Thêm thiết bị cho user
INSERT INTO devices (id, user_id, device_code, device_name, is_active, created_at) VALUES
('d1234567-0984-4720-b391-10ff87ff0001', '32abe551-0984-4720-b391-10ff87ff0376', 'DEV-2024-001', 'Smartwatch Health Monitor', true, CURRENT_TIMESTAMP - INTERVAL '30 days'),
('d1234567-0984-4720-b391-10ff87ff0002', '32abe551-0984-4720-b391-10ff87ff0376', 'DEV-2024-002', 'Fitness Band Pro', true, CURRENT_TIMESTAMP - INTERVAL '15 days');

-- 2. Thêm dữ liệu sức khỏe (30 ngày gần nhất, mỗi ngày 3-5 lần đo)
-- Dữ liệu bình thường
INSERT INTO health_data (user_id, device_id, heart_rate, spo2, body_temperature, blood_pressure_systolic, blood_pressure_diastolic, accel_x, accel_y, accel_z, created_at)
SELECT 
    '32abe551-0984-4720-b391-10ff87ff0376',
    'd1234567-0984-4720-b391-10ff87ff0001',
    65 + (random() * 25)::numeric(6,2),  -- Heart rate: 65-90 bpm
    96 + (random() * 3)::numeric(5,2),   -- SpO2: 96-99%
    36.2 + (random() * 0.8)::numeric(4,2), -- Temperature: 36.2-37.0°C
    110 + (random() * 20)::numeric(5,2), -- Systolic: 110-130
    70 + (random() * 15)::numeric(5,2),  -- Diastolic: 70-85
    (random() * 2 - 1)::numeric(6,3),    -- Accel X: -1 to 1
    (random() * 2 - 1)::numeric(6,3),    -- Accel Y: -1 to 1
    (random() * 2 - 1)::numeric(6,3),    -- Accel Z: -1 to 1
    CURRENT_TIMESTAMP - (interval '1 day' * generate_series(0, 29)) - (interval '1 hour' * floor(random() * 12))
FROM generate_series(1, 4);

-- Thêm một số dữ liệu bất thường để test alerts
INSERT INTO health_data (user_id, device_id, heart_rate, spo2, body_temperature, blood_pressure_systolic, blood_pressure_diastolic, accel_x, accel_y, accel_z, created_at) VALUES
-- Nhịp tim cao bất thường
('32abe551-0984-4720-b391-10ff87ff0376', 'd1234567-0984-4720-b391-10ff87ff0001', 145.00, 98.00, 36.8, 125.00, 80.00, 0.234, -0.456, 0.789, CURRENT_TIMESTAMP - INTERVAL '5 days 3 hours'),
-- SpO2 thấp
('32abe551-0984-4720-b391-10ff87ff0376', 'd1234567-0984-4720-b391-10ff87ff0001', 78.00, 92.00, 36.9, 118.00, 75.00, -0.123, 0.567, -0.234, CURRENT_TIMESTAMP - INTERVAL '3 days 8 hours'),
-- Nhiệt độ cao
('32abe551-0984-4720-b391-10ff87ff0376', 'd1234567-0984-4720-b391-10ff87ff0001', 88.00, 97.00, 38.2, 130.00, 85.00, 0.456, -0.123, 0.345, CURRENT_TIMESTAMP - INTERVAL '2 days 5 hours'),
-- Huyết áp cao
('32abe551-0984-4720-b391-10ff87ff0376', 'd1234567-0984-4720-b391-10ff87ff0001', 82.00, 98.00, 36.7, 155.00, 98.00, -0.234, 0.345, -0.456, CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours');

-- 3. Thêm các cảnh báo
INSERT INTO alerts (user_id, alert_type, message, is_read, created_at) VALUES
('32abe551-0984-4720-b391-10ff87ff0376', 'HIGH_HEART_RATE', 'Nhịp tim của bạn cao hơn bình thường: 145 bpm. Hãy nghỉ ngơi và theo dõi.', false, CURRENT_TIMESTAMP - INTERVAL '5 days 3 hours'),
('32abe551-0984-4720-b391-10ff87ff0376', 'LOW_SPO2', 'Nồng độ oxy trong máu thấp: 92%. Khuyến nghị kiểm tra sức khỏe.', true, CURRENT_TIMESTAMP - INTERVAL '3 days 8 hours'),
('32abe551-0984-4720-b391-10ff87ff0376', 'HIGH_TEMPERATURE', 'Nhiệt độ cơ thể cao: 38.2°C. Có thể bạn đang bị sốt.', false, CURRENT_TIMESTAMP - INTERVAL '2 days 5 hours'),
('32abe551-0984-4720-b391-10ff87ff0376', 'HIGH_BLOOD_PRESSURE', 'Huyết áp cao: 155/98 mmHg. Nên tham khảo ý kiến bác sĩ.', false, CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours'),
('32abe551-0984-4720-b391-10ff87ff0376', 'SYSTEM', 'Thiết bị mới "Fitness Band Pro" đã được kết nối thành công.', true, CURRENT_TIMESTAMP - INTERVAL '15 days'),
('32abe551-0984-4720-b391-10ff87ff0376', 'SYSTEM', 'Chào mừng bạn đến với hệ thống giám sát sức khỏe!', true, CURRENT_TIMESTAMP - INTERVAL '30 days');

-- 4. Cập nhật ngưỡng sức khỏe (nếu chưa có, trigger sẽ tự tạo, nhưng có thể cập nhật tùy chỉnh)
UPDATE health_thresholds 
SET 
    heart_rate_min = 60,
    heart_rate_max = 100,
    spo2_min = 95,
    body_temp_min = 36.1,
    body_temp_max = 37.2,
    bp_systolic_min = 90,
    bp_systolic_max = 140,
    bp_diastolic_min = 60,
    bp_diastolic_max = 90
WHERE user_id = '32abe551-0984-4720-b391-10ff87ff0376';

-- 5. Thêm dữ liệu gần đây nhất (hôm nay)
INSERT INTO health_data (user_id, device_id, heart_rate, spo2, body_temperature, blood_pressure_systolic, blood_pressure_diastolic, accel_x, accel_y, accel_z, created_at) VALUES
('32abe551-0984-4720-b391-10ff87ff0376', 'd1234567-0984-4720-b391-10ff87ff0001', 72.00, 98.00, 36.6, 118.00, 78.00, 0.123, -0.234, 0.456, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('32abe551-0984-4720-b391-10ff87ff0376', 'd1234567-0984-4720-b391-10ff87ff0001', 68.00, 97.00, 36.5, 115.00, 75.00, -0.089, 0.156, -0.267, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
('32abe551-0984-4720-b391-10ff87ff0376', 'd1234567-0984-4720-b391-10ff87ff0002', 70.00, 98.00, 36.7, 120.00, 80.00, 0.234, -0.123, 0.345, CURRENT_TIMESTAMP - INTERVAL '10 minutes');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'health_data'
ORDER BY ordinal_position;

ALTER TABLE health_thresholds
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

SELECT * FROM "health_thresholds" WHERE user_id = '32abe551-0984-4720-b391-10ff87ff0376' ORDER BY "health_thresholds"."id" LIMIT 1