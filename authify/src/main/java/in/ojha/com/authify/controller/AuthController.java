package in.ojha.com.authify.controller;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import in.ojha.com.authify.entity.UserEntity;
import in.ojha.com.authify.io.AuthRequest;
import in.ojha.com.authify.io.AuthResponse;
import in.ojha.com.authify.io.AuthStateResponse;
import in.ojha.com.authify.io.ResetPasswordRequest;
import in.ojha.com.authify.repository.UserRepository;
import in.ojha.com.authify.service.AppUserDetailService;
import in.ojha.com.authify.service.ProfileService;
import in.ojha.com.authify.util.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AppUserDetailService appUserDetailService;
    private final JwtUtil jwtUtil;
    private final ProfileService profileService;
    private final UserRepository userRepository;

    @PostMapping({
            "/login", "/auth/login",
            "/api/v1.0/login", "/api/v1.0/auth/login"
    })
    public ResponseEntity<?> login(@RequestBody AuthRequest request){

        try {
            authenticate(request.getEmail(),request.getPassword());
            final UserDetails userDetails=appUserDetailService.loadUserByUsername(request.getEmail());
            final String jwtToken = jwtUtil.generateToken(userDetails);
            
            // Update login statistics
            UserEntity user = userRepository.findByEmail(request.getEmail()).orElse(null);
            if (user != null) {
                Long currentLoginCount = user.getLoginCount() != null ? user.getLoginCount() : 0L;
                user.setLoginCount(currentLoginCount + 1);
                user.setLastLoginTime(System.currentTimeMillis());
                userRepository.save(user);
            }
            
                ResponseCookie cookie = ResponseCookie.from("jwt",jwtToken)
                    .httpOnly(true)
                    .path("/")
                    .maxAge(Duration.ofDays(1))
                    .sameSite("None")
                    .secure(true)
                    .build();
            Boolean isAccountVerified = user != null ? Boolean.TRUE.equals(user.getIsAccountVerified()) : false;
            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE,cookie.toString())
                    .body(new AuthResponse(request.getEmail(),jwtToken, isAccountVerified));


        }catch (BadCredentialsException ex){
            Map<String,Object> error = new HashMap<>();
            error.put("error",true);
            error.put("message","Email or password is incorrect");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }catch (DisabledException ex){
            Map<String,Object> error = new HashMap<>();
            error.put("error",true);
            error.put("message","Account is disabled");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }catch (Exception ex){
            Map<String,Object> error = new HashMap<>();
            error.put("error",true);
            error.put("message","Authentication failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }


    }

    private void authenticate(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email,password));
    }

    @GetMapping({
            "/is-authenticated", "/auth/is-authenticated",
            "/api/v1.0/is-authenticated", "/api/v1.0/auth/is-authenticated"
    })
    public ResponseEntity<Boolean> isAuthenticated(@CurrentSecurityContext(expression = "authentication?.name") String email){
        return ResponseEntity.ok(email!=null && !"anonymousUser".equalsIgnoreCase(email));
    }

    @GetMapping({"/auth/state", "/api/v1.0/auth/state"})
    public ResponseEntity<AuthStateResponse> authState(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null || token.isBlank()) {
            return ResponseEntity.ok(new AuthStateResponse(false, null, false));
        }

        try {
            String email = jwtUtil.extractEmail(token);
            if (email == null || email.isBlank()) {
                return ResponseEntity.ok(new AuthStateResponse(false, null, false));
            }

            UserEntity user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.ok(new AuthStateResponse(false, null, false));
            }

            UserDetails userDetails = appUserDetailService.loadUserByUsername(email);
            if (!jwtUtil.validateToken(token, userDetails)) {
                return ResponseEntity.ok(new AuthStateResponse(false, null, false));
            }

            return ResponseEntity.ok(new AuthStateResponse(true, email, Boolean.TRUE.equals(user.getIsAccountVerified())));
        } catch (Exception ex) {
            return ResponseEntity.ok(new AuthStateResponse(false, null, false));
        }
    }

    @PostMapping({
            "/send-reset-otp", "/auth/send-reset-otp",
            "/api/v1.0/send-reset-otp", "/api/v1.0/auth/send-reset-otp"
    })
    public  void sendResetOtp(@RequestParam(required = false) String email,
                              @RequestBody(required = false) Map<String, Object> request){

        String targetEmail = email;
        if ((targetEmail == null || targetEmail.isBlank()) && request != null && request.get("email") != null) {
            targetEmail = request.get("email").toString();
        }
        if (targetEmail == null || targetEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        try{
            profileService.sendResetOtp(targetEmail);
        }catch (ResponseStatusException e){
            throw e;
        }catch (IllegalStateException e){
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,e.getMessage(), e);
        }catch (Exception e){
            throw  new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,e.getMessage(), e);

        }


    }

    @PostMapping({
            "/reset-password", "/auth/reset-password",
            "/api/v1.0/reset-password", "/api/v1.0/auth/reset-password"
    })
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request){

        try {
            profileService.resetPassword(request.getEmail(),request.getOtp(),request.getNewPassword());
        }
        catch (ResponseStatusException e){
            throw e;
        }
        catch (IllegalStateException e){
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,e.getMessage(), e);
        }
        catch (Exception e){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,e.getMessage(), e);
        }

    }

    @PostMapping({
            "/send-otp", "/auth/send-otp",
            "/api/v1.0/send-otp", "/api/v1.0/auth/send-otp"
    })
    public void sendVerifyOtp(@RequestParam(required = false) String email,
                              @RequestBody(required = false) Map<String, Object> request,
                              @CurrentSecurityContext(expression = "authentication?.name") String authenticatedEmail){
        if ("anonymousUser".equalsIgnoreCase(authenticatedEmail)) {
            authenticatedEmail = null;
        }

        String targetEmail = email;
        if ((targetEmail == null || targetEmail.isBlank()) && request != null && request.get("email") != null) {
            targetEmail = request.get("email").toString();
        }
        if (targetEmail == null || targetEmail.isBlank()) {
            targetEmail = authenticatedEmail;
        }
        if (targetEmail == null || targetEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        try{
            profileService.sendOtp(targetEmail);
        }catch (ResponseStatusException e){
            throw e;
        }catch (IllegalStateException e){
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,e.getMessage(), e);
        }catch (Exception e){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,e.getMessage(), e);
        }

    }

    @PostMapping({
            "/verify-otp", "/auth/verify-otp",
            "/api/v1.0/verify-otp", "/api/v1.0/auth/verify-otp"
    })
    public void verifyEmail(@RequestBody Map<String , Object> request,
                            @CurrentSecurityContext(expression = "authentication?.name") String authenticatedEmail) {

        if ("anonymousUser".equalsIgnoreCase(authenticatedEmail)) {
            authenticatedEmail = null;
        }


        if(request == null || request.get("otp") == null || request.get("otp").toString().isBlank()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing details");
        }

        String targetEmail = authenticatedEmail;
        if (request.get("email") != null && !request.get("email").toString().isBlank()) {
            targetEmail = request.get("email").toString();
        }
        if (targetEmail == null || targetEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        try {
            profileService.verifyOtp(targetEmail,request.get("otp").toString());

        } catch (ResponseStatusException e) {
            throw e;
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,e.getMessage(), e);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,e.getMessage(), e);
        }



    }

    @PostMapping({
            "/logout", "/auth/logout",
            "/api/v1.0/logout", "/api/v1.0/auth/logout"
    })
    public ResponseEntity<?> logout(HttpServletResponse response){
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE,cookie.toString())
                .body("Logged out successfully!");
    }

    private String extractToken(HttpServletRequest request) {
        final String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }

        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if ("jwt".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
