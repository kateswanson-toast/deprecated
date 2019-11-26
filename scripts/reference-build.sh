#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset
# set -o xtrace

ref=${1:-}
ref=${ref:=master}
echo -n "Using ref=$ref"
sha=$(git rev-parse --verify --quiet $ref || true)
if [[ ! "$sha" ]]; then
  echo -e "\nAborting, invalid ref"
  exit 1
fi
echo ", sha=$sha"

cd "./$(git rev-parse --show-cdup)"

clone_dir=.build/reference

[[ -d "$clone_dir" ]] && rm -rf $clone_dir
git clone . $clone_dir
cd $clone_dir
git checkout --quiet $sha
yarn
yarn build
cat << EOF > REFERENCE_BUILD_INFO
Reference build generated on $(date)
> ref: $ref
> sha: $sha
EOF
