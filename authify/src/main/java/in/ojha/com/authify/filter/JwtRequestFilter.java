package in.ojha.com.authify.filter;

import in.ojha.com.authify.service.AppUserDetailService;
import in.ojha.com.authify.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.http.HttpMethod;

import java.io.IOException;
import java.util.List;


@Component
@AllArgsConstructor
public class JwtRequestFilter extends OncePerRequestFilter {

    private final AppUserDetailService appUserDetailService;
    private final JwtUtil jwtUtil;

        private static final List<String> PROTECTED_URLS = List.of(
            "/profile",
            "/dashboard",
            "/is-authenticated",
                    "/auth/is-authenticated",
            "/api/v1.0/profile",
            "/api/v1.0/dashboard",
                    "/api/v1.0/is-authenticated",
                    "/api/v1.0/auth/is-authenticated"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getServletPath();
        boolean requiresAuthentication = PROTECTED_URLS.stream()
            .anyMatch(protectedPath -> path.equals(protectedPath) || path.startsWith(protectedPath + "/"));

        if (!requiresAuthentication) {
            filterChain.doFilter(request,response);
            return;
        }
        String jwt = null;
        String email = null;

        //Check the authorization header
        final String authorizationHeader = request.getHeader("Authorization");
        if(authorizationHeader != null && authorizationHeader.startsWith("Bearer ")){
            jwt = authorizationHeader.substring(7);
        }

        //if not found in the header, check cookies

        if(jwt == null){
            Cookie[] cookies = request.getCookies();
            if(cookies!=null){
                for(Cookie cookie: cookies){
                    if("jwt".equals(cookie.getName())){
                        jwt = cookie.getValue();
                        break;
                    }
                }
            }
        }
        // validate the token and set security context

        if (jwt != null) {
            email = jwtUtil.extractEmail(jwt);

            if (email != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails =
                        appUserDetailService.loadUserByUsername(email);

                if (jwtUtil.validateToken(jwt, userDetails)) {

                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());

                    authenticationToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext()
                            .setAuthentication(authenticationToken);
                }
            }
        }


        filterChain.doFilter(request,response);


    }
}
