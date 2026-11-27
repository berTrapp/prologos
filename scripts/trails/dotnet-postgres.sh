. /trails/lib.sh
# Setup steps of the PostgreSQL option (RN 15), after the .NET trail. Docker is the host's;
# the database is published on 55432 so it never touches a PostgreSQL already on 5432.
command -v docker >/dev/null || (apt-get update -qq && apt-get install -y -qq docker.io docker-compose >/dev/null)
export PATH="$PATH:$HOME/.dotnet/tools" DOTNET_CLI_TELEMETRY_OPTOUT=1
mkdir -p /work/dotnet-pg && cd /work/dotnet-pg
dotnet new webapi -n Api >/dev/null
cat > docker-compose.yml <<'YML'
services:
  db:
    image: postgres
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: "${DB_PASSWORD:?defina DB_PASSWORD no .env}"
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "55432:5432"
YML
printf 'DB_USER=app\nDB_NAME=agenda_de_aulas\nDB_PASSWORD=only-for-this-check\n' > .env
step "Subir o PostgreSQL" "docker compose -p prologos-dotnet-pg up -d --wait"
step "Ligar a API ao PostgreSQL" "dotnet add Api package Npgsql.EntityFrameworkCore.PostgreSQL && dotnet add Api package Microsoft.EntityFrameworkCore.Design && dotnet tool install --global dotnet-ef"
# What the step's 'ok' asks: a DbContext registered with UseNpgsql and the connection in user-secrets.
cat > Api/AppDbContext.cs <<'CS'
using Microsoft.EntityFrameworkCore;
public class Lesson { public int Id { get; set; } }
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Lesson> Lessons => Set<Lesson>();
}
CS
sed -i 's#var builder = WebApplication.CreateBuilder(args);#using Microsoft.EntityFrameworkCore;\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(builder.Configuration.GetConnectionString("Default")));#' Api/Program.cs
dotnet user-secrets init --project Api >/dev/null
dotnet user-secrets set ConnectionStrings:Default "Host=localhost;Port=55432;Database=agenda_de_aulas;Username=app;Password=only-for-this-check" --project Api >/dev/null
step "Criar as tabelas no PostgreSQL" "dotnet ef migrations add Inicial --project Api && retry dotnet ef database update --project Api"
docker compose -p prologos-dotnet-pg down -v >/dev/null 2>&1
report
