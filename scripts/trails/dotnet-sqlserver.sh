. /trails/lib.sh
# Setup steps of the SQL Server option (RN 15), after the .NET trail. Docker is the host's;
# the database is published on 51433 so it never touches a SQL Server already on 1433.
command -v docker >/dev/null || (apt-get update -qq && apt-get install -y -qq docker.io docker-compose >/dev/null)
export PATH="$PATH:$HOME/.dotnet/tools" DOTNET_CLI_TELEMETRY_OPTOUT=1
mkdir -p /work/dotnet-ms && cd /work/dotnet-ms
dotnet new webapi -n Api >/dev/null
cat > docker-compose.yml <<'YML'
services:
  db:
    image: mcr.microsoft.com/mssql/server
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: "${DB_PASSWORD:?defina DB_PASSWORD no .env}"
    ports:
      - "51433:1433"
YML
# SQL Server refuses a weak sa password: 8+ characters with upper, lower, digit or symbol.
printf 'DB_NAME=agenda_de_aulas\nDB_PASSWORD=Only-for-this-check1\n' > .env
step "Subir o SQL Server" "docker compose -p prologos-dotnet-ms up -d --wait"
step "Ligar a API ao SQL Server" "dotnet add Api package Microsoft.EntityFrameworkCore.SqlServer && dotnet add Api package Microsoft.EntityFrameworkCore.Design && dotnet tool install --global dotnet-ef"
cat > Api/AppDbContext.cs <<'CS'
using Microsoft.EntityFrameworkCore;
public class Lesson { public int Id { get; set; } }
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Lesson> Lessons => Set<Lesson>();
}
CS
sed -i 's#var builder = WebApplication.CreateBuilder(args);#using Microsoft.EntityFrameworkCore;\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddDbContext<AppDbContext>(o => o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));#' Api/Program.cs
dotnet user-secrets init --project Api >/dev/null
dotnet user-secrets set ConnectionStrings:Default "Server=localhost,51433;Database=agenda_de_aulas;User Id=sa;Password=Only-for-this-check1;TrustServerCertificate=True" --project Api >/dev/null
step "Criar as tabelas no SQL Server" "dotnet ef migrations add Inicial --project Api && retry dotnet ef database update --project Api"
docker compose -p prologos-dotnet-ms down -v >/dev/null 2>&1
report
