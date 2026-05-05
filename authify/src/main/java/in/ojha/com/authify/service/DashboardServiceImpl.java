package in.ojha.com.authify.service;

import in.ojha.com.authify.entity.UserEntity;
import in.ojha.com.authify.io.DashboardResponse;
import in.ojha.com.authify.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;

    @Override
    public DashboardResponse getDashboard(String email) {

        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return convertToDashboardResponse(existingUser);
    }

    @Override
    public DashboardResponse getUserStats(String email) {

        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        DashboardResponse dashboardResponse = convertToDashboardResponse(existingUser);
        // Set actual stats from user entity
        dashboardResponse.setTotalLoginCount(existingUser.getLoginCount() != null ? existingUser.getLoginCount() : 0L);
        dashboardResponse.setLastLoginTime(existingUser.getLastLoginTime() != null ? 
                new Timestamp(existingUser.getLastLoginTime()).toString() : "Never");

        return dashboardResponse;
    }

    private DashboardResponse convertToDashboardResponse(UserEntity userEntity) {

        return DashboardResponse.builder()
                .userId(userEntity.getUserId())
                .name(userEntity.getName())
                .email(userEntity.getEmail())
                .isAccountVerified(userEntity.getIsAccountVerified())
                .createdAt(userEntity.getCreatedAt())
                .updatedAt(userEntity.getUpdatedAt())
                .build();
    }

}

