#!/bin/bash

casperjs \
    --disk-cache=true \
    --load-images=true \
    --web-security=false \
    --cookies-file=./.baidu.cookie \
    --disk-cache-path=./.diskCache \
    --offline-storage-path=./.offlineStorage \
    molecule.js "${1}" "${2}" "${3}"
