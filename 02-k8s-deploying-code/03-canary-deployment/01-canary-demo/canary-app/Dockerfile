FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /src
COPY canary-app.csproj .
RUN dotnet restore canary-app.csproj
COPY . .
RUN dotnet build canary-app.csproj -c Release -o /app

FROM build AS publish
RUN dotnet publish canary-app.csproj -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "canary-app.dll"]
