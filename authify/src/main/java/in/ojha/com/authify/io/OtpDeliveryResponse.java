package in.ojha.com.authify.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpDeliveryResponse {

    private boolean delivered;
    private boolean devMode;
    private String email;
    private String message;
    private String otp;
}