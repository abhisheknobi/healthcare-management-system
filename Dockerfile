# Stage 1: Build the Backend
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the Application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
# Render provides a PORT environment variable, we use it to override server.port
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8081}"]