. /trails/lib.sh
# The trail needs Docker (the kit's Docker item): the container drives the host's Docker.
command -v docker >/dev/null || (apt-get update -qq && apt-get install -y -qq curl unzip docker.io docker-compose-v2 >/dev/null)
mkdir -p /work && cd /work
step "Instalar o JDK" java -version
step "Gerar o projeto" "curl -fsS https://start.spring.io/starter.tgz -d type=maven-project -d dependencies=web,data-jpa,validation,security,flyway,postgresql,actuator,docker-compose,testcontainers -o api.tgz && mkdir api && tar -xzf api.tgz -C api && test -f api/pom.xml && test -f api/compose.yaml"
cd api
log_has "Rodar a API (sobe o PostgreSQL pelo compose.yaml)" "Started " "./mvnw -q spring-boot:run"
docker compose down -v >/dev/null 2>&1
step "Primeiro teste (Testcontainers)" "./mvnw -q test"
report
