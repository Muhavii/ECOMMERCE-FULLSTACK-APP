FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/ecommerce-api-1.0.0.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
