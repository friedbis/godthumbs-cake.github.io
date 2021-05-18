#!/bin/bash

basedir=$(dirname $0)/../docs
postdir=$basedir/_posts

latestmdfile=$(ls -lrt $postdir |tail -1 |awk '{print $9;}')

newmdfile=$postdir/$(date +%Y-%m-%d)

echo -n "title? ";read i
newmdfile=$newmdfile-$(echo -n $i |sed -e 's/ /-/g').md
echo "generating $newmdfile..."
echo "relating $latestmdfile..."
cp $postdir/$latestmdfile $newmdfile
echo "done"

exit 0
