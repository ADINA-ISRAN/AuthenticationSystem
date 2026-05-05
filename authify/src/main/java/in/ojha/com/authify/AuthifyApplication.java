package in.ojha.com.authify;

import in.ojha.com.authify.config.DotEnvEnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Map;

@SpringBootApplication
public class AuthifyApplication {

	public static void main(String[] args) {
		SpringApplication application = new SpringApplication(AuthifyApplication.class);
		Map<String, Object> dotEnvValues = DotEnvEnvironmentPostProcessor.loadDotEnvFile();
		if (!dotEnvValues.isEmpty()) {
			application.setDefaultProperties(dotEnvValues);
		}
		application.run(args);
	}

}
