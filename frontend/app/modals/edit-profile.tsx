import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { useAuthStore } from '../../src/store/authStore';
import { userApi } from '../../src/api';
import { validators } from '../../src/utils/validation';
import { COLORS, SPACING, FONT_SIZES } from '../../src/constants/theme';

export default function EditProfileModal() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    date_of_birth: user?.date_of_birth || '',
    gender: user?.gender || '',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState({
    full_name: '',
    phone: '',
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const validateProfile = (): boolean => {
    const newErrors = {
      full_name: validators.fullName(profileForm.full_name) || '',
      phone: validators.phone(profileForm.phone) || '',
      old_password: '',
      new_password: '',
      confirm_password: '',
    };

    setErrors(newErrors);
    return !newErrors.full_name && !newErrors.phone;
  };

  const validatePassword = (): boolean => {
    const newErrors = {
      full_name: '',
      phone: '',
      old_password: validators.password(passwordForm.old_password) || '',
      new_password: validators.password(passwordForm.new_password) || '',
      confirm_password:
        passwordForm.new_password !== passwordForm.confirm_password
          ? 'Mật khẩu không khớp'
          : '',
    };

    setErrors(newErrors);
    return !newErrors.old_password && !newErrors.new_password && !newErrors.confirm_password;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfile()) return;

    setIsLoading(true);
    try {
      const data = {
        full_name: profileForm.full_name,
        phone: profileForm.phone || undefined,
        date_of_birth: profileForm.date_of_birth || undefined,
        gender: profileForm.gender || undefined,
        height: profileForm.height ? parseFloat(profileForm.height) : undefined,
        weight: profileForm.weight ? parseFloat(profileForm.weight) : undefined,
      };

      const updatedUser = await userApi.updateProfile(data);
      updateProfile(updatedUser);
      Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      await userApi.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      Alert.alert('Thành công', 'Đã đổi mật khẩu', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đổi mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {showChangePassword ? 'Đổi mật khẩu' : 'Chỉnh sửa hồ sơ'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!showChangePassword ? (
          <>
            <Input
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              value={profileForm.full_name}
              onChangeText={(text) => {
                setProfileForm({ ...profileForm, full_name: text });
                setErrors({ ...errors, full_name: '' });
              }}
              error={errors.full_name}
            />

            <Input
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              value={profileForm.phone}
              onChangeText={(text) => {
                setProfileForm({ ...profileForm, phone: text });
                setErrors({ ...errors, phone: '' });
              }}
              error={errors.phone}
              keyboardType="phone-pad"
            />

            <Input
              label="Ngày sinh (YYYY-MM-DD)"
              placeholder="Nhập ngày sinh"
              value={profileForm.date_of_birth}
              onChangeText={(text) =>
                setProfileForm({ ...profileForm, date_of_birth: text })
              }
            />

            <Input
              label="Giới tính"
              placeholder="Nam/Nữ/Khác"
              value={profileForm.gender}
              onChangeText={(text) => setProfileForm({ ...profileForm, gender: text })}
            />

            <View style={styles.row}>
              <Input
                label="Chiều cao (cm)"
                placeholder="Chiều cao"
                value={profileForm.height}
                onChangeText={(text) =>
                  setProfileForm({ ...profileForm, height: text })
                }
                keyboardType="numeric"
                style={styles.halfInput}
              />

              <Input
                label="Cân nặng (kg)"
                placeholder="Cân nặng"
                value={profileForm.weight}
                onChangeText={(text) =>
                  setProfileForm({ ...profileForm, weight: text })
                }
                keyboardType="numeric"
                style={styles.halfInput}
              />
            </View>

            <Button
              title="Cập nhật thông tin"
              onPress={handleUpdateProfile}
              isLoading={isLoading}
              style={styles.button}
            />

            <Button
              title="Đổi mật khẩu"
              onPress={() => setShowChangePassword(true)}
              variant="outline"
              style={styles.button}
            />
          </>
        ) : (
          <>
            <Input
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              value={passwordForm.old_password}
              onChangeText={(text) => {
                setPasswordForm({ ...passwordForm, old_password: text });
                setErrors({ ...errors, old_password: '' });
              }}
              error={errors.old_password}
              isPassword
            />

            <Input
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              value={passwordForm.new_password}
              onChangeText={(text) => {
                setPasswordForm({ ...passwordForm, new_password: text });
                setErrors({ ...errors, new_password: '' });
              }}
              error={errors.new_password}
              isPassword
            />

            <Input
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              value={passwordForm.confirm_password}
              onChangeText={(text) => {
                setPasswordForm({ ...passwordForm, confirm_password: text });
                setErrors({ ...errors, confirm_password: '' });
              }}
              error={errors.confirm_password}
              isPassword
            />

            <Button
              title="Đổi mật khẩu"
              onPress={handleChangePassword}
              isLoading={isLoading}
              style={styles.button}
            />

            <Button
              title="Quay lại"
              onPress={() => setShowChangePassword(false)}
              variant="outline"
              style={styles.button}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    padding: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    marginTop: SPACING.md,
  },
});