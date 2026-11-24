# Helpers shared by the trail checks. Each trail runs inside a clean official image.
set -u
export CI=1 npm_config_yes=true
RESULTS=()
step() { # step "<title>" <command...>
  local title=$1; shift
  echo; echo "=== $title"; echo "\$ $*"
  if (eval "$@") ; then RESULTS+=("PASS  $title"); else RESULTS+=("FAIL  $title"); fi
}
serve() { # serve "<title>" <url> <command...>: starts a dev server and waits for the page
  local title=$1 url=$2; shift 2
  echo; echo "=== $title"; echo "\$ $*"
  (eval "$@") > /tmp/serve.log 2>&1 &
  local pid=$!
  for _ in $(seq 1 180); do
    if curl -fsS -o /dev/null "$url" 2>/dev/null; then
      RESULTS+=("PASS  $title ($url)"); kill_tree $pid; return
    fi
    sleep 1
  done
  tail -40 /tmp/serve.log; RESULTS+=("FAIL  $title ($url)"); kill_tree $pid
}
log_has() { # log_has "<title>" "<text>" <command...>: runs until the log shows the text
  local title=$1 text=$2; shift 2
  echo; echo "=== $title"; echo "\$ $*"
  (eval "$@") > /tmp/serve.log 2>&1 &
  local pid=$!
  for _ in $(seq 1 300); do
    if grep -q "$text" /tmp/serve.log; then RESULTS+=("PASS  $title"); kill_tree $pid; return; fi
    if ! kill -0 $pid 2>/dev/null; then break; fi
    sleep 1
  done
  tail -40 /tmp/serve.log; RESULTS+=("FAIL  $title"); kill_tree $pid
}
kill_tree() { pkill -P "$1" 2>/dev/null; kill "$1" 2>/dev/null; sleep 1; }
report() { echo; echo "##### RESULT"; printf '%s\n' "${RESULTS[@]}"; }
