package in.ojha.com.authify.controller;

import in.ojha.com.authify.io.DashboardResponse;
import in.ojha.com.authify.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/dashboard", "/api/v1.0/dashboard"})
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public DashboardResponse getDashboard(@CurrentSecurityContext(expression = "authentication?.name") String email) {

        return dashboardService.getDashboard(email);
    }

    @GetMapping("/stats")
    @ResponseStatus(HttpStatus.OK)
    public DashboardResponse getUserStats(@CurrentSecurityContext(expression = "authentication?.name") String email) {

        return dashboardService.getUserStats(email);
    }

}

