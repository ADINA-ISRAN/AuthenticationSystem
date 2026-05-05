package in.ojha.com.authify.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardResponse {

    private String userId;
    private String name;
    private String email;
    private Boolean isAccountVerified;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private Long totalLoginCount;
    private String lastLoginTime;

}

