package in.ojha.com.authify.config;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;

public final class DotEnvEnvironmentPostProcessor {

    private static final String DOT_ENV_FILE = ".env.backend";

    private DotEnvEnvironmentPostProcessor() {
    }

    public static Map<String, Object> loadDotEnvFile() {
        Path envFile = findDotEnvFile();
        if (envFile == null) {
            return Map.of();
        }

        Properties properties = new Properties();
        try (InputStream inputStream = Files.newInputStream(envFile)) {
            properties.load(inputStream);
        } catch (IOException ex) {
            return Map.of();
        }

        Map<String, Object> values = new LinkedHashMap<>();
        for (String name : properties.stringPropertyNames()) {
            values.put(name, properties.getProperty(name));
        }

        if (!values.containsKey("MAIL_FROM") && values.containsKey("MAIL_USERNAME")) {
            values.put("MAIL_FROM", values.get("MAIL_USERNAME"));
        }

        return values;
    }

    private static Path findDotEnvFile() {
        Path current = Path.of(System.getProperty("user.dir", ".")).toAbsolutePath();
        while (current != null) {
            Path candidate = current.resolve(DOT_ENV_FILE);
            if (Files.exists(candidate)) {
                return candidate;
            }
            current = current.getParent();
        }
        return null;
    }
}

