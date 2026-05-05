# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copy the specific backend folder
COPY authify /app/authify
WORKDIR /app/authify
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
# Find the jar inside the authify/target folder
COPY --from=build /app/authify/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
