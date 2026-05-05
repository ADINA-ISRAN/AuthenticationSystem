package in.ojha.com.authify.controller;


import in.ojha.com.authify.io.ProfileRequest;
import in.ojha.com.authify.io.ProfileResponse;
import in.ojha.com.authify.io.UpdateProfileRequest;
import in.ojha.com.authify.service.EmailService;
import in.ojha.com.authify.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final EmailService emailService;

    @PostMapping({
            "/register", "/auth/register",
            "/api/v1.0/register", "/api/v1.0/auth/register"
    })
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse register(@Valid @RequestBody ProfileRequest request){

        ProfileResponse response = profileService.createProfile(request);
        emailService.sendWelcomeEmail(response.getEmail(), response.getName());
        return response;

    }

    @GetMapping({"/profile", "/api/v1.0/profile"})
    public ProfileResponse getProfile(@CurrentSecurityContext(expression = "authentication?.name") String email) {

        return profileService.getProfile(email);

    }

    @PutMapping({"/profile", "/api/v1.0/profile"})
    public ProfileResponse updateProfile(@CurrentSecurityContext(expression = "authentication?.name") String email,
                                         @Valid @RequestBody UpdateProfileRequest request) {

        return profileService.updateProfile(email, request);

    }

}


