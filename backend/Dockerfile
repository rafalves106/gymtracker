# ===== Build stage =====
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY GymTracker.slnx ./
COPY src/GymTracker.Domain/*.csproj            src/GymTracker.Domain/
COPY src/GymTracker.Application/*.csproj        src/GymTracker.Application/
COPY src/GymTracker.Infrastructure/*.csproj     src/GymTracker.Infrastructure/
COPY src/GymTracker.Api/*.csproj                src/GymTracker.Api/
COPY tests/GymTracker.IntegrationTests/*.csproj tests/GymTracker.IntegrationTests/
RUN dotnet restore GymTracker.slnx

COPY . .
RUN dotnet publish src/GymTracker.Api/GymTracker.Api.csproj -c Release -o /app /p:UseAppHost=false

# ===== Runtime stage =====
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "GymTracker.Api.dll"]