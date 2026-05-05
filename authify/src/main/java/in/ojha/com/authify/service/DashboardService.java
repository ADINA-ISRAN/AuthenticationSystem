package in.ojha.com.authify.service;

import in.ojha.com.authify.io.DashboardResponse;

public interface DashboardService {

    DashboardResponse getDashboard(String email);

    DashboardResponse getUserStats(String email);

}

