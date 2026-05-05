package in.ojha.com.authify.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.net.ssl.SSLHandshakeException;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${spring.mail.password:}")
    private String smtpPassword;

    @Value("${spring.mail.properties.mail.smtp.from:no-reply@authify.local}")
    private String fromEmail;

    private boolean isSmtpConfigured() {
        return StringUtils.hasText(smtpUsername) && StringUtils.hasText(smtpPassword);
    }

    private String resolveFromAddress() {
        return StringUtils.hasText(fromEmail) ? fromEmail : smtpUsername;
    }

    private void sendWithFallbackFrom(SimpleMailMessage message) {
        try {
            mailSender.send(message);
            return;
        } catch (MailException firstEx) {
            String rootMessage = getRootMessage(firstEx).toLowerCase(Locale.ROOT);
            boolean senderIssue = rootMessage.contains("sender") || rootMessage.contains("from");

            if (senderIssue && StringUtils.hasText(smtpUsername) && !smtpUsername.equals(message.getFrom())) {
                log.warn("Primary SMTP sender '{}' was rejected. Retrying with authenticated sender '{}'.",
                        message.getFrom(), smtpUsername);
                SimpleMailMessage retryMessage = new SimpleMailMessage(message);
                retryMessage.setFrom(smtpUsername);
                mailSender.send(retryMessage);
                return;
            }

            throw firstEx;
        }
    }

    private String getRootMessage(Throwable throwable) {
        Throwable root = throwable;
        while (root.getCause() != null) {
            root = root.getCause();
        }
        return root.getMessage() == null ? "Unknown SMTP error" : root.getMessage();
    }

    private IllegalStateException buildOtpMailFailure(String genericMessage, MailException ex) {
        Throwable root = ex;
        while (root.getCause() != null) {
            root = root.getCause();
        }

        String rootMessage = getRootMessage(ex);

        if (root instanceof SSLHandshakeException ||
                rootMessage.contains("PKIX path building failed")) {
            return new IllegalStateException(
                    "Unable to send OTP email due to SMTP TLS certificate trust failure. " +
                            "Set MAIL_SSL_TRUST to your SMTP host or import the SMTP certificate chain into the JVM truststore.",
                    ex
            );
        }

        if (rootMessage.toLowerCase(Locale.ROOT).contains("authentication") ||
                rootMessage.toLowerCase(Locale.ROOT).contains("no password specified")) {
            return new IllegalStateException(
                    "SMTP authentication failed. Verify MAIL_USERNAME and MAIL_PASSWORD in .env.backend.",
                    ex
            );
        }

        if (rootMessage.toLowerCase(Locale.ROOT).contains("sender") ||
                rootMessage.toLowerCase(Locale.ROOT).contains("from")) {
            return new IllegalStateException(
                    "SMTP rejected sender identity. Set MAIL_FROM to a sender verified in your SMTP provider.",
                    ex
            );
        }

        return new IllegalStateException(genericMessage + " Root cause: " + rootMessage, ex);
    }

    public void sendWelcomeEmail(String toEmail,String name){
        if (!isSmtpConfigured()) {
            log.warn("SMTP credentials are not configured. Skipping welcome email for {}.", toEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(resolveFromAddress());
            message.setTo(toEmail);
            message.setSubject("Welcome to our platform");
            message.setText("Hello " + name + ",\n\nThanks for registering with us!\n\nRegards,\nAuthify Team");
            sendWithFallbackFrom(message);
        } catch (MailException ex) {
            log.warn("Welcome email could not be sent to {}. Registration will continue. Reason: {}", toEmail, ex.getMessage());
        }
    }

    public void sendResetOtpEmail(String toEmail, String otp){

        if (!isSmtpConfigured()) {
            throw new IllegalStateException("SMTP is not configured. Set MAIL_USERNAME and MAIL_PASSWORD before sending OTP emails.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(resolveFromAddress());
        message.setTo(toEmail);
        message.setSubject("Password Reset OTP");
        message.setText("Your OTP for resetting your password is: " + otp + ". Use this OTP to proceed further.");

        try {
            sendWithFallbackFrom(message);
        } catch (MailException ex) {
            throw buildOtpMailFailure("Unable to send password reset OTP email. Check SMTP host, port, username, password, and provider permissions.", ex);
        }

    }

    public void sendOtpEmail(String toEmail, String otp) {

        if (!isSmtpConfigured()) {
            throw new IllegalStateException("SMTP is not configured. Set MAIL_USERNAME and MAIL_PASSWORD before sending OTP emails.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(resolveFromAddress());
        message.setTo(toEmail);
        message.setSubject("Account Verification OTP");
        message.setText("Your OTP is " + otp + ". Verify your account using this OTP.");

        try {
            sendWithFallbackFrom(message);
        } catch (MailException ex) {
            throw buildOtpMailFailure("Unable to send verification OTP email. Check SMTP host, port, username, password, and provider permissions.", ex);
        }
    }


}
