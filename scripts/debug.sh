#!/bin/sh


a=$(ls ./node_modules/)
echo $a
echo "\n"


b=$(ls ./node_modules/@linkurious)
echo $b
echo "\n"

c=$(ls ./node_modules/@linkurious/ogma)
echo $c
echo "\n"

d=$(cat ./node_modules/@linkurious/ogma/package.json)
echo $d
echo "\n"