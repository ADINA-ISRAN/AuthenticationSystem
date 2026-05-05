package in.ojha.com.authify.service;


import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import in.ojha.com.authify.entity.UserEntity;
import in.ojha.com.authify.io.OtpDeliveryResponse;
import in.ojha.com.authify.io.ProfileRequest;
import in.ojha.com.authify.io.ProfileResponse;
import in.ojha.com.authify.io.UpdateProfileRequest;
import in.ojha.com.authify.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;



    @Override
    public ProfileResponse createProfile(ProfileRequest request){

        UserEntity newProfile = convertToUserEntity(request);
        if(!userRepository.existsByEmail(request.getEmail())){
            newProfile = userRepository.save(newProfile);
            return convertToProfileResponse(newProfile);
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT,"Email already exists");

    }

    @Override
    public ProfileResponse getProfile(String email) {

        UserEntity existingUser=userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found" + email));
        return convertToProfileResponse(existingUser);
    }

    @Override
    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {

        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        existingUser.setName(request.getName());
        
        // Check if new email is different and not already in use
        if (!existingUser.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
            }
            existingUser.setEmail(request.getEmail());
        }

        UserEntity updatedUser = userRepository.save(existingUser);
        return convertToProfileResponse(updatedUser);
    }

    @Override
    public void sendResetOtp(String email) {
        UserEntity existingEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found:" + email));
        //Generate 6 digit otp
        String otp =String.valueOf(ThreadLocalRandom.current().nextInt(100000,1000000));

        //calculate the expiry time(current time + 15 min in milli seconds)
        long expiryTime = System.currentTimeMillis() + (15 * 60 * 1000);


        //update the profile/user

        existingEntity.setResetOtp(otp);
        existingEntity.setResetOtpExpireAt(expiryTime);

        //save into the database
        userRepository.save(existingEntity);
        emailService.sendResetOtpEmail(existingEntity.getEmail(),otp);

    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {

        UserEntity existingUser=userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found:" +email));

        if(existingUser.getResetOtp() == null || !existingUser.getResetOtp().equals(otp)){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }

        if(existingUser.getResetOtpExpireAt() < System.currentTimeMillis()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP Expired");
        }
        existingUser.setPassword(passwordEncoder.encode(newPassword));
        existingUser.setResetOtp(null);
        existingUser.setResetOtpExpireAt(0L);

        userRepository.save(existingUser);

    }

    @Override
    public OtpDeliveryResponse sendOtp(String email) {

        UserEntity existingUser=userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found:" +email));
        if(existingUser.getIsAccountVerified() != null && existingUser.getIsAccountVerified()){
            return OtpDeliveryResponse.builder()
                    .delivered(true)
                    .devMode(false)
                    .email(email)
                    .message("Email is already verified")
                    .build();
        }
        //Generate 6 digit Otp
        String otp =String.valueOf(ThreadLocalRandom.current().nextInt(100000,1000000));

        //calculate the expiry time(current time + 24 hour in milli seconds)
        long expiryTime = System.currentTimeMillis() + (24 * 60 * 60 * 1000);

        //update the user entity
        existingUser.setVerifyOtp(otp);
        existingUser.setVerifyOtpExpireAt(expiryTime);

        //save to database
        userRepository.save(existingUser);
        try {
            emailService.sendOtpEmail(existingUser.getEmail(),otp);
            return OtpDeliveryResponse.builder()
                    .delivered(true)
                    .devMode(false)
                    .email(email)
                    .message("OTP sent successfully")
                    .build();
        } catch (IllegalStateException ex) {
            if (ex.getMessage() != null && ex.getMessage().contains("SMTP is not configured")) {
                return OtpDeliveryResponse.builder()
                        .delivered(false)
                        .devMode(true)
                        .email(email)
                        .otp(otp)
                        .message("SMTP is not configured. Use this OTP in local development.")
                        .build();
            }
            throw ex;
        }






    }

    @Override
    public void verifyOtp(String email, String otp) {

        UserEntity existingUser=userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found:"+email));
        if(existingUser.getVerifyOtp() == null || !existingUser.getVerifyOtp().equals(otp)){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }
        if(existingUser.getVerifyOtpExpireAt()< System.currentTimeMillis()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP Expired");
        }
        existingUser.setIsAccountVerified(true);
        existingUser.setVerifyOtp(null);
        existingUser.setVerifyOtpExpireAt(0L);

        userRepository.save(existingUser);

    }



    private ProfileResponse convertToProfileResponse(UserEntity newProfile) {

        return ProfileResponse.builder()
                .name(newProfile.getName())
                .email(newProfile.getEmail())
                .userId(newProfile.getUserId())
                .isAccountVerified(newProfile.getIsAccountVerified())
                .build();
    }

    private UserEntity convertToUserEntity(ProfileRequest request) {

        return UserEntity.builder()
                .email(request.getEmail())
                .userId(UUID.randomUUID().toString())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .isAccountVerified(false)
                .resetOtpExpireAt(0L)
                .verifyOtp(null)
                .verifyOtpExpireAt(0L)
                .resetOtp(null)
                .build();
    }
}

