#!/bin/bash

basedir=$(dirname $0)/../docs
postdir=$basedir/_posts

latestmdfile=$(ls -lrt $postdir |tail -1 |awk '{print $9;}')

newmdfile=$postdir/$(date +%Y-%m-%d)

args=
if [ "x$1" != "x" ];
then
    args=$1
fi

if [ "x--title" == "x${args}" ];
then
    echo -n "main title of file is..."
    i="$(echo -n $2 |sed -e 's/_/ /g')"
    echo $i
else
    echo -n "title? ";read i
fi
newmdfile=$newmdfile-$(echo -n $i |sed -e 's/ /-/g').md
echo "generating $newmdfile..."
echo "relating $latestmdfile..."
cp $postdir/$latestmdfile $newmdfile
echo "done"

exit 0
