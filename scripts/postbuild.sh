#!/bin/sh
for a in dist/*.cjs; do mv -- "$a" "${a%.cjs}.js"; done