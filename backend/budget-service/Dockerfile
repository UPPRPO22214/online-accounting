FROM eclipse-temurin:21

WORKDIR /app

COPY . .

RUN ./grablew build 

EXPOSE 50052

CMD ["java", "-jar", "./build/libs/app.jar"]
