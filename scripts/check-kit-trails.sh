#!/usr/bin/env bash
# Runs each kit's "Preparar o ambiente" trail inside a clean official image (RN 14).
# Usage: scripts/check-kit-trails.sh [kit...]   Logs go to $LOG_DIR (default: ./trail-logs).
set -u
dir=$(cd "$(dirname "$0")/trails" && pwd)
logs=${LOG_DIR:-trail-logs}; mkdir -p "$logs"
declare -A image=(
  [django]=python:3
  [laravel-react]=composer:latest
  [node-react]=node:lts
  [spring-react]=eclipse-temurin:latest
  [dotnet-react]=mcr.microsoft.com/dotnet/sdk:latest
  [web-vite]=node:lts
  [flutter]=ghcr.io/cirruslabs/flutter:stable
  [react-native]=node:lts
  [static-astro]=node:lts
)
kits=("$@"); [ ${#kits[@]} -eq 0 ] && kits=(django laravel-react node-react spring-react dotnet-react web-vite flutter react-native static-astro)
for kit in "${kits[@]}"; do
  echo ">>> $kit (${image[$kit]})"
  extra=()
  # Spring starts PostgreSQL through Docker: share the host's Docker and network.
  [ "$kit" = spring-react ] && extra=(--network host -v /var/run/docker.sock:/var/run/docker.sock)
  docker run --rm "${extra[@]}" -v "$dir:/trails:ro" --entrypoint sh "${image[$kit]}" -c "command -v bash >/dev/null || apk add -q bash; bash /trails/$kit.sh" > "$logs/$kit.log" 2>&1
  sed -n '/##### RESULT/,$p' "$logs/$kit.log" | tail -n +2
done
