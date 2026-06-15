# ==========================================================
# GymTracker - Backend (ASP.NET Core / .NET 10)
# Multi-stage build: compila no SDK, roda no runtime enxuto
# ==========================================================

# ===== Build stage =====
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# 1) Copia a solution (.slnx) e os .csproj primeiro
#    Isso aproveita o cache de layers: o restore só roda de novo
#    se algum .csproj/.slnx mudar, não a cada alteração de código.
COPY GymTracker.slnx ./
COPY src/GymTracker.Domain/*.csproj            src/GymTracker.Domain/
COPY src/GymTracker.Application/*.csproj        src/GymTracker.Application/
COPY src/GymTracker.Infrastructure/*.csproj     src/GymTracker.Infrastructure/
COPY src/GymTracker.Api/*.csproj                src/GymTracker.Api/
COPY tests/GymTracker.IntegrationTests/*.csproj tests/GymTracker.IntegrationTests/

# 2) Restaura as dependências da solution
RUN dotnet restore GymTracker.slnx

# 3) Copia o restante do código-fonte
COPY . .

# 4) Publica APENAS a API em modo Release
#    UseAppHost=false evita gerar o executável nativo (não é necessário no container)
RUN dotnet publish src/GymTracker.Api/GymTracker.Api.csproj \
-c Release \
-o /app \
/p:UseAppHost=false

# ===== Runtime stage =====
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Copia apenas os artefatos publicados (imagem final bem menor)
COPY --from=build /app .

# A API escuta na porta 8080 (mesma do docker-compose)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "GymTracker.Api.dll"]