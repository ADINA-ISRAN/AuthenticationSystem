package in.ojha.com.authify.service;


import in.ojha.com.authify.io.OtpDeliveryResponse;
import in.ojha.com.authify.io.ProfileRequest;
import in.ojha.com.authify.io.ProfileResponse;
import in.ojha.com.authify.io.UpdateProfileRequest;

public interface ProfileService {

    ProfileResponse createProfile(ProfileRequest request);

    ProfileResponse getProfile(String email);

    ProfileResponse updateProfile(String email, UpdateProfileRequest request);

    void sendResetOtp(String email);

    void resetPassword(String email,String otp, String newPassword);

    OtpDeliveryResponse sendOtp(String email);

    void verifyOtp(String email,String otp);




}
