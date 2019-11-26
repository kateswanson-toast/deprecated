#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset
# set -o xtrace

repo=git@github.com:toasttab/toast-gateway.git
cert_path=config/ssl

repo_dir=$(git rev-parse --show-toplevel)
repo_cert_dir=$repo_dir/.build/ssl-certs
clone_dir=$(mktemp -d /tmp/$(basename $repo .git).XXXXXX)

git clone --no-checkout --depth 1 $repo $clone_dir
cd $clone_dir
git checkout HEAD $cert_path

if [[ -z "$(ls -A $cert_path)" ]]; then
  echo "Aborting, no certs found in $cert_path"
  exit 1
else
  rm -rf $repo_cert_dir
  mkdir -p $repo_cert_dir
  cp $cert_path/* $repo_cert_dir/
  files=$(cd $repo_cert_dir; echo *)
  echo "THIS DIRECTORY AND FILES ARE AUTO-GENERATED AND SHOULD NOT BE CHECKED IN!" \
    > $repo_cert_dir/notice.txt
  echo "Cert files ($files) copied to $repo_cert_dir"
  rm -rf $clone_dir
fi
