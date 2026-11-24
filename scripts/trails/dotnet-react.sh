. /trails/lib.sh; mkdir -p /work && cd /work
step "Instalar o SDK" dotnet --version
step "Criar a API" "dotnet new webapi -n Api && test -f Api/Program.cs"
log_has "Rodar a API" "Now listening on" "dotnet run --project Api"
step "Primeiro teste" "dotnet new xunit -n Api.Tests && dotnet test Api.Tests"
report
