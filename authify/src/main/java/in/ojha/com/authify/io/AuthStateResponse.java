package in.ojha.com.authify.io;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthStateResponse {

    private boolean authenticated;
    private String email;
    private boolean accountVerified;
}

