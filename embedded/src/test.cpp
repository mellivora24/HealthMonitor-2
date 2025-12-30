/*
 * TEST KẾT NỐI WIFI VÀ MQTT
 * Bảng 3.4: Kiểm thử kết nối WiFi và MQTT
 * 
 * Kịch bản test:
 * 1. Kết nối ban đầu: 2-3 giây
 * 2. Mất kết nối WiFi: Tự động kết nối lại 5-8 giây
 * 3. Ngắt MQTT Broker: Tự động kết nối lại 3-5 giây
 * 4. Đổi mạng WiFi: Yêu cầu khởi động lại
 */

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Cấu hình WiFi - CẬP NHẬT THEO MẠNG CỦA BẠN
#define WIFI_SSID "KidsLAB"
#define WIFI_PASSWORD "hoianhHung"

// Cấu hình MQTT - CẬP NHẬT THEO BROKER CỦA BẠN
#define MQTT_BROKER "192.168.1.106"
#define MQTT_PORT 1883
#define MQTT_USER "admin"
#define MQTT_PASSWORD "admin123456"
#define DEVICE_CODE "TEST_DEVICE"

char MQTT_TOPIC[64];

WiFiClient espClient;
PubSubClient mqttClient(espClient);

struct ConnectionStats {
    int wifiConnectAttempts;
    int wifiReconnects;
    int mqttConnectAttempts;
    int mqttReconnects;
    unsigned long lastWiFiConnect;
    unsigned long lastMQTTConnect;
    unsigned long totalUptime;
    unsigned long wifiDowntime;
    unsigned long mqttDowntime;
};

ConnectionStats stats = {0};
unsigned long testStartTime = 0;

// Khai báo hàm
void testInitialConnection();
void testWiFiReconnect();
void testMQTTReconnect();
void testContinuousPublish();
void testStressPublish();
void monitorRealtime();
void ensureConnected();
void reconnectMQTT();
void displayStatistics();
void resetStatistics();

void setup() {
    Serial.begin(115200);
    while (!Serial) delay(10);
    
    Serial.println("\n========================================");
    Serial.println("TEST KẾT NỐI WIFI & MQTT");
    Serial.println("========================================\n");
    
    snprintf(MQTT_TOPIC, sizeof(MQTT_TOPIC), "/health_monitor/%s/data/", DEVICE_CODE);
    
    Serial.println("Cấu hình:");
    Serial.printf("  WiFi SSID: %s\n", WIFI_SSID);
    Serial.printf("  MQTT Broker: %s:%d\n", MQTT_BROKER, MQTT_PORT);
    Serial.printf("  MQTT Topic: %s\n", MQTT_TOPIC);
    Serial.printf("  Device Code: %s\n\n", DEVICE_CODE);
    
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
    
    testStartTime = millis();
    
    delay(1000);
}

void loop() {
    Serial.println("\n========================================");
    Serial.println("MENU TEST");
    Serial.println("========================================");
    Serial.println("1. Test kết nối ban đầu");
    Serial.println("2. Test mất WiFi (tự động reconnect)");
    Serial.println("3. Test ngắt MQTT (tự động reconnect)");
    Serial.println("4. Test gửi dữ liệu liên tục");
    Serial.println("5. Stress test (100 messages)");
    Serial.println("6. Monitor real-time");
    Serial.println("7. Xem thống kê");
    Serial.println("8. Reset thống kê");
    Serial.println("\nNhập số (1-8): ");
    
    while (!Serial.available()) {
        delay(100);
    }
    
    char choice = Serial.read();
    while (Serial.available()) Serial.read();
    
    switch (choice) {
        case '1':
            testInitialConnection();
            break;
        case '2':
            testWiFiReconnect();
            break;
        case '3':
            testMQTTReconnect();
            break;
        case '4':
            testContinuousPublish();
            break;
        case '5':
            testStressPublish();
            break;
        case '6':
            monitorRealtime();
            break;
        case '7':
            displayStatistics();
            break;
        case '8':
            resetStatistics();
            break;
        default:
            Serial.println("Lựa chọn không hợp lệ!");
    }
    
    delay(2000);
}

void testInitialConnection() {
    Serial.println("\n>>> TEST 1: KẾT NỐI BAN ĐẦU");
    Serial.println("Hướng dẫn: Quan sát thời gian kết nối WiFi và MQTT\n");
    
    // Reset WiFi nếu đã kết nối
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("Ngắt kết nối WiFi hiện tại...");
        WiFi.disconnect();
        delay(1000);
    }
    
    // Test WiFi connection
    Serial.println("--- BƯỚC 1: Kết nối WiFi ---");
    unsigned long wifiStart = millis();
    
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    int attempts = 0;
    
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
        stats.wifiConnectAttempts++;
    }
    
    unsigned long wifiTime = millis() - wifiStart;
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println(" ✓ Thành công!");
        Serial.printf("Thời gian kết nối WiFi: %.2f giây\n", wifiTime / 1000.0);
        Serial.printf("IP Address: %s\n", WiFi.localIP().toString().c_str());
        Serial.printf("Signal Strength: %d dBm\n", WiFi.RSSI());
        stats.lastWiFiConnect = millis();
    } else {
        Serial.println(" ✗ Thất bại!");
        Serial.println("Kiểm tra SSID và mật khẩu");
        return;
    }
    
    delay(1000);
    
    // Test MQTT connection
    Serial.println("\n--- BƯỚC 2: Kết nối MQTT ---");
    unsigned long mqttStart = millis();
    
    while (!mqttClient.connected() && attempts < 10) {
        Serial.print("Đang kết nối MQTT...");
        
        if (mqttClient.connect(DEVICE_CODE, MQTT_USER, MQTT_PASSWORD)) {
            unsigned long mqttTime = millis() - mqttStart;
            Serial.println(" ✓ Thành công!");
            Serial.printf("Thời gian kết nối MQTT: %.2f giây\n", mqttTime / 1000.0);
            stats.lastMQTTConnect = millis();
            stats.mqttConnectAttempts++;
            break;
        } else {
            Serial.printf(" Thất bại (rc=%d)\n", mqttClient.state());
            Serial.println("  -2: Network failed");
            Serial.println("  -3: Network timeout");
            Serial.println("  -4: Connection refused - bad username/password");
            Serial.println("  -5: Connection refused - unauthorized");
            delay(2000);
            attempts++;
            stats.mqttConnectAttempts++;
        }
    }
    
    unsigned long totalTime = millis() - wifiStart;
    
    Serial.println("\n--- KẾT QUẢ ---");
    Serial.printf("Tổng thời gian: %.2f giây\n", totalTime / 1000.0);
    Serial.printf("Mục tiêu: 2-3 giây\n");
    Serial.printf("Kết quả: %s\n", 
                 (totalTime >= 2000 && totalTime <= 3000) ? "✓ ĐẠT" : "⚠ NGOÀI KHOẢNG");
    
    if (mqttClient.connected()) {
        Serial.println("\n✓ Hệ thống sẵn sàng!");
    }
}

void testWiFiReconnect() {
    Serial.println("\n>>> TEST 2: MẤT KẾT NỐI WIFI");
    Serial.println("Hướng dẫn:");
    Serial.println("1. Kết nối sẽ bị ngắt");
    Serial.println("2. Hệ thống tự động kết nối lại");
    Serial.println("3. Quan sát thời gian phục hồi\n");
    
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi chưa kết nối. Chạy Test 1 trước!");
        return;
    }
    
    Serial.println("Ngắt kết nối WiFi...");
    WiFi.disconnect();
    unsigned long disconnectTime = millis();
    
    delay(2000);
    
    Serial.println("Bắt đầu reconnect...");
    unsigned long reconnectStart = millis();
    
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    int attempts = 0;
    
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    unsigned long reconnectTime = millis() - reconnectStart;
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println(" ✓ Kết nối lại thành công!");
        Serial.printf("Thời gian phục hồi: %.2f giây\n", reconnectTime / 1000.0);
        Serial.printf("Mục tiêu: 5-8 giây\n");
        Serial.printf("Kết quả: %s\n", 
                     (reconnectTime >= 5000 && reconnectTime <= 8000) ? "✓ ĐẠT" : "⚠ NGOÀI KHOẢNG");
        
        stats.wifiReconnects++;
        stats.wifiDowntime += (millis() - disconnectTime);
        
        // Reconnect MQTT
        Serial.println("\nKết nối lại MQTT...");
        reconnectMQTT();
    } else {
        Serial.println(" ✗ Không thể kết nối lại!");
    }
}

void testMQTTReconnect() {
    Serial.println("\n>>> TEST 3: NGẮT MQTT BROKER");
    Serial.println("Hướng dẫn:");
    Serial.println("1. MQTT sẽ bị ngắt kết nối");
    Serial.println("2. Hệ thống tự động kết nối lại");
    Serial.println("3. Quan sát thời gian phục hồi\n");
    
    if (!mqttClient.connected()) {
        Serial.println("MQTT chưa kết nối. Chạy Test 1 trước!");
        return;
    }
    
    Serial.println("Ngắt kết nối MQTT...");
    mqttClient.disconnect();
    unsigned long disconnectTime = millis();
    
    delay(2000);
    
    Serial.println("Bắt đầu reconnect...");
    unsigned long reconnectStart = millis();
    
    bool success = false;
    int attempts = 0;
    
    while (attempts < 10) {
        Serial.print("Thử kết nối lại...");
        
        if (mqttClient.connect(DEVICE_CODE, MQTT_USER, MQTT_PASSWORD)) {
            unsigned long reconnectTime = millis() - reconnectStart;
            Serial.println(" ✓ Thành công!");
            Serial.printf("Thời gian phục hồi: %.2f giây\n", reconnectTime / 1000.0);
            Serial.printf("Mục tiêu: 3-5 giây\n");
            Serial.printf("Kết quả: %s\n", 
                         (reconnectTime >= 3000 && reconnectTime <= 5000) ? "✓ ĐẠT" : "⚠ NGOÀI KHOẢNG");
            
            stats.mqttReconnects++;
            stats.mqttDowntime += (millis() - disconnectTime);
            success = true;
            break;
        } else {
            Serial.printf(" Thất bại (rc=%d)\n", mqttClient.state());
            delay(1000);
            attempts++;
        }
    }
    
    if (!success) {
        Serial.println("\n✗ Không thể kết nối lại MQTT!");
        Serial.println("Kiểm tra:");
        Serial.println("  - MQTT broker có đang chạy?");
        Serial.println("  - Địa chỉ IP có đúng?");
        Serial.println("  - Username/Password có đúng?");
    }
}

void testContinuousPublish() {
    Serial.println("\n>>> TEST 4: GỬI DỮ LIỆU LIÊN TỤC");
    Serial.println("Gửi 20 messages, mỗi 2 giây");
    Serial.println("Nhấn 'q' để dừng sớm\n");
    
    ensureConnected();
    
    int successCount = 0;
    int failCount = 0;
    
    for (int i = 0; i < 20; i++) {
        if (Serial.available() && Serial.read() == 'q') {
            break;
        }
        
        ensureConnected();
        
        StaticJsonDocument<256> doc;
        doc["device_code"] = DEVICE_CODE;
        doc["test_number"] = i + 1;
        doc["heart_rate"] = 70 + random(-5, 5);
        doc["spo2"] = 97 + random(-2, 2);
        doc["timestamp"] = millis();
        
        char jsonBuffer[256];
        serializeJson(doc, jsonBuffer);
        
        if (mqttClient.publish(MQTT_TOPIC, jsonBuffer)) {
            successCount++;
            Serial.printf("[%d/20] ✓ Gửi thành công: %s\n", i + 1, jsonBuffer);
        } else {
            failCount++;
            Serial.printf("[%d/20] ✗ Gửi thất bại\n", i + 1);
        }
        
        mqttClient.loop();
        delay(2000);
    }
    
    Serial.println("\n--- KẾT QUẢ ---");
    Serial.printf("Thành công: %d\n", successCount);
    Serial.printf("Thất bại: %d\n", failCount);
    Serial.printf("Tỷ lệ thành công: %.1f%%\n", (successCount * 100.0) / (successCount + failCount));
}

void testStressPublish() {
    Serial.println("\n>>> TEST 5: STRESS TEST");
    Serial.println("Gửi 100 messages nhanh nhất có thể\n");
    
    ensureConnected();
    
    int successCount = 0;
    int failCount = 0;
    unsigned long startTime = millis();
    
    for (int i = 0; i < 100; i++) {
        ensureConnected();
        
        StaticJsonDocument<256> doc;
        doc["device_code"] = DEVICE_CODE;
        doc["msg_id"] = i + 1;
        doc["value"] = random(100);
        
        char jsonBuffer[256];
        serializeJson(doc, jsonBuffer);
        
        if (mqttClient.publish(MQTT_TOPIC, jsonBuffer)) {
            successCount++;
        } else {
            failCount++;
        }
        
        mqttClient.loop();
        
        if (i % 10 == 0) {
            Serial.printf("Progress: %d/100\n", i);
        }
        
        delay(50);  // 50ms delay để không quá tải
    }
    
    unsigned long totalTime = millis() - startTime;
    
    Serial.println("\n--- KẾT QUẢ STRESS TEST ---");
    Serial.printf("Tổng thời gian: %.2f giây\n", totalTime / 1000.0);
    Serial.printf("Thành công: %d\n", successCount);
    Serial.printf("Thất bại: %d\n", failCount);
    Serial.printf("Tỷ lệ thành công: %.1f%%\n", (successCount * 100.0) / 100);
    Serial.printf("Throughput: %.1f msg/s\n", (successCount * 1000.0) / totalTime);
}

void monitorRealtime() {
    Serial.println("\n>>> TEST 6: MONITOR REAL-TIME");
    Serial.println("Nhấn 'q' để dừng\n");
    
    while (true) {
        if (Serial.available() && Serial.read() == 'q') {
            break;
        }
        
        bool wifiOk = (WiFi.status() == WL_CONNECTED);
        bool mqttOk = mqttClient.connected();
        
        Serial.printf("[%lu ms] WiFi: %s (%d dBm) | MQTT: %s\n",
                     millis(),
                     wifiOk ? "✓" : "✗",
                     WiFi.RSSI(),
                     mqttOk ? "✓" : "✗");
        
        if (!wifiOk || !mqttOk) {
            Serial.println("  → Attempting reconnect...");
            ensureConnected();
        }
        
        mqttClient.loop();
        delay(1000);
    }
}

void ensureConnected() {
    // Check WiFi
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi disconnected. Reconnecting...");
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        
        int attempts = 0;
        while (WiFi.status() != WL_CONNECTED && attempts < 20) {
            delay(500);
            Serial.print(".");
            attempts++;
        }
        
        if (WiFi.status() == WL_CONNECTED) {
            Serial.println(" ✓ WiFi reconnected!");
            stats.wifiReconnects++;
        }
    }
    
    // Check MQTT
    if (!mqttClient.connected()) {
        reconnectMQTT();
    }
}

void reconnectMQTT() {
    int attempts = 0;
    while (!mqttClient.connected() && attempts < 5) {
        Serial.print("Connecting to MQTT...");
        
        if (mqttClient.connect(DEVICE_CODE, MQTT_USER, MQTT_PASSWORD)) {
            Serial.println(" ✓ connected!");
            stats.mqttReconnects++;
            return;
        } else {
            Serial.printf(" failed (rc=%d), retrying...\n", mqttClient.state());
            delay(2000);
            attempts++;
        }
    }
}

void displayStatistics() {
    Serial.println("\n========================================");
    Serial.println("THỐNG KÊ KẾT NỐI");
    Serial.println("========================================");
    Serial.printf("Uptime: %.1f phút\n", (millis() - testStartTime) / 60000.0);
    Serial.println("\nWiFi:");
    Serial.printf("  Lần kết nối: %d\n", stats.wifiConnectAttempts);
    Serial.printf("  Lần reconnect: %d\n", stats.wifiReconnects);
    Serial.printf("  Downtime: %.1f giây\n", stats.wifiDowntime / 1000.0);
    Serial.println("\nMQTT:");
    Serial.printf("  Lần kết nối: %d\n", stats.mqttConnectAttempts);
    Serial.printf("  Lần reconnect: %d\n", stats.mqttReconnects);
    Serial.printf("  Downtime: %.1f giây\n", stats.mqttDowntime / 1000.0);
}

void resetStatistics() {
    stats = {0};
    testStartTime = millis();
    Serial.println("\n✓ Đã reset thống kê!");
}