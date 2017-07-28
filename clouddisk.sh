#!/bin/bash

casperjs --cookies-file=./baidu.cookie molecule.js ${1} "${2}" "${3}"
