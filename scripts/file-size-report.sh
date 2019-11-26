#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset
# set -o xtrace

cd "./$(git rev-parse --show-cdup)"

dist_dir=dist

ref_dir=.build/reference
ref_dist_dir=$ref_dir/dist
ref_info=$ref_dir/REFERENCE_BUILD_INFO

extra_args=()
if [[ -d "$ref_dist_dir" ]]; then
  echo "Comparing $dist_dir to $ref_dist_dir"
  cat $ref_info
  file-size-report $dist_dir --reference=$ref_dist_dir "$@"
else
  echo "Getting sizes for $dist_dir directory"
  file-size-report $dist_dir "$@"
fi
